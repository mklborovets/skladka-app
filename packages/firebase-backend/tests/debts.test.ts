import assert from 'node:assert';
import { describe, it } from 'node:test';

interface DebtTransfer {
  from: string;
  to: string;
  amount: number;
}

interface ParticipantBalance {
  userId: string;
  amount: number;
}

function minimizeDebts(
  balances: Record<string, number>
): DebtTransfer[] {
  const debtors: ParticipantBalance[] = [];
  const creditors: ParticipantBalance[] = [];

  for (const [userId, balance] of Object.entries(balances)) {
    if (balance < 0) {
      debtors.push({ userId, amount: -balance });
    } else if (balance > 0) {
      creditors.push({ userId, amount: balance });
    }
  }

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transfers: DebtTransfer[] = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (
    debtorIndex < debtors.length &&
    creditorIndex < creditors.length
  ) {
    const currentDebtor = debtors[debtorIndex];
    const currentCreditor = creditors[creditorIndex];

    const settledAmount = Math.min(
      currentDebtor.amount,
      currentCreditor.amount
    );

    if (settledAmount > 0) {
      transfers.push({
        from: currentDebtor.userId,
        to: currentCreditor.userId,
        amount: settledAmount,
      });

      currentDebtor.amount -= settledAmount;
      currentCreditor.amount -= settledAmount;
    }

    if (currentDebtor.amount === 0) {
      debtorIndex++;
    }
    if (currentCreditor.amount === 0) {
      creditorIndex++;
    }
  }

  return transfers;
}

describe('Greedy Debt Minimization Algorithm', () => {
  it('returns empty array when everyone is settled up (all 0 balances)', () => {
    const balances = { alice: 0, bob: 0, charlie: 0 };
    const transfers = minimizeDebts(balances);
    assert.strictEqual(transfers.length, 0);
  });

  it('settles direct two-party debt', () => {
    const balances = { alice: -2500, bob: 2500 };
    const transfers = minimizeDebts(balances);

    assert.strictEqual(transfers.length, 1);
    assert.deepStrictEqual(transfers[0], {
      from: 'alice',
      to: 'bob',
      amount: 2500,
    });
  });

  it('eliminates intermediary in transitive debt (Alice owes Bob, Bob owes Charlie)', () => {
    const balances = {
      alice: -1000,
      bob: 0,
      charlie: 1000,
    };
    const transfers = minimizeDebts(balances);

    assert.strictEqual(transfers.length, 1);
    assert.deepStrictEqual(transfers[0], {
      from: 'alice',
      to: 'charlie',
      amount: 1000,
    });
  });

  it('correctly simplifies multi-party debts with minimal transactions', () => {
    const balances = {
      alice: -4000,
      bob: -2000,
      charlie: 1000,
      david: 5000,
    };

    const transfers = minimizeDebts(balances);

    assert.ok(transfers.length <= 3);

    const netImpact: Record<string, number> = {
      alice: 0,
      bob: 0,
      charlie: 0,
      david: 0,
    };

    for (const t of transfers) {
      assert.ok(t.amount > 0);
      netImpact[t.from] -= t.amount;
      netImpact[t.to] += t.amount;
    }

    for (const [uid, expected] of Object.entries(balances)) {
      assert.strictEqual(netImpact[uid], expected);
    }
  });

  it('handles unequal multi-creditor settlements', () => {
    const balances = {
      alice: -6000,
      bob: 3000,
      charlie: 3000,
    };

    const transfers = minimizeDebts(balances);

    assert.strictEqual(transfers.length, 2);
    assert.strictEqual(transfers[0].from, 'alice');
    assert.strictEqual(transfers[1].from, 'alice');

    const totalPaid = transfers.reduce((sum, t) => sum + t.amount, 0);
    assert.strictEqual(totalPaid, 6000);
  });
});
