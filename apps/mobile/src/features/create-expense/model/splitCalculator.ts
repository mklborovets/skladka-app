export type SplitType = 'EQUAL' | 'SHARES' | 'EXACT';

export interface MemberSplitPreview {
  userId: string;
  share: number;
  calculatedAmount: number;
}

export function calculateEqualSplit(
  totalAmount: number,
  memberIds: string[]
): Record<string, number> {
  if (memberIds.length === 0 || totalAmount <= 0) {
    return {};
  }

  const count = memberIds.length;
  const baseShare = Math.floor(totalAmount / count);
  const remainder = totalAmount - baseShare * count;

  const splits: Record<string, number> = {};
  memberIds.forEach((uid, index) => {
    splits[uid] = index === 0 ? baseShare + remainder : baseShare;
  });

  return splits;
}

export function calculateSharesSplit(
  totalAmount: number,
  memberIds: string[],
  shares: Record<string, number>
): Record<string, number> {
  if (memberIds.length === 0 || totalAmount <= 0) {
    return {};
  }

  let totalShares = 0;
  memberIds.forEach(uid => {
    const s = Math.max(0, shares[uid] ?? 1);
    totalShares += s;
  });

  if (totalShares === 0) {
    return calculateEqualSplit(totalAmount, memberIds);
  }

  const splits: Record<string, number> = {};
  let allocated = 0;

  memberIds.forEach(uid => {
    const s = Math.max(0, shares[uid] ?? 1);
    const amount = Math.floor((totalAmount * s) / totalShares);
    splits[uid] = amount;
    allocated += amount;
  });

  let remainder = totalAmount - allocated;
  let i = 0;
  while (remainder > 0 && i < memberIds.length) {
    splits[memberIds[i]] += 1;
    remainder -= 1;
    i++;
  }

  return splits;
}

export function validateExactSplits(
  totalAmount: number,
  memberIds: string[],
  exactSplits: Record<string, number>
): { isValid: boolean; difference: number; splits: Record<string, number> } {
  const splits: Record<string, number> = {};
  let currentSum = 0;

  memberIds.forEach(uid => {
    const amount = Math.max(0, Math.round(exactSplits[uid] ?? 0));
    splits[uid] = amount;
    currentSum += amount;
  });

  const difference = totalAmount - currentSum;
  return {
    isValid: difference === 0,
    difference,
    splits,
  };
}

export function computeSplits(
  splitType: SplitType,
  totalAmount: number,
  memberIds: string[],
  userValues: Record<string, number>
): { splits: Record<string, number>; isValid: boolean; errorMessage?: string } {
  if (totalAmount <= 0) {
    return { splits: {}, isValid: false, errorMessage: 'Amount must be greater than zero' };
  }

  if (memberIds.length === 0) {
    return { splits: {}, isValid: false, errorMessage: 'Group has no members' };
  }

  if (memberIds.length > 10) {
    return { splits: {}, isValid: false, errorMessage: 'Maximum 10 members allowed for split' };
  }

  if (splitType === 'EQUAL') {
    const splits = calculateEqualSplit(totalAmount, memberIds);
    return { splits, isValid: true };
  }

  if (splitType === 'SHARES') {
    const splits = calculateSharesSplit(totalAmount, memberIds, userValues);
    return { splits, isValid: true };
  }

  if (splitType === 'EXACT') {
    const { isValid, difference, splits } = validateExactSplits(
      totalAmount,
      memberIds,
      userValues
    );
    if (!isValid) {
      const diffFormatted = (Math.abs(difference) / 100).toFixed(2);
      const msg =
        difference > 0
          ? `Remaining amount to allocate: ${diffFormatted}`
          : `Allocated amount exceeds total by: ${diffFormatted}`;
      return { splits, isValid: false, errorMessage: msg };
    }
    return { splits, isValid: true };
  }

  return { splits: {}, isValid: false, errorMessage: 'Invalid split type' };
}
