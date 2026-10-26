import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@app/navigation/types';
import { InviteModal } from '@features/join-by-invite';
import { ScreenLayout } from '@shared/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'InvitePreview'>;

export const InvitePreviewScreen: React.FC<Props> = ({ route, navigation }) => {
  const { token } = route.params;

  return (
    <ScreenLayout>
      <InviteModal
        visible={true}
        token={token}
        onClose={() => navigation.navigate('GroupsList')}
        onJoin={() => navigation.navigate('GroupsList')}
      />
    </ScreenLayout>
  );
};
