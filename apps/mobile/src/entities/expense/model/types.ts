export type SplitType = 'EQUAL' | 'SHARES' | 'EXACT';

export interface ExpenseDoc {
  id: string;
  groupId: string;
  title: string;
  createdBy: string;
  paidBy: string;
  amount: number;
  currency: string;
  exchangeRateToBase: number;
  baseAmount: number;
  splitType: SplitType;
  splits: Record<string, number>;
  hasReceipt: boolean;
  balanceSynced: boolean;
  hasPendingWrites?: boolean;
  createdAt: number;
}
