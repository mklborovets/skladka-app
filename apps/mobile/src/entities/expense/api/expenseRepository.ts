import firestore from '@react-native-firebase/firestore';
import { ExpenseDoc } from '../model/types';

export const expenseRepository = {
  subscribeToGroupExpenses(
    groupId: string,
    onUpdate: (expenses: ExpenseDoc[]) => void,
    onError: (error: Error) => void
  ): () => void {
    return firestore()
      .collection('groups')
      .doc(groupId)
      .collection('expenses')
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        { includeMetadataChanges: true },
        snapshot => {
          const items: ExpenseDoc[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              groupId: data.groupId || groupId,
              title: data.title || '',
              createdBy: data.createdBy || '',
              paidBy: data.paidBy || '',
              amount: typeof data.amount === 'number' ? data.amount : 0,
              currency: data.currency || 'USD',
              exchangeRateToBase:
                typeof data.exchangeRateToBase === 'number'
                  ? data.exchangeRateToBase
                  : 1.0,
              baseAmount:
                typeof data.baseAmount === 'number'
                  ? data.baseAmount
                  : data.amount || 0,
              splitType: data.splitType || 'EQUAL',
              splits: data.splits || {},
              hasReceipt: Boolean(data.hasReceipt),
              balanceSynced: Boolean(data.balanceSynced),
              hasPendingWrites: doc.metadata.hasPendingWrites,
              createdAt:
                typeof data.createdAt === 'number'
                  ? data.createdAt
                  : Date.now(),
            };
          });
          onUpdate(items);
        },
        error => {
          onError(error);
        }
      );
  },

  async getExpenseById(
    groupId: string,
    expenseId: string
  ): Promise<ExpenseDoc | null> {
    const doc = await firestore()
      .collection('groups')
      .doc(groupId)
      .collection('expenses')
      .doc(expenseId)
      .get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data();
    if (!data) {
      return null;
    }

    return {
      id: doc.id,
      groupId: data.groupId || groupId,
      title: data.title || '',
      createdBy: data.createdBy || '',
      paidBy: data.paidBy || '',
      amount: typeof data.amount === 'number' ? data.amount : 0,
      currency: data.currency || 'USD',
      exchangeRateToBase:
        typeof data.exchangeRateToBase === 'number'
          ? data.exchangeRateToBase
          : 1.0,
      baseAmount:
        typeof data.baseAmount === 'number'
          ? data.baseAmount
          : data.amount || 0,
      splitType: data.splitType || 'EQUAL',
      splits: data.splits || {},
      hasReceipt: Boolean(data.hasReceipt),
      balanceSynced: Boolean(data.balanceSynced),
      hasPendingWrites: doc.metadata.hasPendingWrites,
      createdAt:
        typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
    };
  },
};
