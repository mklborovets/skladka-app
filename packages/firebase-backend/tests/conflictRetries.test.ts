import assert from 'node:assert';
import { describe, it } from 'node:test';

interface GroupDocState {
  id: string;
  version: number;
  balances: Record<string, number>;
  processedExpenseIds: string[];
}

interface ExpenseMutation {
  id: string;
  paidBy: string;
  baseAmount: number;
  splits: Record<string, number>;
}

class SimulatedFirestoreDatabase {
  private group: GroupDocState;

  constructor(initialGroup: GroupDocState) {
    this.group = { ...initialGroup };
  }

  getGroupSnapshot(): GroupDocState {
    return JSON.parse(JSON.stringify(this.group));
  }

  async runTransaction<T>(
    operation: (tx: {
      get: () => Promise<GroupDocState>;
      update: (updater: (prev: GroupDocState) => GroupDocState) => void;
    }) => Promise<T>,
    maxRetries = 5
  ): Promise<T> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      let readVersion = -1;
      let pendingUpdate: ((prev: GroupDocState) => GroupDocState) | null = null;

      const tx = {
        get: async () => {
          const snapshot = this.getGroupSnapshot();
          readVersion = snapshot.version;
          return snapshot;
        },
        update: (updater: (prev: GroupDocState) => GroupDocState) => {
          pendingUpdate = updater;
        },
      };

      try {
        const result = await operation(tx);

        if (pendingUpdate) {
          if (this.group.version !== readVersion) {
            continue;
          }

          const nextState = (pendingUpdate as (prev: GroupDocState) => GroupDocState)(
            this.group
          );
          nextState.version = this.group.version + 1;
          this.group = nextState;
        }

        return result;
      } catch (err) {
        if (attempt === maxRetries - 1) {
          throw err;
        }
      }
    }

    throw new Error('Transaction exceeded maximum conflict retries');
  }
}

function applyExpenseBalances(
  balances: Record<string, number>,
  paidBy: string,
  baseAmount: number,
  splits: Record<string, number>
): Record<string, number> {
  const next: Record<string, number> = { ...balances };
  next[paidBy] = (next[paidBy] ?? 0) + baseAmount;

  for (const [uid, share] of Object.entries(splits)) {
    next[uid] = (next[uid] ?? 0) - share;
  }

  return next;
}

describe('Firestore Concurrent Conflict Retries Engine', () => {
  it('automatically retries conflicting transactions and applies both expenses without lost updates', async () => {
    const db = new SimulatedFirestoreDatabase({
      id: 'grp-1',
      version: 1,
      balances: { alice: 0, bob: 0, charlie: 0 },
      processedExpenseIds: [],
    });

    const expenseA: ExpenseMutation = {
      id: 'exp-A',
      paidBy: 'alice',
      baseAmount: 3000,
      splits: { alice: 1000, bob: 1000, charlie: 1000 },
    };

    const expenseB: ExpenseMutation = {
      id: 'exp-B',
      paidBy: 'bob',
      baseAmount: 1500,
      splits: { alice: 500, bob: 500, charlie: 500 },
    };

    const executeClientMutation = async (
      expense: ExpenseMutation,
      artificialDelayMs: number
    ) => {
      return db.runTransaction(async tx => {
        const group = await tx.get();

        if (artificialDelayMs > 0) {
          await new Promise(res => setTimeout(res, artificialDelayMs));
        }

        if (group.processedExpenseIds.includes(expense.id)) {
          return group;
        }

        const nextBalances = applyExpenseBalances(
          group.balances,
          expense.paidBy,
          expense.baseAmount,
          expense.splits
        );

        tx.update(prev => ({
          ...prev,
          balances: nextBalances,
          processedExpenseIds: [...prev.processedExpenseIds, expense.id],
        }));

        return group;
      });
    };

    await Promise.all([
      executeClientMutation(expenseA, 30),
      executeClientMutation(expenseB, 10),
    ]);

    const finalGroup = db.getGroupSnapshot();

    assert.strictEqual(finalGroup.version, 3);
    assert.strictEqual(finalGroup.processedExpenseIds.length, 2);
    assert.ok(finalGroup.processedExpenseIds.includes('exp-A'));
    assert.ok(finalGroup.processedExpenseIds.includes('exp-B'));

    assert.strictEqual(finalGroup.balances.alice, 1500);
    assert.strictEqual(finalGroup.balances.bob, 0);
    assert.strictEqual(finalGroup.balances.charlie, -1500);

    const zeroSum = Object.values(finalGroup.balances).reduce(
      (sum, val) => sum + val,
      0
    );
    assert.strictEqual(zeroSum, 0);
  });

  it('guarantees idempotency when an already committed transaction is retried', async () => {
    const db = new SimulatedFirestoreDatabase({
      id: 'grp-1',
      version: 1,
      balances: { alice: 2000, bob: -2000 },
      processedExpenseIds: ['exp-done'],
    });

    const expenseDuplicate: ExpenseMutation = {
      id: 'exp-done',
      paidBy: 'alice',
      baseAmount: 4000,
      splits: { alice: 2000, bob: 2000 },
    };

    await db.runTransaction(async tx => {
      const group = await tx.get();
      if (group.processedExpenseIds.includes(expenseDuplicate.id)) {
        return group;
      }

      const nextBalances = applyExpenseBalances(
        group.balances,
        expenseDuplicate.paidBy,
        expenseDuplicate.baseAmount,
        expenseDuplicate.splits
      );

      tx.update(prev => ({
        ...prev,
        balances: nextBalances,
        processedExpenseIds: [...prev.processedExpenseIds, expenseDuplicate.id],
      }));
    });

    const finalGroup = db.getGroupSnapshot();
    assert.strictEqual(finalGroup.version, 1);
    assert.strictEqual(finalGroup.balances.alice, 2000);
    assert.strictEqual(finalGroup.balances.bob, -2000);
  });
});
