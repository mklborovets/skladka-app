import firestore from '@react-native-firebase/firestore';
import { CreateInviteInput, InviteDoc } from '../model/types';

function generateRandomToken(length = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    token += chars.charAt(randomIndex);
  }
  return token;
}

export const inviteRepository = {
  async createInvite(input: CreateInviteInput): Promise<InviteDoc> {
    const token = generateRandomToken();
    const days = input.expiresInDays ?? 7;
    const expiresAt = Date.now() + days * 24 * 60 * 60 * 1000;

    const inviteData: InviteDoc = {
      token,
      groupId: input.groupId,
      createdBy: input.createdBy,
      isUsed: false,
      usedBy: null,
      expiresAt,
    };

    await firestore().collection('invites').doc(token).set(inviteData);
    return inviteData;
  },

  async getInviteByToken(token: string): Promise<InviteDoc | null> {
    const doc = await firestore().collection('invites').doc(token).get();
    if (!doc.exists) {
      return null;
    }
    return doc.data() as InviteDoc;
  },
};
