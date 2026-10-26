import { useEffect, useState } from 'react';
import { GroupDoc, groupRepository } from '@entities/group';
import { InviteDoc, inviteRepository } from '@entities/invite';

export interface UseInvitePreviewReturn {
  invite: InviteDoc | null;
  group: GroupDoc | null;
  isLoading: boolean;
  error: string | null;
  isExpired: boolean;
  isUsed: boolean;
  isValid: boolean;
  reload: () => Promise<void>;
}

export const useInvitePreview = (token: string | null): UseInvitePreviewReturn => {
  const [invite, setInvite] = useState<InviteDoc | null>(null);
  const [group, setGroup] = useState<GroupDoc | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvite = async () => {
    if (!token) {
      setInvite(null);
      setGroup(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const loadedInvite = await inviteRepository.getInviteByToken(token);
      if (!loadedInvite) {
        setInvite(null);
        setGroup(null);
        setError('Invitation not found');
        return;
      }

      setInvite(loadedInvite);

      const loadedGroup = await groupRepository.getGroupById(loadedInvite.groupId);
      if (!loadedGroup) {
        setGroup(null);
        setError('Target group not found');
        return;
      }

      setGroup(loadedGroup);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load invitation';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvite();
  }, [token]);

  const isExpired = Boolean(invite && Date.now() > invite.expiresAt);
  const isUsed = Boolean(invite?.isUsed);
  const isValid = Boolean(invite && group && !isUsed && !isExpired);

  return {
    invite,
    group,
    isLoading,
    error,
    isExpired,
    isUsed,
    isValid,
    reload: fetchInvite,
  };
};
