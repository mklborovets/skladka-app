import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

export interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message,
  onRetry,
  containerStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.content}>
        <Text style={styles.message}>{message}</Text>
        {onRetry && (
          <TouchableOpacity
            onPress={onRetry}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Повторити</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.dangerBg,
    borderColor: colors.dangerBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  message: {
    ...typography.bodySmall,
    color: colors.danger,
    flex: 1,
    fontWeight: '500',
  },
  retryButton: {
    marginLeft: spacing.md,
    paddingVertical: 2,
    paddingHorizontal: spacing.xs,
  },
  retryText: {
    ...typography.bodySmall,
    color: colors.primaryLight,
    fontWeight: '600',
  },
});
