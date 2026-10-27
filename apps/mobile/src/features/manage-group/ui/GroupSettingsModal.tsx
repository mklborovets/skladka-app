import React, { useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GroupDoc } from '@entities/group';
import {
  Button,
  ErrorBanner,
  colors,
  radius,
  spacing,
  typography,
} from '@shared/ui';
import { useGroupManagement } from '../model/useGroupManagement';

export interface GroupSettingsModalProps {
  visible: boolean;
  group: GroupDoc | null;
  currentUserId: string;
  onClose: () => void;
  onGroupDeleted: () => void;
  onGroupLeft: () => void;
  onOpenInvite?: () => void;
}

export const GroupSettingsModal: React.FC<GroupSettingsModalProps> = ({
  visible,
  group,
  currentUserId,
  onClose,
  onGroupDeleted,
  onGroupLeft,
  onOpenInvite,
}) => {
  const {
    isCreator,
    isDeleting,
    isLeaving,
    error,
    formattedUserBalance,
    userBalance,
    isUserBalanceSettled,
    isAllBalancesSettled,
    confirmAndDelete,
    confirmAndLeave,
    clearError,
  } = useGroupManagement(group, currentUserId);

  useEffect(() => {
    if (visible) {
      clearError();
    }
  }, [visible]);

  if (!group) {
    return null;
  }

  const handleDelete = () => {
    confirmAndDelete(() => {
      onClose();
      onGroupDeleted();
    });
  };

  const handleLeave = () => {
    confirmAndLeave(() => {
      onClose();
      onGroupLeft();
    });
  };

  const balanceSign = userBalance > 0 ? '+' : userBalance < 0 ? '-' : '';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Group Settings</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Close settings"
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {error && <ErrorBanner message={error} containerStyle={styles.error} />}

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Group Name</Text>
              <Text style={styles.infoValue}>{group.name}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Currency</Text>
              <Text style={styles.infoValue}>{group.baseCurrency}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Members</Text>
              <Text style={styles.infoValue}>{group.memberIds.length}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Your Role</Text>
              <Text style={styles.infoValue}>{isCreator ? 'Creator (Admin)' : 'Member'}</Text>
            </View>
          </View>

          {onOpenInvite && (
            <Button
              title="+ Invite New Member"
              onPress={() => {
                onClose();
                onOpenInvite();
              }}
              variant="secondary"
              size="md"
              style={styles.inviteButton}
            />
          )}

          <View style={styles.dangerSection}>
            <Text style={styles.dangerTitle}>
              {isCreator ? 'Group Administration' : 'Membership'}
            </Text>

            {isCreator ? (
              <>
                <Text style={styles.dangerNotice}>
                  Deleting the group permanently removes it and its expenses for all members.
                  All member balances must be fully settled (0.00).
                </Text>
                {!isAllBalancesSettled && (
                  <View style={styles.warningBox}>
                    <Text style={styles.warningText}>
                      Cannot delete: Outstanding debts exist between members.
                    </Text>
                  </View>
                )}
                <Button
                  title="Delete Group"
                  onPress={handleDelete}
                  loading={isDeleting}
                  variant="ghost"
                  size="md"
                  style={styles.deleteButton}
                />
              </>
            ) : (
              <>
                <Text style={styles.dangerNotice}>
                  You can leave this group once your personal balance is 0.00.
                </Text>
                {!isUserBalanceSettled && (
                  <View style={styles.warningBox}>
                    <Text style={styles.warningText}>
                      Cannot leave: Your balance is {balanceSign}{formattedUserBalance} {group.baseCurrency}.
                    </Text>
                  </View>
                )}
                <Button
                  title="Leave Group"
                  onPress={handleLeave}
                  loading={isLeaving}
                  variant="ghost"
                  size="md"
                  style={styles.leaveButton}
                />
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.titleLarge,
    color: colors.textPrimary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    marginBottom: spacing.md,
  },
  infoCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  infoLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  infoValue: {
    ...typography.bodyRegular,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: 4,
  },
  inviteButton: {
    marginBottom: spacing.lg,
  },
  dangerSection: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  dangerTitle: {
    ...typography.label,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  dangerNotice: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  warningBox: {
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  warningText: {
    ...typography.bodySmall,
    color: colors.warning,
    fontSize: 12,
  },
  deleteButton: {
    borderColor: colors.danger,
    borderWidth: 1,
    marginTop: spacing.xs,
  },
  leaveButton: {
    borderColor: colors.warning,
    borderWidth: 1,
    marginTop: spacing.xs,
  },
});
