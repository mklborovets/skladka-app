import { useEffect, useState } from 'react';
import { groupRepository } from '../api/groupRepository';
import { GroupDoc } from './types';

export interface UseGroupDetailsReturn {
  group: GroupDoc | null;
  isLoading: boolean;
  error: string | null;
}

export const useGroupDetails = (
  groupId: string,
  currentUserId?: string,
  currentNickname?: string
): UseGroupDetailsReturn => {
  const [group, setGroup] = useState<GroupDoc | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) {
      setGroup(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = groupRepository.subscribeToGroup(
      groupId,
      loaded => {
        setGroup(loaded);
        setIsLoading(false);
        if (
          loaded &&
          currentUserId &&
          currentNickname &&
          loaded.memberIds.includes(currentUserId) &&
          loaded.memberNames?.[currentUserId] !== currentNickname.trim()
        ) {
          groupRepository
            .updateMemberName(loaded.id, currentUserId, currentNickname.trim())
            .catch(() => null);
        }
      },
      err => {
        setError(err.message);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [groupId, currentUserId, currentNickname]);

  return {
    group,
    isLoading,
    error,
  };
};
