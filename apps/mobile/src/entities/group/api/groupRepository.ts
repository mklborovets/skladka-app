import firestore from '@react-native-firebase/firestore';
import { CreateGroupInput, GroupDoc } from '../model/types';

export const groupRepository = {
  subscribeToUserGroups(
    userId: string,
    onUpdate: (groups: GroupDoc[]) => void,
    onError: (error: Error) => void
  ): () => void {
    return firestore()
      .collection('groups')
      .where('memberIds', 'array-contains', userId)
      .onSnapshot(
        { includeMetadataChanges: true },
        snapshot => {
          if (!snapshot) {
            onUpdate([]);
            return;
          }
          const groups: GroupDoc[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...(doc.data() as Omit<GroupDoc, 'id'>),
          }));
          groups.sort((a, b) => b.updatedAt - a.updatedAt);
          onUpdate(groups);
        },
        error => {
          onError(error);
        }
      );
  },

  subscribeToGroup(
    groupId: string,
    onUpdate: (group: GroupDoc | null) => void,
    onError: (error: Error) => void
  ): () => void {
    return firestore()
      .collection('groups')
      .doc(groupId)
      .onSnapshot(
        { includeMetadataChanges: true },
        snapshot => {
          if (!snapshot.exists) {
            onUpdate(null);
            return;
          }
          const data = snapshot.data();
          if (!data) {
            onUpdate(null);
            return;
          }
          onUpdate({
            id: snapshot.id,
            ...(data as Omit<GroupDoc, 'id'>),
          });
        },
        error => {
          onError(error);
        }
      );
  },

  async getGroupById(groupId: string): Promise<GroupDoc | null> {
    const doc = await firestore().collection('groups').doc(groupId).get();
    if (!doc.exists) {
      return null;
    }
    return {
      id: doc.id,
      ...(doc.data() as Omit<GroupDoc, 'id'>),
    };
  },

  async createGroupDoc(input: CreateGroupInput): Promise<string> {
    const trimmedName = input.name.trim();
    if (!trimmedName) {
      throw new Error('Group name cannot be empty');
    }

    const docRef = firestore().collection('groups').doc();
    const newGroupData: Omit<GroupDoc, 'id'> = {
      name: trimmedName,
      baseCurrency: input.baseCurrency,
      memberIds: [input.creatorId],
      balances: {
        [input.creatorId]: 0,
      },
      memberNames: input.creatorName ? { [input.creatorId]: input.creatorName.trim() } : {},
      processedExpenseIds: [],
      updatedAt: Date.now(),
    };

    await docRef.set(newGroupData);
    return docRef.id;
  },

  async updateMemberName(groupId: string, userId: string, nickname: string): Promise<void> {
    const trimmed = nickname.trim();
    if (!trimmed) return;
    await firestore()
      .collection('groups')
      .doc(groupId)
      .update({
        [`memberNames.${userId}`]: trimmed,
        updatedAt: Date.now(),
      });
  },

  async updateNicknameInUserGroups(userId: string, nickname: string): Promise<void> {
    const trimmed = nickname.trim();
    if (!trimmed) return;
    const snapshot = await firestore()
      .collection('groups')
      .where('memberIds', 'array-contains', userId)
      .get();

    if (snapshot.empty) return;

    const batch = firestore().batch();
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        [`memberNames.${userId}`]: trimmed,
        updatedAt: Date.now(),
      });
    });
    await batch.commit();
  },

  async leaveGroup(groupId: string, userId: string): Promise<void> {
    const groupRef = firestore().collection('groups').doc(groupId);
    await firestore().runTransaction(async transaction => {
      const doc = await transaction.get(groupRef);
      if (!doc.exists) {
        throw new Error('Group not found');
      }
      const data = doc.data() as GroupDoc;
      if (!data.memberIds.includes(userId)) {
        return;
      }
      if ((data.balances[userId] ?? 0) !== 0) {
        throw new Error('Cannot leave group with unsettled balance');
      }
      const newMemberIds = data.memberIds.filter(id => id !== userId);
      const newBalances = { ...data.balances };
      delete newBalances[userId];

      if (newMemberIds.length === 0) {
        transaction.delete(groupRef);
      } else {
        transaction.update(groupRef, {
          memberIds: newMemberIds,
          balances: newBalances,
          updatedAt: Date.now(),
        });
      }
    });
  },

  async deleteGroup(groupId: string): Promise<void> {
    const groupRef = firestore().collection('groups').doc(groupId);
    await groupRef.delete();
  },
};

