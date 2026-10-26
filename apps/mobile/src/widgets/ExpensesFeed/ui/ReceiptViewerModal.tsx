import React from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ReceiptDoc } from '@entities/receipt';
import { Button, ErrorBanner, colors, radius, spacing, typography } from '@shared/ui';

export interface ReceiptViewerModalProps {
  visible: boolean;
  receipt: ReceiptDoc | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
}

export const ReceiptViewerModal: React.FC<ReceiptViewerModalProps> = ({
  visible,
  receipt,
  isLoading,
  error,
  onClose,
}) => {
  const approxSizeKb = receipt
    ? Math.round(receipt.sizeBytes / 1024)
    : 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Receipt Document</Text>

          {isLoading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loaderText}>Loading receipt photo...</Text>
            </View>
          ) : error ? (
            <View>
              <ErrorBanner message={error} />
              <Button
                title="Close"
                onPress={onClose}
                variant="secondary"
                size="md"
                style={styles.closeBtn}
              />
            </View>
          ) : receipt?.base64Data ? (
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: `data:image/jpeg;base64,${receipt.base64Data}` }}
                style={styles.image}
                resizeMode="contain"
              />
              <Text style={styles.sizeText}>Image size: ~{approxSizeKb} KB</Text>
              <Button
                title="Close"
                onPress={onClose}
                variant="primary"
                size="md"
                style={styles.closeBtn}
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
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    maxHeight: '85%',
  },
  title: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  loaderContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  imageWrapper: {
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 340,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  sizeText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    fontSize: 11,
    marginVertical: spacing.sm,
  },
  closeBtn: {
    marginTop: spacing.xs,
    width: '100%',
  },
});
