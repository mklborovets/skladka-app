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
      processedExpenseIds: [],
      updatedAt: Date.now(),
    };

    await docRef.set(newGroupData);
    return docRef.id;
  },
};
