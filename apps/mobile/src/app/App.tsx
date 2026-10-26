import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './providers';
import { RootNavigator } from './navigation';
import { colors } from '@shared/ui';
import {
  OfflineQueueBanner,
  useOfflineMutationQueue,
} from '@features/sync-offline-queue';

const OfflineSyncCoordinator: React.FC = () => {
  const { user } = useAuth();
  const { isOnline, isSyncing, pendingCount, processQueue } =
    useOfflineMutationQueue(user?.uid);

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
