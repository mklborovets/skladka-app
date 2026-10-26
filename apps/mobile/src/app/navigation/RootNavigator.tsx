import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@app/providers';
import {
  AuthScreen,
  CreateExpenseScreen,
  DebtsScreen,
  GroupDetailsScreen,
  GroupsListScreen,
  InvitePreviewScreen,
} from '@pages';
import { colors } from '@shared/ui';
import { linking } from './linking';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { user } = useAuth();

  return (
    <NavigationContainer
      linking={linking}
      theme={{
        dark: true,
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.textPrimary,
          border: colors.border,
          notification: colors.primary,
        },
        fonts: {
          regular: { fontFamily: 'System', fontWeight: '400' },
          medium: { fontFamily: 'System', fontWeight: '500' },
          bold: { fontFamily: 'System', fontWeight: '700' },
          heavy: { fontFamily: 'System', fontWeight: '900' },
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade',
        }}
      >
        {!user ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          <>
            <Stack.Screen name="GroupsList" component={GroupsListScreen} />
            <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} />
            <Stack.Screen name="CreateExpense" component={CreateExpenseScreen} />
            <Stack.Screen name="Debts" component={DebtsScreen} />
            <Stack.Screen
              name="InvitePreview"
              component={InvitePreviewScreen}
              options={{ presentation: 'transparentModal' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
