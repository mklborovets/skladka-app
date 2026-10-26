import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';
import { ENV } from '../config';

let isConfigured = false;

export function configureFirebase(): void {
  if (isConfigured) {
    return;
  }

  firestore().settings({
    persistence: true,
    cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED,
  });

  if (__DEV__ && ENV.USE_FIREBASE_EMULATOR) {
    const host = ENV.EMULATOR_HOST;
    auth().useEmulator(`http://${host}:${ENV.AUTH_EMULATOR_PORT}`);
    firestore().useEmulator(host, ENV.FIRESTORE_EMULATOR_PORT);
    functions().useEmulator(host, ENV.FUNCTIONS_EMULATOR_PORT);
  }

  isConfigured = true;
}

export { auth, firestore, functions };
