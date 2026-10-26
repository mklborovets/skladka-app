import { useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import { GroupDoc, groupRepository } from '@entities/group';
import { useAuth } from '@app/providers';
import { ReceiptTooLargeError, processReceiptImage } from '@shared/lib/image';
import { MemberListItem } from '../ui/MembersSplitList';
import { SplitType, computeSplits } from './splitCalculator';

export interface CreateExpenseFormState {
  title: string;
  amountInput: string;
  currency: string;
  splitType: SplitType;
  receiptBase64: string | null;
}

export interface UseCreateExpenseFormReturn {
  group: GroupDoc | null;
  formState: CreateExpenseFormState;
  splitPreview: MemberListItem[];
  totalAmountMinor: number;
  isSubmitting: boolean;
  isCompressingReceipt: boolean;
  error: string | null;
  setTitle: (title: string) => void;
  setAmount: (amount: string) => void;
  setCurrency: (currency: string) => void;
  setSplitType: (type: SplitType) => void;
  updateMemberShare: (userId: string, newShare: number) => void;
  attachReceipt: (sourceUri: string | null) => Promise<void>;
  submitExpense: () => Promise<string | null>;
}

export const useCreateExpenseForm = (
  groupId: string,
  onSuccess?: (expenseId: string) => void
): UseCreateExpenseFormReturn => {
  const { user } = useAuth();
  const [group, setGroup] = useState<GroupDoc | null>(null);

  const [title, setTitle] = useState<string>('');
  const [amountInput, setAmountInput] = useState<string>('');
  const [currency, setCurrency] = useState<string>('USD');
  const [splitType, setSplitType] = useState<SplitType>('EQUAL');
  const [memberValues, setMemberValues] = useState<Record<string, number>>({});
  const [receiptBase64, setReceiptBase64] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCompressingReceipt, setIsCompressingReceipt] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    groupRepository.getGroupById(groupId).then(g => {
      if (!isMounted || !g) return;
      setGroup(g);
      setCurrency(g.baseCurrency);

      const initialValues: Record<string, number> = {};
      g.memberIds.forEach(uid => {
        initialValues[uid] = 1;
      });
      setMemberValues(initialValues);
    });
    return () => {
      isMounted = false;
    };
  }, [groupId]);

  const totalAmountMinor = Math.round((parseFloat(amountInput) || 0) * 100);

  const memberIds = group ? group.memberIds : [];
  const { splits, isValid, errorMessage } = computeSplits(
    splitType,
    totalAmountMinor,
    memberIds,
    memberValues
  );

  const splitPreview: MemberListItem[] = memberIds.map(uid => ({
    userId: uid,
    share: memberValues[uid] ?? (splitType === 'SHARES' ? 1 : 0),
    calculatedAmount: splits[uid] ?? 0,
  }));

  const updateMemberShare = (userId: string, newShare: number) => {
    setMemberValues(prev => ({
      ...prev,
      [userId]: newShare,
    }));
  };

  const attachReceipt = async (sourceUri: string | null): Promise<void> => {
    if (!sourceUri) {
      setReceiptBase64(null);
      return;
    }

    try {
      setIsCompressingReceipt(true);
      setError(null);
      const processed = await processReceiptImage(sourceUri);
      setReceiptBase64(processed.base64Data);
    } catch (err: unknown) {
      if (err instanceof ReceiptTooLargeError) {
        setError(err.message);
      } else {
        setError('Failed to compress receipt image');
      }
    } finally {
      setIsCompressingReceipt(false);
    }
  };

  const submitExpense = async (): Promise<string | null> => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Please enter a description for the expense');
      return null;
    }

    if (totalAmountMinor <= 0) {
      setError('Amount must be greater than zero');
      return null;
    }

    if (!isValid) {
      setError(errorMessage || 'Split amounts are not balanced');
      return null;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const expenseDocRef = firestore()
        .collection('groups')
        .doc(groupId)
        .collection('expenses')
        .doc();

      const expenseData = {
        groupId,
        title: trimmedTitle,
        createdBy: user.uid,
        paidBy: user.uid,
        amount: totalAmountMinor,
        currency,
        exchangeRateToBase: 1.0,
        baseAmount: totalAmountMinor,
        splitType,
        splits,
        hasReceipt: Boolean(receiptBase64),
        balanceSynced: false,
        createdAt: Date.now(),
      };

      await expenseDocRef.set(expenseData);

      if (receiptBase64) {
        await firestore()
          .collection('groups')
          .doc(groupId)
          .collection('receipts')
          .doc(expenseDocRef.id)
          .set({
            expenseId: expenseDocRef.id,
            createdBy: user.uid,
            base64Data: receiptBase64,
            sizeBytes: Math.round((receiptBase64.length * 3) / 4),
            createdAt: Date.now(),
          });
      }

      onSuccess?.(expenseDocRef.id);
      return expenseDocRef.id;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to save expense';
      setError(message);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    group,
    formState: {
      title,
      amountInput,
      currency,
      splitType,
      receiptBase64,
    },
    splitPreview,
    totalAmountMinor,
    isSubmitting,
    isCompressingReceipt,
    error,
    setTitle,
    setAmount: setAmountInput,
    setCurrency,
    setSplitType,
    updateMemberShare,
    attachReceipt,
    submitExpense,
  };
};
