import { Platform } from 'react-native';

export interface EnvironmentConfig {
  USE_FIREBASE_EMULATOR: boolean;
  EMULATOR_HOST: string;
  AUTH_EMULATOR_PORT: number;
  FIRESTORE_EMULATOR_PORT: number;
  FUNCTIONS_EMULATOR_PORT: number;
  GOOGLE_WEB_CLIENT_ID?: string;
}

const defaultEmulatorHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const ENV: EnvironmentConfig = {
  USE_FIREBASE_EMULATOR: false,
  EMULATOR_HOST: defaultEmulatorHost,
  AUTH_EMULATOR_PORT: 9099,
  FIRESTORE_EMULATOR_PORT: 8080,
  FUNCTIONS_EMULATOR_PORT: 5001,
  GOOGLE_WEB_CLIENT_ID:
    '743932074539-2k8tljo8l75fpds92vltajvgd6ha4a1u.apps.googleusercontent.com',
};
