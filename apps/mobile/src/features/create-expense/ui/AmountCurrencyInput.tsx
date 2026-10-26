import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, radius, spacing, typography } from '@shared/ui';

export interface AmountCurrencyInputProps {
  amount: string;
  currency: string;
  onChangeAmount: (text: string) => void;
  onChangeCurrency: (currency: string) => void;
  availableCurrencies?: string[];
}

const DEFAULT_CURRENCIES = ['USD', 'UAH', 'EUR', 'PLN'];

export const AmountCurrencyInput: React.FC<AmountCurrencyInputProps> = ({
  amount,
  currency,
  onChangeAmount,
  onChangeCurrency,
  availableCurrencies = DEFAULT_CURRENCIES,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Amount & Currency</Text>
      <View style={styles.inputRow}>
        <View style={styles.amountInputWrapper}>
          <Text style={styles.currencyPrefix}>
            {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : ''}
          </Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={onChangeAmount}
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.currenciesPillContainer}>
          {availableCurrencies.map(curr => {
            const isSelected = curr === currency;
            return (
              <TouchableOpacity
                key={curr}
                onPress={() => onChangeCurrency(curr)}
                activeOpacity={0.7}
                style={[
                  styles.currencyPill,
                  isSelected && styles.currencyPillSelected,
                ]}
              >
                <Text
                  style={[
                    styles.currencyPillText,
                    isSelected && styles.currencyPillTextSelected,
                  ]}
                >
                  {curr}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
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
  inputRow: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  currencyPrefix: {
    ...typography.titleLarge,
    color: colors.textPrimary,
    fontSize: 26,
    marginRight: spacing.xs,
  },
  amountInput: {
    flex: 1,
    ...typography.titleLarge,
    fontSize: 26,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  currenciesPillContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  currencyPill: {
    flex: 1,
    paddingVertical: spacing.xs + 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currencyPillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  currencyPillText: {
    ...typography.label,
    color: colors.textSecondary,
    fontSize: 12,
  },
  currencyPillTextSelected: {
    color: colors.primaryText,
    fontWeight: '700',
  },
});
