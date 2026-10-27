export function deriveNicknameFromEmail(email: string | null | undefined): string {
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
