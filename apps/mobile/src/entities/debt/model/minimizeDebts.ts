import { DebtTransfer } from './types';

interface ParticipantBalance {
  userId: string;
  amount: number;
}

export function minimizeDebts(
  balances: Record<string, number>
): DebtTransfer[] {
  const debtors: ParticipantBalance[] = [];
  const creditors: ParticipantBalance[] = [];

  for (const [userId, balance] of Object.entries(balances)) {
    if (balance < 0) {
      debtors.push({ userId, amount: -balance });
    } else if (balance > 0) {
      creditors.push({ userId, amount: balance });
    }
  }

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transfers: DebtTransfer[] = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (
    debtorIndex < debtors.length &&
    creditorIndex < creditors.length
  ) {
    const currentDebtor = debtors[debtorIndex];
    const currentCreditor = creditors[creditorIndex];

    const settledAmount = Math.min(
      currentDebtor.amount,
      currentCreditor.amount
    );

    if (settledAmount > 0) {
      transfers.push({
        from: currentDebtor.userId,
        to: currentCreditor.userId,
        amount: settledAmount,
      });

      currentDebtor.amount -= settledAmount;
      currentCreditor.amount -= settledAmount;
    }

    if (currentDebtor.amount === 0) {
      debtorIndex++;
    }
    if (currentCreditor.amount === 0) {
      creditorIndex++;
    }
  }

  return transfers;
}
