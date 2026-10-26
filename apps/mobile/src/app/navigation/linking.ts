import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from './types';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['skladka://'],
  config: {
    screens: {
      InvitePreview: 'invite/:token',
      GroupsList: 'groups',
      Auth: 'auth',
    },
  },
};
