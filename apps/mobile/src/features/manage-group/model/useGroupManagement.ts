import { useState } from 'react';
import { Alert } from 'react-native';
import { GroupDoc, groupRepository } from '@entities/group';

export interface UseGroupManagementReturn {
  isCreator: boolean;
  isDeleting: boolean;
  isLeaving: boolean;
  error: string | null;
  userBalance: number;
  formattedUserBalance: string;
  isUserBalanceSettled: boolean;
  isAllBalancesSettled: boolean;
  deleteGroup: () => Promise<boolean>;
  leaveGroup: () => Promise<boolean>;
  confirmAndDelete: (onSuccess: () => void) => void;
  confirmAndLeave: (onSuccess: () => void) => void;
  clearError: () => void;
}

export const useGroupManagement = (
  group: GroupDoc | null,
  currentUserId: string
): UseGroupManagementReturn => {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isLeaving, setIsLeaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const isCreator = group ? group.memberIds[0] === currentUserId : false;
  const userBalance = group ? group.balances[currentUserId] ?? 0 : 0;
  const formattedUserBalance = (Math.abs(userBalance) / 100).toFixed(2);
  const isUserBalanceSettled = userBalance === 0;

  const isAllBalancesSettled = group
    ? Object.values(group.balances).every(balance => balance === 0)
    : true;

  const deleteGroup = async (): Promise<boolean> => {
    if (!group) {
      return false;
    }
    if (!isAllBalancesSettled) {
      setError('Cannot delete group with unsettled balances.');
      return false;
    }

    try {
      setIsDeleting(true);
      setError(null);
      await groupRepository.deleteGroup(group.id);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete group';
      setError(msg);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const leaveGroup = async (): Promise<boolean> => {
    if (!group) {
      return false;
    }
    if (!isUserBalanceSettled) {
      setError('Cannot leave group with unsettled balance.');
      return false;
    }

    try {
      setIsLeaving(true);
      setError(null);
      await groupRepository.leaveGroup(group.id, currentUserId);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to leave group';
      setError(msg);
      return false;
    } finally {
      setIsLeaving(false);
    }
  };

  const confirmAndDelete = (onSuccess: () => void) => {
    if (!group) {
      return;
    }

    if (!isAllBalancesSettled) {
      Alert.alert(
        'Cannot Delete Group',
        'All member balances must be settled up (0.00) before deleting the group. Please settle all balances first.'
      );
      return;
    }

    Alert.alert(
      'Delete Group',
      `Are you sure you want to permanently delete "${group.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteGroup();
            if (success) {
              onSuccess();
            }
          },
        },
      ]
    );
  };

  const confirmAndLeave = (onSuccess: () => void) => {
    if (!group) {
      return;
    }

    if (!isUserBalanceSettled) {
      const sign = userBalance > 0 ? '+' : '-';
      Alert.alert(
        'Cannot Leave Group',
        `Your balance is ${sign}${formattedUserBalance} ${group.baseCurrency}. You must settle your balance before leaving the group.`
      );
      return;
    }

    Alert.alert(
      'Leave Group',
      `Are you sure you want to leave "${group.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            const success = await leaveGroup();
            if (success) {
              onSuccess();
            }
          },
        },
      ]
    );
  };

  return {
    isCreator,
    isDeleting,
    isLeaving,
    error,
    userBalance,
    formattedUserBalance,
    isUserBalanceSettled,
    isAllBalancesSettled,
    deleteGroup,
    leaveGroup,
    confirmAndDelete,
    confirmAndLeave,
    clearError,
  };
};
