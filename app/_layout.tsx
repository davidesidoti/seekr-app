import '../global.css';

import { useEffect } from 'react';
import { Stack, Redirect } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/hooks/queryClient';
import { useAuthStore } from '@/stores';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isHydrated) {
      SplashScreen.hideAsync();
    }
  }, [isHydrated]);

  if (!isHydrated) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="media/[id]"
          options={{ presentation: 'card', animation: 'slide_from_right' }}
        />
      </Stack>
      {!isAuthenticated && <Redirect href="/(auth)" />}
    </QueryClientProvider>
  );
}
