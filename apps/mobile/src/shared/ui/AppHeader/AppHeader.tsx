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

export interface AppHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  onBack,
  rightSlot,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftContainer}>
        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.backButton}
          >
            <View style={styles.arrowIcon}>
              <View style={styles.arrowStem} />
              <View style={styles.arrowHeadUpper} />
              <View style={styles.arrowHeadLower} />
            </View>
          </TouchableOpacity>
        )}
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightSlot && <View style={styles.rightSlot}>{rightSlot}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    minHeight: 48,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  arrowIcon: {
    width: 14,
    height: 14,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowStem: {
    position: 'absolute',
    width: 12,
    height: 2,
    backgroundColor: colors.textPrimary,
    borderRadius: 1,
    left: 1,
  },
  arrowHeadUpper: {
    position: 'absolute',
    left: 1,
    top: 3,
    width: 7,
    height: 2,
    backgroundColor: colors.textPrimary,
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }, { translateX: -1 }],
  },
  arrowHeadLower: {
    position: 'absolute',
    left: 1,
    bottom: 3,
    width: 7,
    height: 2,
    backgroundColor: colors.textPrimary,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }, { translateX: -1 }],
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    ...typography.titleMedium,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rightSlot: {
    marginLeft: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
