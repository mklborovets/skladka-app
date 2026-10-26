import { useEffect, useState } from 'react';
import { groupRepository } from '../api/groupRepository';
import { GroupDoc } from './types';

export interface UseUserGroupsReturn {
  groups: GroupDoc[];
  isLoading: boolean;
  error: string | null;
}

export const useUserGroups = (userId?: string | null): UseUserGroupsReturn => {
  const [groups, setGroups] = useState<GroupDoc[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setGroups([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = groupRepository.subscribeToUserGroups(
      userId,
      loadedGroups => {
        setGroups(loadedGroups);
        setIsLoading(false);
      },
      err => {
        setError(err.message);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [userId]);

  return {
    groups,
    isLoading,
    error,
  };
};
