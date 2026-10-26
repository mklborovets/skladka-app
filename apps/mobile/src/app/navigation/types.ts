export type RootStackParamList = {
  Auth: undefined;
  GroupsList: undefined;
  GroupDetails: { groupId: string };
  CreateExpense: { groupId: string };
  InvitePreview: { token: string };
};
