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
import { DebtTransfer } from '../model/types';

export interface DebtTransferCardProps {
  transfer: DebtTransfer;
  currency: string;
  currentUserId: string;
  resolvedMemberNames?: Record<string, string>;
  onSettle?: (transfer: DebtTransfer) => void;
  style?: StyleProp<ViewStyle>;
}

export const DebtTransferCard: React.FC<DebtTransferCardProps> = ({
  transfer,
  currency,
  currentUserId,
  resolvedMemberNames = {},
  onSettle,
  style,
}) => {
  const isSender = transfer.from === currentUserId;
  const isReceiver = transfer.to === currentUserId;

  const senderName = isSender
    ? 'You'
    : resolvedMemberNames[transfer.from] ||
      (transfer.from.length > 4
        ? `Anon #${transfer.from.slice(-4)}`
        : transfer.from);

  const receiverName = isReceiver
    ? 'You'
    : resolvedMemberNames[transfer.to] ||
      (transfer.to.length > 4
        ? `Anon #${transfer.to.slice(-4)}`
        : transfer.to);

  const formattedAmount = (transfer.amount / 100).toFixed(2);

  const badgeColor = isSender
    ? colors.danger
    : isReceiver
    ? colors.success
    : colors.textSecondary;

  const badgeText = isSender
    ? 'You owe'
    : isReceiver
    ? 'Owes you'
    : 'Transfer';

  return (
    <View style={[styles.card, style]}>
      <View style={styles.topRow}>
        <View style={styles.partiesRow}>
          <View style={styles.partyBox}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {senderName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.partyName} numberOfLines={1}>
              {senderName}
            </Text>
          </View>

          <View style={styles.arrowContainer}>
            <Text style={styles.arrowText}>→</Text>
            <Text style={styles.paysText}>pays</Text>
          </View>

          <View style={styles.partyBox}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {receiverName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.partyName} numberOfLines={1}>
              {receiverName}
            </Text>
          </View>
        </View>

        <View style={styles.amountBox}>
          <Text style={styles.amountText}>
            {formattedAmount} {currency}
          </Text>
          <View style={[styles.badge, { borderColor: badgeColor }]}>
            <Text style={[styles.badgeText, { color: badgeColor }]}>
              {badgeText}
            </Text>
          </View>
        </View>
      </View>

      {onSettle && (
        <TouchableOpacity
          onPress={() => onSettle(transfer)}
          activeOpacity={0.7}
          style={styles.settleBtn}
        >
          <Text style={styles.settleBtnText}>Mark as Settled</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  partiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  partyBox: {
    alignItems: 'center',
    maxWidth: 80,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 4,
  },
  avatarText: {
    ...typography.label,
    color: colors.primaryLight,
    fontWeight: '700',
  },
  partyName: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontSize: 12,
    textAlign: 'center',
  },
  arrowContainer: {
    alignItems: 'center',
    marginHorizontal: spacing.sm,
  },
  arrowText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  paysText: {
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  amountBox: {
    alignItems: 'flex-end',
  },
  amountText: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  badge: {
    marginTop: 4,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  badgeText: {
    ...typography.label,
    fontSize: 10,
    fontWeight: '700',
  },
  settleBtn: {
    marginTop: spacing.sm,
    paddingVertical: spacing.xs + 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settleBtnText: {
    ...typography.label,
    color: colors.primaryLight,
    fontSize: 12,
  },
});
