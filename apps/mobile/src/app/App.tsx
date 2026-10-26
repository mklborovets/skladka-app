import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './providers';
import { RootNavigator } from './navigation';
import { startBackgroundExpenseListener } from './headless/backgroundListener';
import { colors } from '@shared/ui';
import {
  OfflineQueueBanner,
  useOfflineMutationQueue,
} from '@features/sync-offline-queue';

const OfflineSyncCoordinator: React.FC = () => {
  const { user } = useAuth();
  const { isOnline, isSyncing, pendingCount, processQueue } =
    useOfflineMutationQueue(user?.uid);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    if (user) {
      startBackgroundExpenseListener().then(unsub => {
        cleanup = unsub;
      });
    }
    return () => {
      cleanup?.();
    };
  }, [user]);

  return (
    <>
      <OfflineQueueBanner
        isOnline={isOnline}
        isSyncing={isSyncing}
        pendingCount={pendingCount}
        onSyncPress={processQueue}
      />
      <RootNavigator />
    </>
  );
};

export const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background}
      />
      <AuthProvider>
        <OfflineSyncCoordinator />
      </AuthProvider>
    </SafeAreaProvider>
  );
};
