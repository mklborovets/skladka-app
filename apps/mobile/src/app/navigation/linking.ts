import { Linking } from 'react-native';
import { LinkingOptions } from '@react-navigation/native';
import { parseInviteTokenFromUrl, pendingInviteStore } from '@features/join-by-invite';
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
  async getInitialURL() {
    const url = await Linking.getInitialURL();
    if (url) {
      const token = parseInviteTokenFromUrl(url);
      if (token) {
        pendingInviteStore.set(token);
      }
    }
    return url;
  },
  subscribe(listener) {
    const onReceiveURL = ({ url }: { url: string }) => {
      const token = parseInviteTokenFromUrl(url);
      if (token) {
        pendingInviteStore.set(token);
      }
      listener(url);
    };
    const subscription = Linking.addEventListener('url', onReceiveURL);
    return () => {
      subscription.remove();
    };
  },
};

