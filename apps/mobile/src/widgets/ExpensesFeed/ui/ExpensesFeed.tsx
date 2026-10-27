import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { ExpenseRow } from '@entities/expense';
import { EmptyState, ErrorBanner, colors, spacing, typography } from '@shared/ui';
import { useExpensesFeed } from '../model/useExpensesFeed';
import { ReceiptViewerModal } from './ReceiptViewerModal';

export interface ExpensesFeedProps {
  groupId: string;
  baseCurrency: string;
  currentUserId: string;
  memberNames?: Record<string, string>;
  memberIds?: string[];
  onAddExpense?: () => void;
}

export const ExpensesFeed: React.FC<ExpensesFeedProps> = ({
  groupId,
  baseCurrency,
  currentUserId,
  memberNames,
  memberIds,
  onAddExpense,
}) => {
  const {
    expenses,
    isLoading,
    error,
    memberNameMap,
    receiptViewer,
  } = useExpensesFeed({
    groupId,
    currentUserId,
    memberNames,
    memberIds,
  });

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
              resolvedMemberNames={memberNameMap}
              onPressReceipt={receiptViewer.openReceipt}
            />
          ))}
        </View>
      )}

      <ReceiptViewerModal
        visible={receiptViewer.isOpen}
        receipt={receiptViewer.receipt}
        isLoading={receiptViewer.isLoading}
        error={receiptViewer.error}
        onClose={receiptViewer.closeReceipt}
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
