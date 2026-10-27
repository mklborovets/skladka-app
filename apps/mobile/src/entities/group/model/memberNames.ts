export interface ResolveMemberNamesOptions {
  memberIds?: string[];
  memberNames?: Record<string, string>;
  currentUserId?: string;
  currentUserNickname?: string;
}

export function resolveGroupMemberNames({
  memberIds = [],
  memberNames = {},
  currentUserId,
  currentUserNickname,
}: ResolveMemberNamesOptions): Record<string, string> {
  const result: Record<string, string> = {};

  let anonCount = 0;
  for (const uid of memberIds) {
    const raw = (memberNames[uid] || (uid === currentUserId ? currentUserNickname : '') || '').trim();
    if (!raw) {
      anonCount++;
    }
  }

  let currentAnonIndex = 1;
  const namedCandidates: { uid: string; name: string }[] = [];

  for (const uid of memberIds) {
    const raw = (memberNames[uid] || (uid === currentUserId ? currentUserNickname : '') || '').trim();
    if (raw) {
      namedCandidates.push({ uid, name: raw });
    } else {
      result[uid] = anonCount > 1 ? `Anon #${currentAnonIndex++}` : 'Anon';
    }
  }

  const nameCounts: Record<string, number> = {};
  for (const item of namedCandidates) {
    nameCounts[item.name] = (nameCounts[item.name] || 0) + 1;
  }

  const nameOccurrences: Record<string, number> = {};
  for (const item of namedCandidates) {
    if (nameCounts[item.name] > 1) {
      const occurrence = (nameOccurrences[item.name] || 0) + 1;
      nameOccurrences[item.name] = occurrence;
      result[item.uid] = `${item.name} (${occurrence})`;
    } else {
      result[item.uid] = item.name;
    }
  }

  return result;
}

export function getDebtPartyName(
  userId: string,
  currentUserId: string,
  resolvedMemberNames: Record<string, string> = {}
): string {
  if (userId === currentUserId) {
    return 'You';
  }
  if (resolvedMemberNames[userId]) {
    return resolvedMemberNames[userId];
  }
  const shortId = userId.length > 4 ? userId.slice(-4) : userId;
  return `Anon #${shortId}`;
}
