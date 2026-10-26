import React from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button, ErrorBanner, colors, radius, spacing, typography } from '@shared/ui';
import { useInvitePreview } from '../model/useInvitePreview';

export interface InviteModalProps {
  token: string | null;
  visible: boolean;
  onClose: () => void;
  onJoin?: (groupId: string, token: string) => void;
  isJoining?: boolean;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  token,
  visible,
  onClose,
  onJoin,
  isJoining = false,
}) => {
  const { invite, group, isLoading, error, isExpired, isUsed, isValid } =
    useInvitePreview(visible ? token : null);

  const handleJoin = () => {
    if (group && token && onJoin) {
      onJoin(group.id, token);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Group Invitation</Text>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Checking invitation...</Text>
            </View>
          ) : error ? (
            <View>
              <ErrorBanner message={error} />
              <Button
                title="Close"
                onPress={onClose}
                variant="secondary"
                size="md"
                style={styles.closeButton}
              />
            </View>
          ) : isUsed ? (
            <View>
              <View style={styles.statusBox}>
                <Text style={styles.statusTitle}>Invitation Already Used</Text>
                <Text style={styles.statusText}>
                  This single-use invite has already been redeemed by another user.
                </Text>
              </View>
              <Button
                title="Close"
                onPress={onClose}
                variant="secondary"
                size="md"
                style={styles.closeButton}
              />
            </View>
          ) : isExpired ? (
            <View>
              <View style={styles.statusBox}>
                <Text style={styles.statusTitle}>Invitation Expired</Text>
                <Text style={styles.statusText}>
                  This invite link has exceeded its validity period.
                </Text>
              </View>
              <Button
                title="Close"
                onPress={onClose}
                variant="secondary"
                size="md"
                style={styles.closeButton}
              />
            </View>
          ) : isValid && group && invite ? (
            <View>
              <View style={styles.groupPreview}>
                <Text style={styles.groupName}>{group.name}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.groupMeta}>
                    Currency: {group.baseCurrency}
                  </Text>
                  <Text style={styles.groupMeta}>
                    {group.memberIds.length} members
                  </Text>
                </View>
              </View>

              <Text style={styles.infoText}>
                You have been invited to participate in this group. You will be able
                to add expenses and track balances.
              </Text>

              <Button
                title="Join Group"
                onPress={handleJoin}
                loading={isJoining}
                variant="primary"
                size="lg"
                style={styles.joinButton}
              />

              <Button
                title="Cancel"
                onPress={onClose}
                disabled={isJoining}
                variant="ghost"
                size="md"
              />
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  title: {
    ...typography.titleLarge,
    fontSize: 22,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  loadingContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  statusBox: {
    backgroundColor: colors.warningBg,
    borderColor: colors.warningBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginVertical: spacing.md,
  },
  statusTitle: {
    ...typography.titleMedium,
    color: colors.warning,
    marginBottom: spacing.xs,
  },
  statusText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  groupPreview: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  groupName: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  groupMeta: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 18,
  },
  joinButton: {
    marginBottom: spacing.sm,
  },
  closeButton: {
    marginTop: spacing.md,
  },
});
