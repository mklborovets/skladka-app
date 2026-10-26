import { Platform } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import notifee, { AndroidImportance } from '@notifee/react-native';

const CHANNEL_ID = 'skladka_expenses';
let activeUnsubscribe: (() => void) | null = null;
let listenerStartTime = Date.now();

export async function initNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Expense Updates',
    importance: AndroidImportance.HIGH,
  });
}

export async function startBackgroundExpenseListener(): Promise<() => void> {
  if (Platform.OS !== 'android') {
    return () => {};
  }

  await initNotificationChannel();
  await notifee.requestPermission();

  listenerStartTime = Date.now();

  if (activeUnsubscribe) {
    activeUnsubscribe();
    activeUnsubscribe = null;
  }

  const unsubscribe = firestore()
    .collectionGroup('expenses')
    .onSnapshot(
      snapshot => {
        if (!snapshot) return;

        const currentUid = auth().currentUser?.uid;

        snapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            const data = change.doc.data();
            const createdAt =
              typeof data?.createdAt === 'number' ? data.createdAt : 0;
            const createdBy =
              typeof data?.createdBy === 'string' ? data.createdBy : '';

            if (createdAt > listenerStartTime && createdBy !== currentUid) {
              const amountMinor =
                typeof data?.amount === 'number' ? data.amount : 0;
              const formattedAmount = (amountMinor / 100).toFixed(2);
              const currency =
                typeof data?.currency === 'string' ? data.currency : '';
              const title =
                typeof data?.title === 'string' ? data.title : 'New expense';

              notifee.displayNotification({
                id: change.doc.id,
                title: 'New Expense Added',
                body: `${title}: ${formattedAmount} ${currency}`,
                android: {
                  channelId: CHANNEL_ID,
                  pressAction: {
                    id: 'default',
                  },
                },
              });
            }
          }
        });
      },
      () => {}
    );

  activeUnsubscribe = unsubscribe;
  return unsubscribe;
}

export async function stopBackgroundExpenseListener(): Promise<void> {
  if (activeUnsubscribe) {
    activeUnsubscribe();
    activeUnsubscribe = null;
  }
  if (Platform.OS === 'android') {
    await notifee.stopForegroundService();
  }
}

if (Platform.OS === 'android') {
  notifee.registerForegroundService(async () => {
    return new Promise<void>(() => {
      startBackgroundExpenseListener();
    });
  });
}

export const backgroundExpenseHeadlessTask = async (): Promise<void> => {
  await startBackgroundExpenseListener();
};
