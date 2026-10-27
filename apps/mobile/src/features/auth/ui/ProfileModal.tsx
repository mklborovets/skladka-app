import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Button,
  ErrorBanner,
  PencilIcon,
  colors,
  radius,
  spacing,
  typography,
} from '@shared/ui';
import { useProfileModal } from '../model/useProfileModal';
import { GoogleUpgradeBanner } from './GoogleUpgradeBanner';

export interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  visible,
  onClose,
}) => {
  const {
    user,
    isAnonymous,
    isLoading,
    error,
    displayLabel,
    avatarLetter,
    isEditingNick,
    nickInput,
    nickError,
    isSavingNick,
    setNickInput,
    startEditingNickname,
    saveNickname,
    cancelEditingNickname,
    confirmAndSignOut,
    linkWithGoogle,
  } = useProfileModal(visible, onClose);

  if (!user) {
    return null;
  }

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
            <Text style={styles.title}>My Profile</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {error && <ErrorBanner message={error} containerStyle={styles.error} />}

          <View style={styles.userCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{avatarLetter}</Text>
            </View>
            <View style={styles.userInfo}>
              <View style={styles.badgeRow}>
                <View style={styles.nameWithEditRow}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {displayLabel}
                  </Text>
                  <TouchableOpacity
                    onPress={startEditingNickname}
                    style={styles.editPencilBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel="Edit nickname"
                  >
                    <PencilIcon size={14} color={colors.primaryLight} />
                  </TouchableOpacity>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    isAnonymous ? styles.anonBadge : styles.googleBadge,
                  ]}
                >
                  <Text style={styles.statusBadgeText}>
                    {isAnonymous ? 'Anonymous' : 'Google'}
                  </Text>
                </View>
              </View>

              {isEditingNick ? (
                <View style={styles.editSection}>
                  <View style={styles.nickInputRow}>
                    <TextInput
                      style={styles.nickInput}
                      value={nickInput}
                      onChangeText={setNickInput}
                      placeholder="Enter nickname"
                      placeholderTextColor={colors.textMuted}
                      autoFocus
                      maxLength={20}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      onPress={saveNickname}
                      disabled={isSavingNick}
                      style={[styles.nickBtn, styles.nickSaveBtn]}
                    >
                      <Text style={styles.nickSaveText}>
                        {isSavingNick ? '...' : 'Save'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={cancelEditingNickname}
                      disabled={isSavingNick}
                      style={[styles.nickBtn, styles.nickCancelBtn]}
                    >
                      <Text style={styles.nickCancelText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                  {nickError && (
                    <Text style={styles.nickErrorText}>{nickError}</Text>
                  )}
                </View>
              ) : null}

              {user.email ? (
                <Text style={styles.userEmail}>{user.email}</Text>
              ) : null}
              <Text
                style={styles.userUid}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                UID: {user.uid}
              </Text>
            </View>
          </View>

          {isAnonymous && (
            <GoogleUpgradeBanner
              onUpgrade={linkWithGoogle}
              loading={isLoading}
              error={null}
            />
          )}

          <Button
            title="Sign Out"
            onPress={confirmAndSignOut}
            loading={isLoading}
            variant="ghost"
            size="md"
            style={styles.signOutButton}
          />
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
    padding: spacing.md,
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 440,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.titleMedium,
    color: colors.textPrimary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  closeText: {
    fontSize: 18,
    color: colors.textMuted,
  },
  error: {
    marginBottom: spacing.md,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  userInfo: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userName: {
    ...typography.bodyRegular,
    fontWeight: '600',
    color: colors.textPrimary,
    flexShrink: 1,
  },
  nameWithEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
    marginRight: spacing.xs,
  },
  editPencilBtn: {
    padding: 3,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  editSection: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  nickInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  nickInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    color: colors.textPrimary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    fontSize: 13,
  },
  nickBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.sm,
  },
  nickSaveBtn: {
    backgroundColor: colors.primary,
  },
  nickSaveText: {
    ...typography.label,
    color: colors.primaryText,
    fontSize: 11,
    fontWeight: '700',
  },
  nickCancelBtn: {
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  nickCancelText: {
    ...typography.label,
    color: colors.textSecondary,
    fontSize: 11,
  },
  nickErrorText: {
    ...typography.bodySmall,
    color: colors.danger,
    fontSize: 11,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  anonBadge: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
  },
  googleBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  userEmail: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  userUid: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: 2,
  },
  signOutButton: {
    marginTop: spacing.sm,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
});
