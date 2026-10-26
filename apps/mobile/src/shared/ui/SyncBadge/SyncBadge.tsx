import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radius, spacing } from '../theme';

export interface SyncBadgeProps {
  hasPendingWrites?: boolean;
  balanceSynced?: boolean;
  compact?: boolean;
  label?: string;
  style?: StyleProp<ViewStyle>;
}

export const SyncBadge: React.FC<SyncBadgeProps> = ({
  hasPendingWrites = false,
  balanceSynced = true,
  compact = false,
  label,
  style,
}) => {
  const isPendingNetwork = hasPendingWrites;
  const isPendingBalance = !hasPendingWrites && !balanceSynced;

  const badgeColor = isPendingNetwork
    ? colors.warning
    : isPendingBalance
    ? colors.info
    : colors.success;

  const badgeBg = isPendingNetwork
    ? colors.warningBg
    : isPendingBalance
    ? colors.infoBg
    : colors.successBg;

  const badgeBorder = isPendingNetwork
    ? colors.warningBorder
    : isPendingBalance
    ? colors.infoBorder
    : colors.successBorder;

  const displayText =
    label ??
    (isPendingNetwork
      ? 'Waiting for network'
      : isPendingBalance
      ? 'Syncing'
      : 'Synced');

  if (compact) {
    return (
      <View
        style={[
          styles.compactContainer,
          { backgroundColor: badgeBg, borderColor: badgeBorder },
          style,
        ]}
      >
        <View style={[styles.dot, { backgroundColor: badgeColor }]} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: badgeBg, borderColor: badgeBorder },
        style,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: badgeColor }]} />
      <Text style={[styles.label, { color: badgeColor }]}>{displayText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  compactContainer: {
    padding: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
});
