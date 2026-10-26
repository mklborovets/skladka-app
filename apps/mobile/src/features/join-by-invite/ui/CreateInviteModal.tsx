import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button, ErrorBanner, colors, radius, spacing, typography } from '@shared/ui';
import { InviteDoc, inviteRepository } from '@entities/invite';

export interface CreateInviteModalProps {
  visible: boolean;
  groupId: string;
  creatorId: string;
  groupName?: string;
  onClose: () => void;
}

export const CreateInviteModal: React.FC<CreateInviteModalProps> = ({
  visible,
  groupId,
  creatorId,
  groupName,
  onClose,
}) => {
  const [invite, setInvite] = useState<InviteDoc | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const created = await inviteRepository.createInvite({
        groupId,
        createdBy: creatorId,
        expiresInDays: 7,
      });
      setInvite(created);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to create invite';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!invite) {
      return;
    }
    const deepLink = `skladka://invite/${invite.token}`;
    const message = groupName
      ? `Join "${groupName}" on SKLADKA to split shared expenses: ${deepLink}`
      : `Join our group on SKLADKA to split shared expenses: ${deepLink}`;

    try {
      await Share.share({
        message,
        url: deepLink,
      });
    } catch {}
  };

  const handleClose = () => {
    setInvite(null);
    setError(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Invite New Member</Text>
          <Text style={styles.description}>
            Generate a single-use invitation link valid for 7 days.
          </Text>

          {error && <ErrorBanner message={error} />}

          {invite ? (
            <View style={styles.resultContainer}>
              <View style={styles.linkBox}>
                <Text style={styles.linkLabel}>Deep Link</Text>
                <Text style={styles.linkText} selectable>
                  skladka://invite/{invite.token}
                </Text>
              </View>

              <Button
                title="Share Link"
                onPress={handleShare}
                variant="primary"
                size="md"
                style={styles.actionButton}
              />
              <Button
                title="Done"
                onPress={handleClose}
                variant="ghost"
                size="md"
              />
            </View>
          ) : (
            <View style={styles.actionContainer}>
              {isLoading ? (
                <ActivityIndicator
                  size="large"
                  color={colors.primary}
                  style={styles.loader}
                />
              ) : (
                <Button
                  title="Generate Invite Link"
                  onPress={handleGenerate}
                  variant="primary"
                  size="md"
                  style={styles.actionButton}
                />
              )}
              <Button
                title="Cancel"
                onPress={handleClose}
                disabled={isLoading}
                variant="ghost"
                size="md"
              />
            </View>
          )}
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
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  resultContainer: {
    marginTop: spacing.sm,
  },
  linkBox: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  linkLabel: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  linkText: {
    ...typography.bodySmall,
    color: colors.primaryLight,
    fontFamily: 'monospace',
  },
  actionContainer: {
    marginTop: spacing.md,
  },
  actionButton: {
    marginBottom: spacing.sm,
  },
  loader: {
    marginVertical: spacing.lg,
  },
});
