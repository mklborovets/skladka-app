import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './providers';
import { AuthScreen } from '@pages/AuthScreen';
import { colors } from '@shared/ui';

export const App = () => {
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background}
      />
      <AuthProvider>
        <AuthScreen />
      </AuthProvider>
    </SafeAreaProvider>
  );
};
