import { useCallback, useEffect, useRef, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import firestore from '@react-native-firebase/firestore';
import { syncExpenseBalance } from '@entities/group';

export interface UseOfflineMutationQueueReturn {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  error: string | null;
  processQueue: () => Promise<void>;
}

export const useOfflineMutationQueue = (
  userId?: string | null
): UseOfflineMutationQueueReturn => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const isSyncingRef = useRef<boolean>(false);

  const processQueue = useCallback(async (): Promise<void> => {
    if (!userId || isSyncingRef.current) {
      return;
    }

    try {
      isSyncingRef.current = true;
      setIsSyncing(true);
      setError(null);

      const groupsSnapshot = await firestore()
        .collection('groups')
        .where('memberIds', 'array-contains', userId)
        .get();

      let totalPending = 0;

      for (const groupDoc of groupsSnapshot.docs) {
        const unsyncedExpenses = await firestore()
          .collection('groups')
          .doc(groupDoc.id)
          .collection('expenses')
          .where('balanceSynced', '==', false)
          .get();

        totalPending += unsyncedExpenses.size;

        for (const expenseDoc of unsyncedExpenses.docs) {
          try {
            await syncExpenseBalance(groupDoc.id, expenseDoc.id);
            totalPending = Math.max(0, totalPending - 1);
          } catch {
            break;
          }
        }
      }

      setPendingCount(totalPending);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to process offline mutations';
      setError(message);
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  }, [userId]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = Boolean(
        state.isConnected && state.isInternetReachable !== false
      );
      setIsOnline(online);

      if (online && userId) {
        processQueue();
      }
    });

    return unsubscribe;
  }, [userId, processQueue]);

  useEffect(() => {
    if (isOnline && userId) {
      processQueue();
    }
  }, [userId, isOnline, processQueue]);

  return {
    isOnline,
    isSyncing,
    pendingCount,
    error,
    processQueue,
  };
};
