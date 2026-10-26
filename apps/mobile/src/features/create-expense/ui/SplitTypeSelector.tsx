import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, radius, spacing, typography } from '@shared/ui';
import { SplitType } from '../model/splitCalculator';

export interface SplitTypeSelectorProps {
  selected: SplitType;
  onSelect: (type: SplitType) => void;
}

const SPLIT_OPTIONS: { type: SplitType; label: string; description: string }[] = [
  { type: 'EQUAL', label: 'Equally', description: 'Split cost evenly' },
  { type: 'SHARES', label: 'By Shares', description: 'Weight by parts (1x, 2x...)' },
  { type: 'EXACT', label: 'Exact Amounts', description: 'Specify exact amounts' },
];

export const SplitTypeSelector: React.FC<SplitTypeSelectorProps> = ({
  selected,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Split Type</Text>
      <View style={styles.optionsRow}>
        {SPLIT_OPTIONS.map(opt => {
          const isSelected = opt.type === selected;
          return (
            <TouchableOpacity
              key={opt.type}
              onPress={() => onSelect(opt.type)}
              activeOpacity={0.7}
              style={[
                styles.optionCard,
                isSelected && styles.optionCardSelected,
              ]}
            >
              <Text
                style={[
                  styles.optionLabel,
                  isSelected && styles.optionLabelSelected,
                ]}
              >
                {opt.label}
              </Text>
              <Text
                style={[
                  styles.optionDesc,
                  isSelected && styles.optionDescSelected,
                ]}
                numberOfLines={1}
              >
                {opt.description}
              </Text>
            </TouchableOpacity>
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
  label: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  optionCard: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionCardSelected: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.primary,
  },
  optionLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: 2,
    textAlign: 'center',
  },
  optionLabelSelected: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  optionDesc: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
  },
  optionDescSelected: {
    color: colors.textSecondary,
  },
});
