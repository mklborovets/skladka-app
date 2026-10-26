import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, ErrorBanner, Input, colors, radius, spacing, typography } from '@shared/ui';
import { CurrencyCode } from '@entities/group';
import { useCreateGroup } from '../model/useCreateGroup';

const CURRENCIES: CurrencyCode[] = ['UAH', 'USD', 'EUR', 'PLN'];

export interface CreateGroupModalProps {
  visible: boolean;
  creatorId: string;
  onClose: () => void;
  onSuccess: (groupId: string) => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  visible,
  creatorId,
  onClose,
  onSuccess,
}) => {
  const {
    name,
    baseCurrency,
    isSubmitting,
    error,
    setName,
    setBaseCurrency,
    reset,
    submitGroup,
  } = useCreateGroup(groupId => {
    onSuccess(groupId);
    onClose();
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    await submitGroup(creatorId);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Create New Group</Text>
          <Text style={styles.subtitle}>
            Track and split shared expenses with friends
          </Text>

          <Input
            label="Group Name"
            placeholder="e.g. Ski Trip, Housemates"
            value={name}
            onChangeText={setName}
            containerStyle={styles.inputContainer}
          />

          <Text style={styles.currencyLabel}>Base Currency</Text>
          <View style={styles.currenciesRow}>
            {CURRENCIES.map(curr => {
              const isSelected = curr === baseCurrency;
              return (
                <TouchableOpacity
                  key={curr}
                  onPress={() => setBaseCurrency(curr)}
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

          {error && <ErrorBanner message={error} />}

          <View style={styles.actions}>
            <Button
              title="Create Group"
              onPress={handleSubmit}
              loading={isSubmitting}
              variant="primary"
              size="md"
              style={styles.submitButton}
            />
            <Button
              title="Cancel"
              onPress={handleClose}
              disabled={isSubmitting}
              variant="ghost"
              size="md"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  title: {
    ...typography.titleLarge,
    fontSize: 22,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  currencyLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  currenciesRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  currencyPill: {
    flex: 1,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  currencyPillTextSelected: {
    color: colors.primaryText,
    fontWeight: '700',
  },
  actions: {
    marginTop: spacing.md,
  },
  submitButton: {
    marginBottom: spacing.sm,
  },
});
