import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@app/navigation/types';
import {
  AppHeader,
  Button,
  EmptyState,
  ErrorBanner,
  ScreenLayout,
  colors,
  spacing,
} from '@shared/ui';
import { GroupCard, GroupDoc, useUserGroups } from '@entities/group';
import { CreateGroupModal } from '@features/create-group';
import { CreateInviteModal } from '@features/join-by-invite';
import { ProfileModal } from '@features/auth';
import { useAuth } from '@app/providers';

export interface GroupsListScreenProps {
  onSelectGroup?: (groupId: string) => void;
  onOpenProfile?: () => void;
}

export const GroupsListScreen: React.FC<GroupsListScreenProps> = ({
  onSelectGroup,
  onOpenProfile,
}) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const { groups, isLoading, error } = useUserGroups(user?.uid);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isProfileVisible, setIsProfileVisible] = useState<boolean>(false);
  const [inviteTargetGroup, setInviteTargetGroup] = useState<GroupDoc | null>(
    null
  );


  if (!user) {
    return null;
  }

  const handleSelectGroup = (groupId: string) => {
    if (onSelectGroup) {
      onSelectGroup(groupId);
    } else {
      navigation.navigate('GroupDetails', { groupId });
    }
  };

  return (
    <ScreenLayout scrollable>
      <AppHeader
        title="My Groups"
        subtitle="Shared expense pools"
        rightSlot={
          <View style={styles.headerActions}>
            <Button
              title="+ New"
              onPress={() => setIsModalVisible(true)}
              variant="primary"
              size="sm"
              style={styles.newButton}
            />
            <Button
              title="Profile"
              onPress={() => {
                if (onOpenProfile) {
                  onOpenProfile();
                } else {
                  setIsProfileVisible(true);
                }
              }}
              variant="ghost"
              size="sm"
            />
          </View>
        }
      />

      {error && <ErrorBanner message={error} />}

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : groups.length === 0 ? (
        <EmptyState
          title="No Groups Yet"
          description="Create your first group to start splitting bills and tracking balances with friends"
          actionLabel="Create Group"
          onAction={() => setIsModalVisible(true)}
        />
      ) : (
        <View style={styles.list}>
          {groups.map(group => (
            <GroupCard
              key={group.id}
              group={group}
              currentUserId={user.uid}
              onPress={() => handleSelectGroup(group.id)}
              onInvite={() => setInviteTargetGroup(group)}
            />
          ))}
        </View>
      )}

      <CreateGroupModal
        visible={isModalVisible}
        creatorId={user.uid}
        creatorName={user.displayName || undefined}
        onClose={() => setIsModalVisible(false)}
        onSuccess={groupId => {
          setIsModalVisible(false);
          handleSelectGroup(groupId);
        }}
      />

      {inviteTargetGroup && (
        <CreateInviteModal
          visible={Boolean(inviteTargetGroup)}
          groupId={inviteTargetGroup.id}
          groupName={inviteTargetGroup.name}
          creatorId={user.uid}
          onClose={() => setInviteTargetGroup(null)}
        />
      )}

      <ProfileModal
        visible={isProfileVisible}
        onClose={() => setIsProfileVisible(false)}
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  newButton: {
    marginRight: spacing.xs,
  },
  loaderContainer: {
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    marginTop: spacing.sm,
  },
});
