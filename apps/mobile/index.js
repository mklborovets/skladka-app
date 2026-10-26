import { AppRegistry } from 'react-native';
import { configureFirebase } from './src/shared/api/firebase';
import { App } from './src/app/App';

configureFirebase();

AppRegistry.registerComponent('skladka', () => App);
