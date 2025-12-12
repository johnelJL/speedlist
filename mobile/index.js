// Expo entry point that registers the React component tree.
import { registerRootComponent } from 'expo';
import App from './App';

// Ensure the native runtime bootstraps the App component on launch.
registerRootComponent(App);
