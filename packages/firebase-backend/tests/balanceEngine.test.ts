import assert from 'node:assert';
import { describe, it } from 'node:test';

function computeUpdatedBalances(
  currentBalances: Record<string, number>,
  paidBy: string,
  baseAmount: number,
  splits: Record<string, number>
): Record<string, number> {
  const next: Record<string, number> = { ...currentBalances };
  next[paidBy] = (next[paidBy] ?? 0) + baseAmount;

  for (const [uid, splitShare] of Object.entries(splits)) {
    next[uid] = (next[uid] ?? 0) - splitShare;
  }
  return next;
}

describe('Balance Engine - Pure idempotent balance computation', () => {
  it('correctly calculates balances for 2 users splitting equally', () => {
    const initialBalances = { alice: 0, bob: 0 };
    const paidBy = 'alice';
    const baseAmount = 2000;
    const splits = { alice: 1000, bob: 1000 };

    const result = computeUpdatedBalances(
      initialBalances,
      paidBy,
      baseAmount,
      splits
    );

    assert.strictEqual(result.alice, 1000);
    assert.strictEqual(result.bob, -1000);
    assert.strictEqual(result.alice + result.bob, 0);
  });

  it('correctly accumulates balances across multiple successive expenses', () => {
    let balances: Record<string, number> = { alice: 0, bob: 0, charlie: 0 };

    balances = computeUpdatedBalances(balances, 'alice', 3000, {
      alice: 1000,
      bob: 1000,
      charlie: 1000,
    });
    assert.strictEqual(balances.alice, 2000);
    assert.strictEqual(balances.bob, -1000);
    assert.strictEqual(balances.charlie, -1000);

    balances = computeUpdatedBalances(balances, 'bob', 1500, {
      alice: 500,
      bob: 500,
      charlie: 500,
    });
    assert.strictEqual(balances.alice, 1500);
    assert.strictEqual(balances.bob, 0);
    assert.strictEqual(balances.charlie, -1500);

    const total = Object.values(balances).reduce((sum, v) => sum + v, 0);
    assert.strictEqual(total, 0);
  });

  it('supports unequal shares and maintains zero-sum invariant', () => {
    const initial = { alice: 0, bob: 0, charlie: 0 };
    const result = computeUpdatedBalances(initial, 'charlie', 6000, {
      alice: 3000,
      bob: 2000,
      charlie: 1000,
    });

    assert.strictEqual(result.alice, -3000);
    assert.strictEqual(result.bob, -2000);
    assert.strictEqual(result.charlie, 5000);

    const sum = Object.values(result).reduce((acc, v) => acc + v, 0);
    assert.strictEqual(sum, 0);
  });

  it('handles member joining with no prior balance entry', () => {
    const initial = { alice: 1000, bob: -1000 };
    const result = computeUpdatedBalances(initial, 'alice', 3000, {
      alice: 1000,
      bob: 1000,
      newbie: 1000,
    });

    assert.strictEqual(result.alice, 3000);
    assert.strictEqual(result.bob, -2000);
    assert.strictEqual(result.newbie, -1000);

    const total = Object.values(result).reduce((acc, v) => acc + v, 0);
    assert.strictEqual(total, 0);
  });
});
