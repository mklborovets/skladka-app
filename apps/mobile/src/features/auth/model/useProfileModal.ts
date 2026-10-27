import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '@app/providers';
import { deriveNicknameFromEmail } from '@shared/lib';

export interface UseProfileModalReturn {
  user: ReturnType<typeof useAuth>['user'];
  isAnonymous: boolean;
  isLoading: boolean;
  error: string | null;
  displayLabel: string;
  avatarLetter: string;
  isEditingNick: boolean;
  nickInput: string;
  nickError: string | null;
  isSavingNick: boolean;
  setNickInput: (value: string) => void;
  startEditingNickname: () => void;
  saveNickname: () => Promise<void>;
  cancelEditingNickname: () => void;
  confirmAndSignOut: () => void;
  linkWithGoogle: () => Promise<void>;
}

export const useProfileModal = (
  visible: boolean,
  onClose: () => void
): UseProfileModalReturn => {
  const {
    user,
    isAnonymous,
    isLoading,
    error,
    linkWithGoogle,
    signOut,
    updateNickname,
    clearError,
  } = useAuth();

  const [isEditingNick, setIsEditingNick] = useState<boolean>(false);
  const [nickInput, setNickInput] = useState<string>('');
  const [nickError, setNickError] = useState<string | null>(null);
  const [isSavingNick, setIsSavingNick] = useState<boolean>(false);

  const currentNickname =
    user?.displayName ||
    (user?.email ? deriveNicknameFromEmail(user.email) : '');
  const displayLabel = currentNickname || (isAnonymous ? 'Guest' : 'User');
  const avatarLetter = (
    currentNickname?.[0] ||
    user?.email?.[0] ||
    (isAnonymous ? 'G' : 'U')
  ).toUpperCase();

  useEffect(() => {
    if (visible) {
      clearError();
      setIsEditingNick(false);
      setNickError(null);
    }
  }, [visible, clearError]);

  const startEditingNickname = () => {
    setNickInput(currentNickname);
    setNickError(null);
    setIsEditingNick(true);
  };

  const cancelEditingNickname = () => {
    setIsEditingNick(false);
    setNickError(null);
  };

  const saveNickname = async (): Promise<void> => {
    const trimmed = nickInput.trim();
    if (!trimmed) {
      setNickError('Nickname cannot be empty');
      return;
    }
    if (trimmed.length > 20) {
      setNickError('Maximum 20 characters');
      return;
    }

    try {
      setIsSavingNick(true);
      setNickError(null);
      await updateNickname(trimmed);
      setIsEditingNick(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save nickname';
      setNickError(msg);
    } finally {
      setIsSavingNick(false);
    }
  };

  const confirmAndSignOut = () => {
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

  return {
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
  };
};
