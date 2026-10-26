import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radius, spacing, typography } from '@shared/ui';
import { GroupDoc } from '../model/types';

export interface GroupCardProps {
  group: GroupDoc;
  currentUserId: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const GroupCard: React.FC<GroupCardProps> = ({
  group,
  currentUserId,
  onPress,
  style,
}) => {
  const userBalance = group.balances[currentUserId] ?? 0;
  const formattedBalance = (Math.abs(userBalance) / 100).toFixed(2);

  const isOwed = userBalance > 0;
  const owes = userBalance < 0;

  const balanceColor = isOwed
    ? colors.success
    : owes
    ? colors.danger
    : colors.textSecondary;

  const balanceText = isOwed
    ? `You are owed +${formattedBalance} ${group.baseCurrency}`
    : owes
    ? `You owe -${formattedBalance} ${group.baseCurrency}`
    : 'Settled up';

  const memberText =
    group.memberIds.length === 1
      ? '1 member'
      : `${group.memberIds.length} members`;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[styles.container, style]}
    >
      <View style={styles.topRow}>
        <View style={styles.nameContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {group.name}
          </Text>
          <Text style={styles.members}>{memberText}</Text>
        </View>
        <View style={styles.currencyBadge}>
          <Text style={styles.currencyText}>{group.baseCurrency}</Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <Text style={[styles.balance, { color: balanceColor }]}>
          {balanceText}
        </Text>
        <View style={styles.chevron}>
          <View style={styles.chevronUpper} />
          <View style={styles.chevronLower} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  nameContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  name: {
    ...typography.titleMedium,
    color: colors.textPrimary,
  },
  members: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: 2,
  },
  currencyBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currencyText: {
    ...typography.label,
    color: colors.primaryLight,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  balance: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  chevron: {
    width: 8,
    height: 12,
    position: 'relative',
    justifyContent: 'center',
  },
  chevronUpper: {
    position: 'absolute',
    top: 2,
    width: 6,
    height: 2,
    backgroundColor: colors.textMuted,
    transform: [{ rotate: '45deg' }],
  },
  chevronLower: {
    position: 'absolute',
    bottom: 2,
    width: 6,
    height: 2,
    backgroundColor: colors.textMuted,
    transform: [{ rotate: '-45deg' }],
  },
});
