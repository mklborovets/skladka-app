import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Button, ErrorBanner, colors, radius, spacing, typography } from '@shared/ui';

export interface GoogleUpgradeBannerProps {
  onUpgrade: () => void;
  loading?: boolean;
  error?: string | null;
  style?: StyleProp<ViewStyle>;
}

export const GoogleUpgradeBanner: React.FC<GoogleUpgradeBannerProps> = ({
  onUpgrade,
  loading = false,
  error,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.headerRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Anonymous Mode</Text>
        </View>
      </View>
      <Text style={styles.title}>Link Google Account</Text>
      <Text style={styles.description}>
        Anonymous profile is stored only on this device. Link Google to prevent
        losing access to your shared groups and expenses.
      </Text>
      {error && <ErrorBanner message={error} />}
      <Button
        title="Connect Google"
        onPress={onUpgrade}
        loading={loading}
        variant="primary"
        size="md"
        style={styles.actionButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginVertical: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  badge: {
    backgroundColor: colors.warningBg,
    borderColor: colors.warningBorder,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    ...typography.label,
    color: colors.warning,
    fontSize: 11,
  },
  title: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  actionButton: {
    marginTop: spacing.xs,
  },
});
