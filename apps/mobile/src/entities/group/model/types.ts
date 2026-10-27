export type CurrencyCode = 'UAH' | 'USD' | 'EUR' | 'PLN';

export interface GroupDoc {
  id: string;
  name: string;
  baseCurrency: CurrencyCode;
  memberIds: string[];
  balances: Record<string, number>;
  memberNames?: Record<string, string>;
  processedExpenseIds: string[];
  lastUsedInvite?: string;
  updatedAt: number;
}

export interface CreateGroupInput {
  name: string;
  baseCurrency: CurrencyCode;
  creatorId: string;
  creatorName?: string;
}
