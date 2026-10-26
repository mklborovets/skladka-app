export interface InviteDoc {
  token: string;
  groupId: string;
  createdBy: string;
  isUsed: boolean;
  usedBy: string | null;
  expiresAt: number;
}

export interface CreateInviteInput {
  groupId: string;
  createdBy: string;
  expiresInDays?: number;
}
