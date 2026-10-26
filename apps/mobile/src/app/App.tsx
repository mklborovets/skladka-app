import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './providers';
import { AuthScreen, GroupsListScreen } from '@pages';
import { colors } from '@shared/ui';

const NavigationContent: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'groups' | 'profile'>('groups');

  if (!user || activeTab === 'profile') {
    return (
      <AuthScreen
        onSuccess={() => setActiveTab('groups')}
      />
    );
  }

  return (
    <GroupsListScreen
      onOpenProfile={() => setActiveTab('profile')}
    />
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
        <NavigationContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
};
