import { Platform } from 'react-native';

export interface EnvironmentConfig {
  USE_FIREBASE_EMULATOR: boolean;
  EMULATOR_HOST: string;
  AUTH_EMULATOR_PORT: number;
  FIRESTORE_EMULATOR_PORT: number;
  FUNCTIONS_EMULATOR_PORT: number;
}

const defaultEmulatorHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const ENV: EnvironmentConfig = {
  USE_FIREBASE_EMULATOR: true,
  EMULATOR_HOST: defaultEmulatorHost,
  AUTH_EMULATOR_PORT: 9099,
  FIRESTORE_EMULATOR_PORT: 8080,
  FUNCTIONS_EMULATOR_PORT: 5001,
};
