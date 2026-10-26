import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import {
  Button,
  colors,
  radius,
  spacing,
  typography,
} from '@shared/ui';

export interface ReceiptPickerButtonProps {
  base64Preview: string | null;
  onPick: (sourceUri: string | null) => void;
  loading?: boolean;
}

export const ReceiptPickerButton: React.FC<ReceiptPickerButtonProps> = ({
  base64Preview,
  onPick,
  loading = false,
}) => {
  const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false);

  const handleLaunchCamera = async () => {
    setIsDialogVisible(false);
    const result = await launchCamera({
      mediaType: 'photo',
      quality: 1,
      saveToPhotos: true,
    });
    const asset = result.assets?.[0];
    if (asset?.uri) {
      onPick(asset.uri);
    }
  };

  const handleLaunchLibrary = async () => {
    setIsDialogVisible(false);
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 1,
    });
    const asset = result.assets?.[0];
    if (asset?.uri) {
      onPick(asset.uri);
    }
  };

  const approxSizeKb = base64Preview
    ? Math.round((base64Preview.length * 3) / 4 / 1024)
    : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Receipt Photo</Text>

      {base64Preview ? (
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: `data:image/jpeg;base64,${base64Preview}` }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
          <View style={styles.previewInfo}>
            <Text style={styles.attachedText}>Receipt attached</Text>
            <Text style={styles.sizeText}>Compressed: ~{approxSizeKb} KB</Text>
            <TouchableOpacity
              onPress={() => onPick(null)}
              activeOpacity={0.7}
              style={styles.removeBtn}
            >
              <Text style={styles.removeBtnText}>Remove photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View>
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Compressing receipt...</Text>
            </View>
          ) : (
            <Button
              title="Attach Receipt Photo"
              onPress={() => setIsDialogVisible(true)}
              variant="outline"
              size="md"
              style={styles.attachButton}
            />
          )}
        </View>
      )}

      <Modal
        visible={isDialogVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDialogVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Choose Receipt Source</Text>
            <Button
              title="Take Photo with Camera"
              onPress={handleLaunchCamera}
              variant="primary"
              size="md"
              style={styles.dialogBtn}
            />
            <Button
              title="Choose from Gallery"
              onPress={handleLaunchLibrary}
              variant="secondary"
              size="md"
              style={styles.dialogBtn}
            />
            <Button
              title="Cancel"
              onPress={() => setIsDialogVisible(false)}
              variant="ghost"
              size="md"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  attachButton: {
    borderStyle: 'dashed',
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface,
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceElevated,
  },
  previewInfo: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  attachedText: {
    ...typography.bodyRegular,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  sizeText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: 2,
  },
  removeBtn: {
    marginTop: spacing.xs,
  },
  removeBtnText: {
    ...typography.label,
    color: colors.danger,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modalCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  modalTitle: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  dialogBtn: {
    marginBottom: spacing.sm,
  },
});
