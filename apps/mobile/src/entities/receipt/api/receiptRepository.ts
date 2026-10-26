import firestore from '@react-native-firebase/firestore';
import { ReceiptDoc } from '../model/types';

export const receiptRepository = {
  async saveReceipt(groupId: string, receipt: ReceiptDoc): Promise<void> {
    await firestore()
      .collection('groups')
      .doc(groupId)
      .collection('receipts')
      .doc(receipt.expenseId)
      .set(receipt);
  },

  async getReceipt(
    groupId: string,
    expenseId: string
  ): Promise<ReceiptDoc | null> {
    const doc = await firestore()
      .collection('groups')
      .doc(groupId)
      .collection('receipts')
      .doc(expenseId)
      .get();

    if (!doc.exists) {
      return null;
    }

    return doc.data() as ReceiptDoc;
  },
};
