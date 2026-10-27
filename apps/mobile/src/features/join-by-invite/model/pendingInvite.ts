let currentPendingToken: string | null = null;
const listeners = new Set<(token: string | null) => void>();

export const pendingInviteStore = {
  get(): string | null {
    return currentPendingToken;
  },
  set(token: string | null): void {
    currentPendingToken = token;
    listeners.forEach(cb => {
      try {
        cb(token);
      } catch {}
    });
  },
  subscribe(cb: (token: string | null) => void): () => void {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  },
};

export const parseInviteTokenFromUrl = (url: string): string | null => {
  if (!url) {
    return null;
  }
  // Matches skladka://invite/<token> or https://.../invite/<token>
  const match = url.match(/invite\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
};
