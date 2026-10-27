import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@app/navigation/types';
import { useAuth } from '@app/providers';
import { InviteModal, useAcceptInvite } from '@features/join-by-invite';
import { ScreenLayout } from '@shared/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'InvitePreview'>;

export const InvitePreviewScreen: React.FC<Props> = ({ route, navigation }) => {
  const { token } = route.params;
  const { user } = useAuth();
  const { acceptInvite, isJoining } = useAcceptInvite();

  const handleJoin = async () => {
    if (!user) {
      return;
    }
    const joinedGroupId = await acceptInvite(
      token,
      user.uid,
      user.displayName || undefined
    );
    if (joinedGroupId) {
      navigation.navigate('GroupDetails', { groupId: joinedGroupId });
    } else {
      navigation.navigate('GroupsList');
    }
  };

  return (
    <ScreenLayout>
      <InviteModal
        visible={true}
        token={token}
        isJoining={isJoining}
        onClose={() => navigation.navigate('GroupsList')}
        onJoin={handleJoin}
      />
    </ScreenLayout>
  );
};
