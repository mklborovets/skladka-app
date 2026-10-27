import { useMemo } from 'react';
import { DebtTransfer, minimizeDebts } from '@entities/debt';
import { resolveGroupMemberNames } from '@entities/group';

export interface UseDebtsSummaryParams {
  balances: Record<string, number>;
  memberIds?: string[];
  memberNames?: Record<string, string>;
  currentUserId?: string;
  currentUserNickname?: string;
}

export interface UseDebtsSummaryReturn {
  transfers: DebtTransfer[];
  memberNameMap: Record<string, string>;
}

export const useDebtsSummary = ({
  balances,
  memberIds,
  memberNames,
  currentUserId,
  currentUserNickname,
}: UseDebtsSummaryParams): UseDebtsSummaryReturn => {
  const transfers = useMemo(() => minimizeDebts(balances), [balances]);

  const memberNameMap = useMemo(() => {
    const ids =
      memberIds && memberIds.length > 0 ? memberIds : Object.keys(balances);
    return resolveGroupMemberNames({
      memberIds: ids,
      memberNames: memberNames || {},
      currentUserId,
      currentUserNickname,
    });
  }, [memberIds, balances, memberNames, currentUserId, currentUserNickname]);

  return {
    transfers,
    memberNameMap,
  };
};
