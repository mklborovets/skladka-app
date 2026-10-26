import { useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import { GroupDoc } from '@entities/group';
import { InviteDoc } from '@entities/invite';

export interface UseAcceptInviteReturn {
  acceptInvite: (token: string, userId: string) => Promise<string | null>;
  isJoining: boolean;
  error: string | null;
}

export const useAcceptInvite = (): UseAcceptInviteReturn => {
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const acceptInvite = async (
    token: string,
    userId: string
  ): Promise<string | null> => {
    try {
      setIsJoining(true);
      setError(null);

      const targetGroupId = await firestore().runTransaction(
        async transaction => {
          const inviteRef = firestore().collection('invites').doc(token);
          const inviteDoc = await transaction.get(inviteRef);
          if (!inviteDoc.exists) {
            throw new Error('Invitation not found');
          }

          const inviteData = inviteDoc.data() as InviteDoc;
          if (inviteData.isUsed) {
            throw new Error('This invitation has already been used');
          }
          if (Date.now() > inviteData.expiresAt) {
            throw new Error('This invitation has expired');
          }

          const groupRef = firestore()
            .collection('groups')
            .doc(inviteData.groupId);
          const groupDoc = await transaction.get(groupRef);
          if (!groupDoc.exists) {
            throw new Error('Target group not found');
          }

          const groupData = groupDoc.data() as GroupDoc;
          if (groupData.memberIds.includes(userId)) {
            return inviteData.groupId;
          }

          if (groupData.memberIds.length >= 10) {
            throw new Error('Group already reached 10 members limit');
          }

          transaction.update(inviteRef, {
            isUsed: true,
            usedBy: userId,
          });

          transaction.update(groupRef, {
            memberIds: [...groupData.memberIds, userId],
            balances: {
              ...groupData.balances,
              [userId]: 0,
            },
            lastUsedInvite: token,
            updatedAt: Date.now(),
          });

          return inviteData.groupId;
        }
      );

      return targetGroupId;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to join group via invite';
      setError(message);
      return null;
    } finally {
      setIsJoining(false);
    }
  };

  return {
    acceptInvite,
    isJoining,
    error,
  };
};
