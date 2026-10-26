import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { SyncBadge, colors, radius, spacing, typography } from '@shared/ui';
import { ExpenseDoc } from '../model/types';

export interface ExpenseRowProps {
  expense: ExpenseDoc;
  currentUserId: string;
  baseCurrency: string;
  onPressReceipt?: (expenseId: string) => void;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const ExpenseRow: React.FC<ExpenseRowProps> = ({
  expense,
  currentUserId,
  baseCurrency,
  onPressReceipt,
  onPress,
  style,
}) => {
  const isPaidByMe = expense.paidBy === currentUserId;
  const payerText = isPaidByMe ? 'Paid by you' : `Paid by ${expense.paidBy.substring(0, 6)}`;

  const formattedAmount = (expense.amount / 100).toFixed(2);
  const formattedBaseAmount = (expense.baseAmount / 100).toFixed(2);
  const showConvertedAmount = expense.currency !== baseCurrency;

  const userShare = expense.splits[currentUserId];
  const userShareFormatted =
    typeof userShare === 'number' ? (userShare / 100).toFixed(2) : null;

  const dateText = new Date(expense.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
      style={[styles.container, style]}
    >
      <View style={styles.leftColumn}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {expense.title}
          </Text>
          {expense.hasReceipt && (
            <TouchableOpacity
              onPress={e => {
                e.stopPropagation?.();
                onPressReceipt?.(expense.id);
              }}
              activeOpacity={0.7}
              style={styles.receiptBadge}
            >
              <Text style={styles.receiptText}>Receipt</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.dateText}>{dateText}</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.payerText}>{payerText}</Text>
          {userShareFormatted && (
            <>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.shareText}>
                Your share: {userShareFormatted} {baseCurrency}
              </Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.rightColumn}>
        <Text style={styles.amountText}>
          {formattedAmount} {expense.currency}
        </Text>
        {showConvertedAmount && (
          <Text style={styles.baseAmountText}>
            ({formattedBaseAmount} {baseCurrency})
          </Text>
        )}
        <View style={styles.syncContainer}>
          <SyncBadge
            hasPendingWrites={Boolean(expense.hasPendingWrites)}
            balanceSynced={expense.balanceSynced}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: spacing.sm,
  },
  leftColumn: {
    flex: 1,
    marginRight: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    ...typography.bodyRegular,
    color: colors.textPrimary,
    fontWeight: '600',
    flexShrink: 1,
  },
  receiptBadge: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: radius.sm,
  },
  receiptText: {
    ...typography.label,
    color: colors.primaryLight,
    fontSize: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  dateText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    fontSize: 11,
  },
  metaDot: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginHorizontal: 4,
    fontSize: 11,
  },
  payerText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontSize: 11,
  },
  shareText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontSize: 11,
  },
  rightColumn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amountText: {
    ...typography.bodyRegular,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  baseAmountText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  syncContainer: {
    marginTop: 3,
  },
});
