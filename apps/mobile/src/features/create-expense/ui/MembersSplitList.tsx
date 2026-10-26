import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, radius, spacing, typography } from '@shared/ui';
import { MemberSplitPreview, SplitType } from '../model/splitCalculator';

export interface MemberListItem extends MemberSplitPreview {
  displayName?: string;
}

export interface MembersSplitListProps {
  members: MemberListItem[];
  splitType: SplitType;
  currency: string;
  totalAmount: number;
  onChangeShare: (userId: string, newShare: number) => void;
}

export const MembersSplitList: React.FC<MembersSplitListProps> = ({
  members,
  splitType,
  currency,
  totalAmount,
  onChangeShare,
}) => {
  const allocatedSum = members.reduce(
    (acc, m) => acc + m.calculatedAmount,
    0
  );
  const remaining = totalAmount - allocatedSum;
  const isBalanced = remaining === 0;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>Members Split ({members.length})</Text>
        <Text
          style={[
            styles.summaryText,
            { color: isBalanced ? colors.success : colors.warning },
          ]}
        >
          {isBalanced
            ? 'Fully balanced'
            : `Remaining: ${(Math.abs(remaining) / 100).toFixed(2)} ${currency}`}
        </Text>
      </View>

      <View style={styles.listCard}>
        {members.map(item => {
          const formattedAmount = (item.calculatedAmount / 100).toFixed(2);
          const name = item.displayName || item.userId;

          return (
            <View key={item.userId} style={styles.memberRow}>
              <View style={styles.memberInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.memberName} numberOfLines={1}>
                  {name}
                </Text>
              </View>

              <View style={styles.splitControls}>
                {splitType === 'EQUAL' && (
                  <Text style={styles.calculatedText}>
                    {formattedAmount} {currency}
                  </Text>
                )}

                {splitType === 'SHARES' && (
                  <View style={styles.stepperContainer}>
                    <TouchableOpacity
                      onPress={() =>
                        onChangeShare(item.userId, Math.max(0, item.share - 1))
                      }
                      activeOpacity={0.7}
                      style={styles.stepBtn}
                    >
                      <Text style={styles.stepBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.shareCountText}>
                      {item.share}x
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        onChangeShare(item.userId, item.share + 1)
                      }
                      activeOpacity={0.7}
                      style={styles.stepBtn}
                    >
                      <Text style={styles.stepBtnText}>+</Text>
                    </TouchableOpacity>
                    <Text style={styles.shareAmountText}>
                      ({formattedAmount} {currency})
                    </Text>
                  </View>
                )}

                {splitType === 'EXACT' && (
                  <View style={styles.exactInputWrapper}>
                    <TextInput
                      style={styles.exactInput}
                      value={
                        item.share > 0
                          ? (item.share / 100).toString()
                          : ''
                      }
                      onChangeText={val => {
                        const parsed = Math.round(
                          (parseFloat(val) || 0) * 100
                        );
                        onChangeShare(item.userId, parsed);
                      }}
                      placeholder="0.00"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="decimal-pad"
                    />
                    <Text style={styles.exactCurrency}>{currency}</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
  },
  summaryText: {
    ...typography.bodySmall,
    fontWeight: '600',
    fontSize: 12,
  },
  listCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    overflow: 'hidden',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarText: {
    ...typography.label,
    color: colors.primaryLight,
    fontWeight: '700',
  },
  memberName: {
    ...typography.bodyRegular,
    color: colors.textPrimary,
    flex: 1,
  },
  splitControls: {
    alignItems: 'flex-end',
  },
  calculatedText: {
    ...typography.bodyRegular,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepBtnText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 18,
  },
  shareCountText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '700',
    marginHorizontal: spacing.sm,
  },
  shareAmountText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },
  exactInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    minWidth: 100,
  },
  exactInput: {
    flex: 1,
    color: colors.textPrimary,
    paddingVertical: 4,
    fontSize: 14,
    textAlign: 'right',
  },
  exactCurrency: {
    ...typography.label,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },
});
