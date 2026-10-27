import { useMemo } from 'react';
import { ExpenseDoc, useGroupExpenses } from '@entities/expense';
import { resolveGroupMemberNames } from '@entities/group';
import { useReceiptViewer } from './useReceiptViewer';

export interface UseExpensesFeedParams {
  groupId: string;
  currentUserId: string;
  memberNames?: Record<string, string>;
  memberIds?: string[];
}

export interface UseExpensesFeedReturn {
  expenses: ExpenseDoc[];
  isLoading: boolean;
  error: string | null;
  memberNameMap: Record<string, string>;
  receiptViewer: ReturnType<typeof useReceiptViewer>;
}

export const useExpensesFeed = ({
  groupId,
  currentUserId,
  memberNames,
  memberIds,
}: UseExpensesFeedParams): UseExpensesFeedReturn => {
  const { expenses, isLoading, error } = useGroupExpenses(groupId);
  const receiptViewer = useReceiptViewer(groupId);

  const memberNameMap = useMemo(() => {
    return resolveGroupMemberNames({
      memberIds: memberIds || [],
      memberNames: memberNames || {},
      currentUserId,
    });
  }, [memberIds, memberNames, currentUserId]);

  return {
    expenses,
    isLoading,
    error,
    memberNameMap,
    receiptViewer,
  };
};
