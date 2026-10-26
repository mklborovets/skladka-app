import { AppRegistry } from 'react-native';
import { configureFirebase } from './src/shared/api/firebase';
import { App } from './src/app/App';
import { backgroundExpenseHeadlessTask } from './src/app/headless/backgroundListener';

configureFirebase();

AppRegistry.registerComponent('skladka', () => App);
AppRegistry.registerHeadlessTask(
  'BackgroundExpenseTask',
  () => backgroundExpenseHeadlessTask
);
