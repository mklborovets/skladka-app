import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DebtTransfer, DebtTransferCard, minimizeDebts } from '@entities/debt';
import { EmptyState, colors, spacing, typography } from '@shared/ui';

export interface DebtsSummaryProps {
  balances: Record<string, number>;
  currency: string;
  currentUserId: string;
  onSettleUp?: (transfer: DebtTransfer) => void;
}

export const DebtsSummary: React.FC<DebtsSummaryProps> = ({
  balances,
  currency,
  currentUserId,
  onSettleUp,
}) => {
  const transfers = useMemo(() => minimizeDebts(balances), [balances]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Suggested Settlement Transfers ({transfers.length})
      </Text>
      <Text style={styles.subtitle}>
        Greedy minimization reduces total number of peer-to-peer payments
      </Text>

      {transfers.length === 0 ? (
        <EmptyState
          title="All Settled Up"
          description="Everyone in this group is currently settled up. No remaining balances to resolve"
        />
      ) : (
        <View style={styles.list}>
          {transfers.map((item, index) => (
            <DebtTransferCard
              key={`${item.from}-${item.to}-${index}`}
              transfer={item}
              currency={currency}
              currentUserId={currentUserId}
              onSettle={onSettleUp}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  title: {
    ...typography.titleMedium,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  list: {
    marginTop: spacing.xs,
  },
});
