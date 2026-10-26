import firestore from '@react-native-firebase/firestore';
import { ExpenseDoc } from '@entities/expense';
import { computeUpdatedBalances } from '../model/balanceEngine';
import { GroupDoc } from '../model/types';

export async function syncExpenseBalance(
  groupId: string,
  expenseId: string
): Promise<boolean> {
  return firestore().runTransaction(async transaction => {
    const groupRef = firestore().collection('groups').doc(groupId);
    const groupDoc = await transaction.get(groupRef);
    if (!groupDoc.exists) {
      throw new Error('Group not found');
    }

    const groupData = groupDoc.data() as GroupDoc;
    const processed = groupData.processedExpenseIds || [];
    if (processed.includes(expenseId)) {
      return true;
    }

    const expenseRef = firestore()
      .collection('groups')
      .doc(groupId)
      .collection('expenses')
      .doc(expenseId);
    const expenseDoc = await transaction.get(expenseRef);
    if (!expenseDoc.exists) {
      throw new Error('Expense not found');
    }

    const expenseData = expenseDoc.data() as ExpenseDoc;
    const nextBalances = computeUpdatedBalances(
      groupData.balances || {},
      expenseData.paidBy,
      expenseData.baseAmount,
      expenseData.splits || {}
    );

    transaction.update(groupRef, {
      balances: nextBalances,
      processedExpenseIds: [...processed, expenseId],
      updatedAt: Date.now(),
    });

    transaction.update(expenseRef, {
      balanceSynced: true,
    });

    return true;
  });
}
