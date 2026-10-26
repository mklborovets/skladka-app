import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@app/navigation/types';
import { useAuth } from '@app/providers';
import { useGroupDetails } from '@entities/group';
import { CreateInviteModal } from '@features/join-by-invite';
import {
  AppHeader,
  Button,
  ErrorBanner,
  ScreenLayout,
  colors,
  radius,
  spacing,
  typography,
} from '@shared/ui';
import { ExpensesFeed } from '@widgets';

type Props = NativeStackScreenProps<RootStackParamList, 'GroupDetails'>;

export const GroupDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { groupId } = route.params;
  const { user } = useAuth();
  const { group, isLoading, error } = useGroupDetails(groupId);
  const [isInviteVisible, setIsInviteVisible] = useState<boolean>(false);

  if (!user) {
    return null;
  }

  const userBalance = group?.balances[user.uid] ?? 0;
  const formattedBalance = (Math.abs(userBalance) / 100).toFixed(2);
  const isOwed = userBalance > 0;
  const owes = userBalance < 0;

  const balanceColor = isOwed
    ? colors.success
    : owes
    ? colors.danger
    : colors.textSecondary;

  const balanceText = isOwed
    ? `You are owed +${formattedBalance} ${group?.baseCurrency}`
    : owes
    ? `You owe -${formattedBalance} ${group?.baseCurrency}`
    : 'Settled up';

  return (
    <ScreenLayout scrollable>
      <AppHeader
        title={group?.name || 'Group Details'}
        subtitle={
          group
            ? `${group.memberIds.length} members • ${group.baseCurrency}`
            : undefined
        }
        onBack={() => navigation.goBack()}
        rightSlot={
          <Button
            title="+ Invite"
            onPress={() => setIsInviteVisible(true)}
            variant="ghost"
            size="sm"
          />
        }
      />

      {error && <ErrorBanner message={error} />}

      {group && (
        <View style={styles.summaryCard}>
          <View style={styles.balanceRow}>
            <View>
              <Text style={styles.balanceLabel}>Your Balance</Text>
              <Text style={[styles.balanceValue, { color: balanceColor }]}>
                {balanceText}
              </Text>
            </View>
            <View style={styles.currencyBadge}>
              <Text style={styles.currencyText}>{group.baseCurrency}</Text>
            </View>
          </View>

          <View style={styles.actionsRow}>
            <Button
              title="+ Add Expense"
              onPress={() => navigation.navigate('CreateExpense', { groupId })}
              variant="primary"
              size="md"
              style={styles.actionBtn}
            />
            <Button
              title="Settle Up"
              onPress={() => navigation.navigate('Debts', { groupId })}
              variant="secondary"
              size="md"
              style={styles.actionBtn}
            />
          </View>
        </View>
      )}

      {group && (
        <ExpensesFeed
          groupId={groupId}
          baseCurrency={group.baseCurrency}
          currentUserId={user.uid}
          onAddExpense={() =>
            navigation.navigate('CreateExpense', { groupId })
          }
        />
      )}

      {group && (
        <CreateInviteModal
          visible={isInviteVisible}
          groupId={groupId}
          groupName={group.name}
          creatorId={user.uid}
          onClose={() => setIsInviteVisible(false)}
        />
      )}
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: spacing.md,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  balanceLabel: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: 2,
  },
  balanceValue: {
    ...typography.titleMedium,
    fontWeight: '700',
  },
  currencyBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currencyText: {
    ...typography.label,
    color: colors.primaryLight,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
  },
});
