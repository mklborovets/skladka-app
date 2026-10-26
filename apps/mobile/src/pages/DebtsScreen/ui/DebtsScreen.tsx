import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@app/navigation/types';
import { useAuth } from '@app/providers';
import { useGroupDetails } from '@entities/group';
import {
  AppHeader,
  ErrorBanner,
  ScreenLayout,
  colors,
  spacing,
} from '@shared/ui';
import { DebtsSummary } from '@widgets';

type Props = NativeStackScreenProps<RootStackParamList, 'Debts'>;

export const DebtsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { groupId } = route.params;
  const { user } = useAuth();
  const { group, isLoading, error } = useGroupDetails(groupId);

  if (!user) {
    return null;
  }

  return (
    <ScreenLayout scrollable>
      <AppHeader
        title="Settle Up"
        subtitle={group ? `${group.name} debts` : undefined}
        onBack={() => navigation.goBack()}
      />

      {error && <ErrorBanner message={error} />}

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : group ? (
        <DebtsSummary
          balances={group.balances}
          currency={group.baseCurrency}
          currentUserId={user.uid}
        />
      ) : null}
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
