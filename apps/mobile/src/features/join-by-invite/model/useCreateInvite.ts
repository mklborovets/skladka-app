import { useState } from 'react';
import { Share } from 'react-native';
import { InviteDoc, inviteRepository } from '@entities/invite';

export interface UseCreateInviteReturn {
  invite: InviteDoc | null;
  isLoading: boolean;
  error: string | null;
  generateInvite: () => Promise<void>;
  shareInvite: () => Promise<void>;
  reset: () => void;
}

export const useCreateInvite = (
  groupId: string,
  creatorId: string,
  groupName?: string
): UseCreateInviteReturn => {
  const [invite, setInvite] = useState<InviteDoc | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateInvite = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const created = await inviteRepository.createInvite({
        groupId,
        createdBy: creatorId,
        expiresInDays: 7,
      });
      setInvite(created);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to create invite';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const shareInvite = async (): Promise<void> => {
    if (!invite) {
      return;
    }
    const deepLink = `skladka://invite/${invite.token}`;
    const message = groupName
      ? `Join "${groupName}" on SKLADKA to split shared expenses: ${deepLink}`
      : `Join our group on SKLADKA to split shared expenses: ${deepLink}`;

    try {
      await Share.share({
        message,
        url: deepLink,
      });
    } catch {}
  };

  const reset = (): void => {
    setInvite(null);
    setError(null);
  };

  return {
    invite,
    isLoading,
    error,
    generateInvite,
    shareInvite,
    reset,
  };
};
