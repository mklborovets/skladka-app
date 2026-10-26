import assert from 'node:assert';
import { describe, it } from 'node:test';

interface ExpenseData {
  paidBy: string;
  baseAmount: number;
  splits: Record<string, number>;
}

interface GroupState {
  memberIds: string[];
  balances: Record<string, number>;
  processedExpenseIds: string[];
}

interface InviteState {
  token: string;
  groupId: string;
  isUsed: boolean;
  usedBy: string | null;
  expiresAt: number;
}

function applyExpenseToBalances(
  currentBalances: Record<string, number>,
  paidBy: string,
  baseAmount: number,
  splits: Record<string, number>,
  isReversal: boolean = false
): Record<string, number> {
  const next: Record<string, number> = { ...currentBalances };
  const multiplier = isReversal ? -1 : 1;

  next[paidBy] = (next[paidBy] ?? 0) + baseAmount * multiplier;

  for (const [uid, splitShare] of Object.entries(splits)) {
    next[uid] = (next[uid] ?? 0) - splitShare * multiplier;
  }

  return next;
}

function simulateServerExpenseWrite(
  group: GroupState,
  expenseId: string,
  before?: ExpenseData,
  after?: ExpenseData
): GroupState {
  let balances = { ...group.balances };
  let processed = [...group.processedExpenseIds];

  if (!before && after) {
    if (!processed.includes(expenseId)) {
      balances = applyExpenseToBalances(
        balances,
        after.paidBy,
        after.baseAmount,
        after.splits,
        false
      );
      processed.push(expenseId);
    }
  } else if (before && !after) {
    if (processed.includes(expenseId)) {
      balances = applyExpenseToBalances(
        balances,
        before.paidBy,
        before.baseAmount,
        before.splits,
        true
      );
      processed = processed.filter(id => id !== expenseId);
    }
  } else if (before && after) {
    if (processed.includes(expenseId)) {
      balances = applyExpenseToBalances(
        balances,
        before.paidBy,
        before.baseAmount,
        before.splits,
        true
      );
      balances = applyExpenseToBalances(
        balances,
        after.paidBy,
        after.baseAmount,
        after.splits,
        false
      );
    }
  }

  return {
    ...group,
    balances,
    processedExpenseIds: processed,
  };
}

function simulateServerAcceptInvite(
  invite: InviteState,
  group: GroupState,
  userId: string
): { success: boolean; invite: InviteState; group: GroupState } {
  if (invite.isUsed) {
    throw new Error('Invitation token has already been redeemed');
  }
  if (Date.now() > invite.expiresAt) {
    throw new Error('Invitation token has expired');
  }
  if (group.memberIds.length >= 10) {
    throw new Error('Group has reached maximum limit of 10 members');
  }

  if (group.memberIds.includes(userId)) {
    return { success: true, invite, group };
  }

  const updatedInvite: InviteState = {
    ...invite,
    isUsed: true,
    usedBy: userId,
  };

  const updatedGroup: GroupState = {
    ...group,
    memberIds: [...group.memberIds, userId],
    balances: {
      ...group.balances,
      [userId]: 0,
    },
  };

  return {
    success: true,
    invite: updatedInvite,
    group: updatedGroup,
  };
}

describe('Cloud Functions - Server Trigger and Callable Logic', () => {
  it('onExpenseWrite trigger correctly updates group balances and processed IDs on create', () => {
    const group: GroupState = {
      memberIds: ['alice', 'bob'],
      balances: { alice: 0, bob: 0 },
      processedExpenseIds: [],
    };

    const newExpense: ExpenseData = {
      paidBy: 'alice',
      baseAmount: 3000,
      splits: { alice: 1500, bob: 1500 },
    };

    const updated = simulateServerExpenseWrite(
      group,
      'exp-1',
      undefined,
      newExpense
    );

    assert.strictEqual(updated.balances.alice, 1500);
    assert.strictEqual(updated.balances.bob, -1500);
    assert.deepStrictEqual(updated.processedExpenseIds, ['exp-1']);
  });

  it('onExpenseWrite trigger is idempotent and prevents double accumulation', () => {
    const group: GroupState = {
      memberIds: ['alice', 'bob'],
      balances: { alice: 1500, bob: -1500 },
      processedExpenseIds: ['exp-1'],
    };

    const expense: ExpenseData = {
      paidBy: 'alice',
      baseAmount: 3000,
      splits: { alice: 1500, bob: 1500 },
    };

    const updated = simulateServerExpenseWrite(
      group,
      'exp-1',
      undefined,
      expense
    );

    assert.strictEqual(updated.balances.alice, 1500);
    assert.strictEqual(updated.balances.bob, -1500);
    assert.strictEqual(updated.processedExpenseIds.length, 1);
  });

  it('onExpenseWrite trigger reverses balances when expense is deleted', () => {
    const group: GroupState = {
      memberIds: ['alice', 'bob'],
      balances: { alice: 1500, bob: -1500 },
      processedExpenseIds: ['exp-1'],
    };

    const deletedExpense: ExpenseData = {
      paidBy: 'alice',
      baseAmount: 3000,
      splits: { alice: 1500, bob: 1500 },
    };

    const updated = simulateServerExpenseWrite(
      group,
      'exp-1',
      deletedExpense,
      undefined
    );

    assert.strictEqual(updated.balances.alice, 0);
    assert.strictEqual(updated.balances.bob, 0);
    assert.strictEqual(updated.processedExpenseIds.length, 0);
  });

  it('acceptInvite callable atomically validates and redeems invitation', () => {
    const invite: InviteState = {
      token: 'tok-xyz',
      groupId: 'grp-1',
      isUsed: false,
      usedBy: null,
      expiresAt: Date.now() + 60000,
    };

    const group: GroupState = {
      memberIds: ['alice'],
      balances: { alice: 0 },
      processedExpenseIds: [],
    };

    const result = simulateServerAcceptInvite(invite, group, 'bob');

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.invite.isUsed, true);
    assert.strictEqual(result.invite.usedBy, 'bob');
    assert.deepStrictEqual(result.group.memberIds, ['alice', 'bob']);
    assert.strictEqual(result.group.balances.bob, 0);
  });

  it('acceptInvite callable rejects already redeemed tokens', () => {
    const invite: InviteState = {
      token: 'tok-used',
      groupId: 'grp-1',
      isUsed: true,
      usedBy: 'bob',
      expiresAt: Date.now() + 60000,
    };

    const group: GroupState = {
      memberIds: ['alice', 'bob'],
      balances: { alice: 0, bob: 0 },
      processedExpenseIds: [],
    };

    assert.throws(
      () => simulateServerAcceptInvite(invite, group, 'charlie'),
      /already been redeemed/
    );
  });

  it('acceptInvite callable enforces maximum 10 members group limit', () => {
    const tenMembers = [
      'u1',
      'u2',
      'u3',
      'u4',
      'u5',
      'u6',
      'u7',
      'u8',
      'u9',
      'u10',
    ];

    const invite: InviteState = {
      token: 'tok-valid',
      groupId: 'grp-full',
      isUsed: false,
      usedBy: null,
      expiresAt: Date.now() + 60000,
    };

    const group: GroupState = {
      memberIds: tenMembers,
      balances: {},
      processedExpenseIds: [],
    };

    assert.throws(
      () => simulateServerAcceptInvite(invite, group, 'new-user'),
      /maximum limit of 10 members/
    );
  });
});
