import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, radius, spacing, typography } from '@shared/ui';

export interface OfflineQueueBannerProps {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  onSyncPress?: () => void;
}

export const OfflineQueueBanner: React.FC<OfflineQueueBannerProps> = ({
  isOnline,
  isSyncing,
  pendingCount,
  onSyncPress,
}) => {
  if (isOnline && pendingCount === 0) {
    return null;
  }

  const isOffline = !isOnline;

  const backgroundColor = isOffline
    ? colors.warningBg
    : colors.surfaceElevated;
  const borderColor = isOffline
    ? colors.warningBorder
    : colors.primary;
  const textColor = isOffline
    ? colors.warning
    : colors.primaryLight;

  const titleText = isOffline
    ? pendingCount > 0
      ? `Offline Mode • ${pendingCount} balance updates pending`
      : 'Offline Mode • Changes will sync on reconnect'
    : isSyncing
    ? `Syncing ${pendingCount} queued transaction${pendingCount === 1 ? '' : 's'}...`
    : `${pendingCount} balance transaction${pendingCount === 1 ? '' : 's'} pending sync`;

  return (
    <View style={[styles.container, { backgroundColor, borderColor }]}>
      <View style={styles.contentRow}>
        {isSyncing ? (
          <ActivityIndicator
            size="small"
            color={textColor}
            style={styles.loader}
          />
        ) : (
          <View style={[styles.statusDot, { backgroundColor: textColor }]} />
        )}
        <Text style={[styles.text, { color: textColor }]} numberOfLines={1}>
          {titleText}
        </Text>
      </View>

      {!isOffline && !isSyncing && onSyncPress && (
        <TouchableOpacity
          onPress={onSyncPress}
          activeOpacity={0.7}
          style={styles.retryBtn}
        >
          <Text style={styles.retryText}>Sync Now</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    marginRight: spacing.sm,
  },
  loader: {
    marginRight: spacing.sm,
  },
  text: {
    ...typography.bodySmall,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  retryBtn: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  retryText: {
    ...typography.label,
    fontSize: 11,
    color: colors.primaryLight,
  },
});
