import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { ExpenseRow, useGroupExpenses } from '@entities/expense';
import { EmptyState, ErrorBanner, colors, spacing, typography } from '@shared/ui';
import { useReceiptViewer } from '../model/useReceiptViewer';
import { ReceiptViewerModal } from './ReceiptViewerModal';

export interface ExpensesFeedProps {
  groupId: string;
  baseCurrency: string;
  currentUserId: string;
  onAddExpense?: () => void;
}

export const ExpensesFeed: React.FC<ExpensesFeedProps> = ({
  groupId,
  baseCurrency,
  currentUserId,
  onAddExpense,
}) => {
  const { expenses, isLoading, error } = useGroupExpenses(groupId);
  const {
    isOpen: isReceiptOpen,
    receipt,
    isLoading: isReceiptLoading,
    error: receiptError,
    openReceipt,
    closeReceipt,
  } = useReceiptViewer(groupId);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>
          Activity & Expenses ({expenses.length})
        </Text>
      </View>

      {error && <ErrorBanner message={error} />}

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : expenses.length === 0 ? (
        <EmptyState
          title="No Expenses Yet"
          description="Add the first expense to begin tracking balances with your group"
          actionLabel="Add Expense"
          onAction={onAddExpense}
        />
      ) : (
        <View style={styles.list}>
          {expenses.map(item => (
            <ExpenseRow
              key={item.id}
              expense={item}
              currentUserId={currentUserId}
              baseCurrency={baseCurrency}
              onPressReceipt={openReceipt}
            />
          ))}
        </View>
      )}

      <ReceiptViewerModal
        visible={isReceiptOpen}
        receipt={receipt}
        isLoading={isReceiptLoading}
        error={receiptError}
        onClose={closeReceipt}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
  },
  headerRow: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.titleMedium,
    color: colors.textPrimary,
  },
  loaderContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    marginTop: spacing.xs,
  },
});
