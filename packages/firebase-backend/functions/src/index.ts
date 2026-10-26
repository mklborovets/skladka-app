import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

initializeApp();
const db = getFirestore();

interface ExpenseData {
  groupId: string;
  title: string;
  createdBy: string;
  paidBy: string;
  amount: number;
  currency: string;
  exchangeRateToBase: number;
  baseAmount: number;
  splitType: string;
  splits: Record<string, number>;
  hasReceipt: boolean;
  balanceSynced: boolean;
  createdAt: number;
}

interface GroupData {
  name: string;
  baseCurrency: string;
  memberIds: string[];
  balances: Record<string, number>;
  processedExpenseIds: string[];
  updatedAt: number;
}

interface InviteData {
  token: string;
  groupId: string;
  createdBy: string;
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

export const onExpenseWrite = onDocumentWritten(
  'groups/{groupId}/expenses/{expenseId}',
  async event => {
    const groupId = event.params.groupId;
    const expenseId = event.params.expenseId;

    const beforeData = event.data?.before.data() as ExpenseData | undefined;
    const afterData = event.data?.after.data() as ExpenseData | undefined;

    if (!afterData && !beforeData) {
      return;
    }

    const groupRef = db.collection('groups').doc(groupId);

    await db.runTransaction(async transaction => {
      const groupDoc = await transaction.get(groupRef);
      if (!groupDoc.exists) {
        return;
      }

      const groupData = groupDoc.data() as GroupData;
      let balances = { ...(groupData.balances || {}) };
      let processed = [...(groupData.processedExpenseIds || [])];

      if (!beforeData && afterData) {
        if (!processed.includes(expenseId)) {
          balances = applyExpenseToBalances(
            balances,
            afterData.paidBy,
            afterData.baseAmount,
            afterData.splits || {},
            false
          );
          processed.push(expenseId);

          transaction.update(groupRef, {
            balances,
            processedExpenseIds: processed,
            updatedAt: Date.now(),
          });

          if (!afterData.balanceSynced) {
            transaction.update(event.data!.after.ref, {
              balanceSynced: true,
            });
          }
        }
      } else if (beforeData && !afterData) {
        if (processed.includes(expenseId)) {
          balances = applyExpenseToBalances(
            balances,
            beforeData.paidBy,
            beforeData.baseAmount,
            beforeData.splits || {},
            true
          );
          processed = processed.filter(id => id !== expenseId);

          transaction.update(groupRef, {
            balances,
            processedExpenseIds: processed,
            updatedAt: Date.now(),
          });
        }
      } else if (beforeData && afterData) {
        if (processed.includes(expenseId)) {
          balances = applyExpenseToBalances(
            balances,
            beforeData.paidBy,
            beforeData.baseAmount,
            beforeData.splits || {},
            true
          );
          balances = applyExpenseToBalances(
            balances,
            afterData.paidBy,
            afterData.baseAmount,
            afterData.splits || {},
            false
          );

          transaction.update(groupRef, {
            balances,
            updatedAt: Date.now(),
          });

          if (!afterData.balanceSynced) {
            transaction.update(event.data!.after.ref, {
              balanceSynced: true,
            });
          }
        }
      }
    });
  }
);

export const acceptInvite = onCall(async request => {
  if (!request.auth) {
    throw new HttpsError(
      'unauthenticated',
      'Authentication is required to accept an invite'
    );
  }

  const token = request.data?.token;
  if (!token || typeof token !== 'string') {
    throw new HttpsError(
      'invalid-argument',
      'A valid invitation token must be provided'
    );
  }

  const userId = request.auth.uid;
  const inviteRef = db.collection('invites').doc(token);

  return db.runTransaction(async transaction => {
    const inviteDoc = await transaction.get(inviteRef);
    if (!inviteDoc.exists) {
      throw new HttpsError('not-found', 'Invitation token does not exist');
    }

    const inviteData = inviteDoc.data() as InviteData;
    if (inviteData.isUsed) {
      throw new HttpsError(
        'failed-precondition',
        'Invitation token has already been redeemed'
      );
    }

    if (Date.now() > inviteData.expiresAt) {
      throw new HttpsError(
        'deadline-exceeded',
        'Invitation token has expired'
      );
    }

    const groupRef = db.collection('groups').doc(inviteData.groupId);
    const groupDoc = await transaction.get(groupRef);
    if (!groupDoc.exists) {
      throw new HttpsError('not-found', 'Target group no longer exists');
    }

    const groupData = groupDoc.data() as GroupData;
    if (groupData.memberIds.includes(userId)) {
      return {
        success: true,
        alreadyMember: true,
        groupId: inviteData.groupId,
      };
    }

    if (groupData.memberIds.length >= 10) {
      throw new HttpsError(
        'resource-exhausted',
        'Group has reached maximum limit of 10 members'
      );
    }

    transaction.update(inviteRef, {
      isUsed: true,
      usedBy: userId,
    });

    transaction.update(groupRef, {
      memberIds: [...groupData.memberIds, userId],
      balances: {
        ...(groupData.balances || {}),
        [userId]: 0,
      },
      lastUsedInvite: token,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      alreadyMember: false,
      groupId: inviteData.groupId,
    };
  });
});
