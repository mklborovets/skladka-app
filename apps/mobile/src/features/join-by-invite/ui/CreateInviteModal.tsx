import React from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button, ErrorBanner, colors, radius, spacing, typography } from '@shared/ui';
import { useCreateInvite } from '../model/useCreateInvite';

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
  const {
    invite,
    isLoading,
    error,
    generateInvite,
    shareInvite,
    reset,
  } = useCreateInvite(groupId, creatorId, groupName);

  const handleClose = () => {
    reset();
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
                onPress={shareInvite}
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
                  onPress={generateInvite}
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
