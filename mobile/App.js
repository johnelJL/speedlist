// Root entry for the Expo mobile app; wires up providers and navigation.
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';
import { AppState } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';

// Shared query client configuration keeps network requests resilient and cached.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60 * 1000
    }
  }
});

// Keep react-query aware of when the app returns to the foreground.
focusManager.setEventListener((handleFocus) => {
  const subscription = AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      handleFocus();
    }
  });
  return () => subscription.remove();
});

export default function App() {
  // Providers wrap the navigation tree so every screen has access to shared context.
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <AppNavigator />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
