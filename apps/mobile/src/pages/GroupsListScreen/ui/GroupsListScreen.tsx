import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import {
  AppHeader,
  Button,
  EmptyState,
  ErrorBanner,
  ScreenLayout,
  colors,
  spacing,
} from '@shared/ui';
import { GroupCard, GroupDoc, groupRepository } from '@entities/group';
import { CreateGroupModal } from '@features/create-group';
import { useAuth } from '@app/providers';

export interface GroupsListScreenProps {
  onSelectGroup?: (groupId: string) => void;
  onOpenProfile?: () => void;
}

export const GroupsListScreen: React.FC<GroupsListScreenProps> = ({
  onSelectGroup,
  onOpenProfile,
}) => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<GroupDoc[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = groupRepository.subscribeToUserGroups(
      user.uid,
      loadedGroups => {
        setGroups(loadedGroups);
        setIsLoading(false);
      },
      err => {
        setError(err.message);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  if (!user) {
    return null;
  }

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
            {onOpenProfile && (
              <Button
                title="Profile"
                onPress={onOpenProfile}
                variant="ghost"
                size="sm"
              />
            )}
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
              onPress={() => onSelectGroup?.(group.id)}
            />
          ))}
        </View>
      )}

      <CreateGroupModal
        visible={isModalVisible}
        creatorId={user.uid}
        onClose={() => setIsModalVisible(false)}
        onSuccess={groupId => {
          setIsModalVisible(false);
          onSelectGroup?.(groupId);
        }}
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
