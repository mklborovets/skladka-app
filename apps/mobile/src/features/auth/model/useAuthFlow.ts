import { useEffect, useState } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { ENV } from '@shared/config';

let isGoogleConfigured = false;

function ensureGoogleConfigured(): void {
  if (isGoogleConfigured) {
    return;
  }
  GoogleSignin.configure({
    webClientId: ENV.GOOGLE_WEB_CLIENT_ID,
    offlineAccess: false,
  });
  isGoogleConfigured = true;
}

export interface UseAuthFlowReturn {
  user: FirebaseAuthTypes.User | null;
  isAnonymous: boolean;
  isLoading: boolean;
  error: string | null;
  signInAnonymously: () => Promise<void>;
  linkWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthFlow = (): UseAuthFlowReturn => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(
    auth().currentUser
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ensureGoogleConfigured();
    const unsubscribe = auth().onAuthStateChanged(nextUser => {
      setUser(nextUser);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const clearError = () => {
    setError(null);
  };

  const signInAnonymously = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await auth().signInAnonymously();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Помилка анонімного входу';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const linkWithGoogle = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      ensureGoogleConfigured();

      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const response = await GoogleSignin.signIn();

      if (response.type !== 'success') {
        setIsLoading(false);
        return;
      }

      const idToken = response.data.idToken;
      if (!idToken) {
        throw new Error('Не вдалося отримати токен авторизації Google');
      }

      const credential = auth.GoogleAuthProvider.credential(idToken);
      const currentUser = auth().currentUser;

      if (currentUser) {
        await currentUser.linkWithCredential(credential);
      } else {
        await auth().signInWithCredential(credential);
      }
    } catch (err: unknown) {
      const errorObj = err as { code?: string; message?: string };
      if (errorObj?.code === statusCodes.SIGN_IN_CANCELLED) {
        setIsLoading(false);
        return;
      }
      if (errorObj?.code === statusCodes.IN_PROGRESS) {
        setIsLoading(false);
        return;
      }
      if (errorObj?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setError('Служби Google Play недоступні або застарілі');
        return;
      }
      if (
        errorObj?.code === 'auth/credential-already-in-use' ||
        errorObj?.code === 'auth/email-already-in-use'
      ) {
        setError('Цей Google акаунт уже привʼязаний до іншого користувача');
        return;
      }
      const message =
        err instanceof Error ? err.message : 'Помилка авторизації через Google';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await GoogleSignin.signOut().catch(() => null);
      await auth().signOut();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Помилка виходу з акаунта';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isAnonymous: Boolean(user?.isAnonymous),
    isLoading,
    error,
    signInAnonymously,
    linkWithGoogle,
    signOut,
    clearError,
  };
};
