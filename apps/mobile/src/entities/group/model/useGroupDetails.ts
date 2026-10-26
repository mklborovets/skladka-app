import { useEffect, useState } from 'react';
import { groupRepository } from '../api/groupRepository';
import { GroupDoc } from './types';

export interface UseGroupDetailsReturn {
  group: GroupDoc | null;
  isLoading: boolean;
  error: string | null;
}

export const useGroupDetails = (groupId: string): UseGroupDetailsReturn => {
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
      },
      err => {
        setError(err.message);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [groupId]);

  return {
    group,
    isLoading,
    error,
  };
};
