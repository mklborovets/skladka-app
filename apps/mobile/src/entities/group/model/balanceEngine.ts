export function computeUpdatedBalances(
  currentBalances: Record<string, number>,
  paidBy: string,
  baseAmount: number,
  splits: Record<string, number>
): Record<string, number> {
  const next: Record<string, number> = { ...currentBalances };
  next[paidBy] = (next[paidBy] ?? 0) + baseAmount;

  for (const [uid, splitShare] of Object.entries(splits)) {
    next[uid] = (next[uid] ?? 0) - splitShare;
  }
  return next;
}
