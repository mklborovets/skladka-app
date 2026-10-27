import assert from 'node:assert';
import { describe, it } from 'node:test';

function deriveNicknameFromEmail(email: string | null | undefined): string {
  if (!email) {
    return '';
  }
  const atIndex = email.indexOf('@');
  const prefix = atIndex !== -1 ? email.substring(0, atIndex).trim() : email.trim();
  if (!prefix) {
    return '';
  }
  if (prefix.length <= 5) {
    return prefix;
  }
  return prefix.slice(0, 5);
}

interface ResolveMemberNamesOptions {
  memberIds?: string[];
  memberNames?: Record<string, string>;
  currentUserId?: string;
  currentUserNickname?: string;
}

function resolveGroupMemberNames({
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

function getDebtPartyName(
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

describe('Nickname Derivation from Email', () => {
  it('takes full prefix when email prefix is 5 or fewer characters', () => {
    assert.strictEqual(deriveNicknameFromEmail('alex@domain.com'), 'alex');
    assert.strictEqual(deriveNicknameFromEmail('al@domain.com'), 'al');
    assert.strictEqual(deriveNicknameFromEmail('a@b.com'), 'a');
    assert.strictEqual(deriveNicknameFromEmail('misha@domain.com'), 'misha');
  });

  it('takes first 5 letters when email prefix is longer than 5 characters', () => {
    assert.strictEqual(deriveNicknameFromEmail('alexander@domain.com'), 'alexa');
    assert.strictEqual(deriveNicknameFromEmail('oleksandr@example.com'), 'oleks');
    assert.strictEqual(deriveNicknameFromEmail('dmytro@example.com'), 'dmytr');
    assert.strictEqual(deriveNicknameFromEmail('maria.smith@example.com'), 'maria');
  });

  it('handles empty or missing email cleanly', () => {
    assert.strictEqual(deriveNicknameFromEmail(''), '');
    assert.strictEqual(deriveNicknameFromEmail(null), '');
    assert.strictEqual(deriveNicknameFromEmail(undefined), '');
  });
});

describe('Group Member Names Resolution and Disambiguation', () => {
  it('disambiguates multiple anonymous members in a group so they are never identical', () => {
    const memberIds = ['anon_1', 'anon_2'];
    const resolved = resolveGroupMemberNames({ memberIds });

    assert.strictEqual(resolved['anon_1'], 'Anon #1');
    assert.strictEqual(resolved['anon_2'], 'Anon #2');
    assert.notStrictEqual(resolved['anon_1'], resolved['anon_2']);
  });

  it('handles three anonymous members distinctly', () => {
    const memberIds = ['uid_a', 'uid_b', 'uid_c'];
    const resolved = resolveGroupMemberNames({ memberIds });

    assert.strictEqual(resolved['uid_a'], 'Anon #1');
    assert.strictEqual(resolved['uid_b'], 'Anon #2');
    assert.strictEqual(resolved['uid_c'], 'Anon #3');
  });

  it('preserves custom nicknames for named members alongside anonymous members', () => {
    const memberIds = ['user_vova', 'anon_1', 'anon_2'];
    const memberNames = { user_vova: 'Vova' };
    const resolved = resolveGroupMemberNames({ memberIds, memberNames });

    assert.strictEqual(resolved['user_vova'], 'Vova');
    assert.strictEqual(resolved['anon_1'], 'Anon #1');
    assert.strictEqual(resolved['anon_2'], 'Anon #2');
  });

  it('disambiguates collisions when two members choose the exact same nickname', () => {
    const memberIds = ['user_1', 'user_2'];
    const memberNames = { user_1: 'Alex', user_2: 'Alex' };
    const resolved = resolveGroupMemberNames({ memberIds, memberNames });

    assert.strictEqual(resolved['user_1'], 'Alex (1)');
    assert.strictEqual(resolved['user_2'], 'Alex (2)');
  });

  it('correctly formats debt settlement party name without UID or "user owes user"', () => {
    const resolved = {
      user_1: 'Alex',
      user_2: 'Anon #1',
      user_3: 'Anon #2',
    };

    // Current user is user_1
    assert.strictEqual(getDebtPartyName('user_1', 'user_1', resolved), 'You');
    assert.strictEqual(getDebtPartyName('user_2', 'user_1', resolved), 'Anon #1');

    // Transfer between two anonymous users seen by user_1:
    const sender = getDebtPartyName('user_2', 'user_1', resolved);
    const receiver = getDebtPartyName('user_3', 'user_1', resolved);
    assert.strictEqual(sender, 'Anon #1');
    assert.strictEqual(receiver, 'Anon #2');
    assert.notStrictEqual(sender, receiver, 'Transfers between anons must not have identical names');
  });
});
