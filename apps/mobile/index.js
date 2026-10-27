// Silence @react-native-firebase v22 deprecation warnings in development
globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;

import { AppRegistry } from 'react-native';
import ReactNativeViewConfigRegistry from 'react-native/Libraries/Renderer/shims/ReactNativeViewConfigRegistry';

if (ReactNativeViewConfigRegistry && ReactNativeViewConfigRegistry.customDirectEventTypes) {
  ReactNativeViewConfigRegistry.customDirectEventTypes['topHeaderHeightChange'] = {
    registrationName: 'onHeaderHeightChange',
  };
  ReactNativeViewConfigRegistry.customDirectEventTypes['topTransitionProgress'] = {
    registrationName: 'onTransitionProgress',
  };
}

import { configureFirebase } from './src/shared/api/firebase';
import { App } from './src/app/App';
import { backgroundExpenseHeadlessTask } from './src/app/headless/backgroundListener';

configureFirebase();

AppRegistry.registerComponent('skladka', () => App);
AppRegistry.registerHeadlessTask(
  'BackgroundExpenseTask',
  () => backgroundExpenseHeadlessTask
);
