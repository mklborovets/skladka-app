import React from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, ErrorBanner, colors, radius, spacing, typography } from '@shared/ui';
import { useAuth } from '@app/providers';
import { GoogleUpgradeBanner } from './GoogleUpgradeBanner';

export interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  visible,
  onClose,
}) => {
  const { user, isAnonymous, isLoading, error, linkWithGoogle, signOut } =
    useAuth();

  if (!user) {
    return null;
  }

  const handleSignOut = () => {
    if (isAnonymous) {
      Alert.alert(
        'Sign out of anonymous account?',
        'Warning: You are currently signed in as a guest. If you sign out without linking to Google, this anonymous profile and access to your groups will be permanently lost on this device.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign Out Anyway',
            style: 'destructive',
            onPress: async () => {
              onClose();
              await signOut();
            },
          },
        ]
      );
    } else {
      Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            onClose();
            await signOut();
          },
        },
      ]);
    }
  };

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
              <Text style={styles.avatarText}>
                {isAnonymous
                  ? '👤'
                  : (user.displayName?.[0] || user.email?.[0] || 'U').toUpperCase()}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <View style={styles.badgeRow}>
                <Text style={styles.userName}>
                  {user.displayName ||
                    (isAnonymous ? 'Anonymous User' : 'User')}
                </Text>
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
            onPress={handleSignOut}
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
