import assert from 'node:assert';
import { describe, it } from 'node:test';

interface QueuedExpense {
  id: string;
  groupId: string;
  paidBy: string;
  baseAmount: number;
  splits: Record<string, number>;
  balanceSynced: boolean;
}

interface GroupState {
  id: string;
  balances: Record<string, number>;
  processedExpenseIds: string[];
}

function processOfflineQueue(
  group: GroupState,
  expenses: QueuedExpense[]
): { group: GroupState; expenses: QueuedExpense[]; syncedCount: number } {
  let balances = { ...group.balances };
  let processed = [...group.processedExpenseIds];
  let syncedCount = 0;

  const updatedExpenses = expenses.map(exp => {
    if (exp.balanceSynced) {
      return exp;
    }

    if (!processed.includes(exp.id)) {
      balances[exp.paidBy] = (balances[exp.paidBy] ?? 0) + exp.baseAmount;
      for (const [uid, share] of Object.entries(exp.splits)) {
        balances[uid] = (balances[uid] ?? 0) - share;
      }
      processed.push(exp.id);
    }

    syncedCount++;
    return {
      ...exp,
      balanceSynced: true,
    };
  });

  return {
    group: {
      ...group,
      balances,
      processedExpenseIds: processed,
    },
    expenses: updatedExpenses,
    syncedCount,
  };
}

describe('Offline Mutation Queue Engine', () => {
  it('processes queued offline expenses upon reconnection and flips balanceSynced', () => {
    const group: GroupState = {
      id: 'grp-1',
      balances: { alice: 0, bob: 0 },
      processedExpenseIds: [],
    };

    const queuedExpenses: QueuedExpense[] = [
      {
        id: 'exp-offline-1',
        groupId: 'grp-1',
        paidBy: 'alice',
        baseAmount: 2000,
        splits: { alice: 1000, bob: 1000 },
        balanceSynced: false,
      },
      {
        id: 'exp-offline-2',
        groupId: 'grp-1',
        paidBy: 'bob',
        baseAmount: 1000,
        splits: { alice: 500, bob: 500 },
        balanceSynced: false,
      },
    ];

    const result = processOfflineQueue(group, queuedExpenses);

    assert.strictEqual(result.syncedCount, 2);
    assert.ok(result.expenses.every(e => e.balanceSynced === true));
    assert.strictEqual(result.group.balances.alice, 500);
    assert.strictEqual(result.group.balances.bob, -500);
    assert.deepStrictEqual(result.group.processedExpenseIds, [
      'exp-offline-1',
      'exp-offline-2',
    ]);
  });

  it('guarantees idempotency when an expense was already processed', () => {
    const group: GroupState = {
      id: 'grp-1',
      balances: { alice: 1000, bob: -1000 },
      processedExpenseIds: ['exp-already-synced'],
    };

    const duplicateQueue: QueuedExpense[] = [
      {
        id: 'exp-already-synced',
        groupId: 'grp-1',
        paidBy: 'alice',
        baseAmount: 2000,
        splits: { alice: 1000, bob: 1000 },
        balanceSynced: false,
      },
    ];

    const result = processOfflineQueue(group, duplicateQueue);

    assert.strictEqual(result.group.balances.alice, 1000);
    assert.strictEqual(result.group.balances.bob, -1000);
    assert.strictEqual(result.group.processedExpenseIds.length, 1);
  });

  it('handles empty queue with zero mutations without altering group state', () => {
    const group: GroupState = {
      id: 'grp-1',
      balances: { alice: 300, bob: -300 },
      processedExpenseIds: ['exp-1'],
    };

    const result = processOfflineQueue(group, []);

    assert.strictEqual(result.syncedCount, 0);
    assert.deepStrictEqual(result.group, group);
  });
});
