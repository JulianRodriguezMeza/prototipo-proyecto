import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Redirect, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useMemo } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/lib/auth';

export const unstable_settings = {
  anchor: '(tabs)',
};

function AuthGate({ children }: { children: React.ReactNode }) {
  const segments = useSegments();
  const { isAuthenticated, user } = useAuth();

  const currentGroup = String(segments[0] ?? '');
  const isAuthRoute = currentGroup === 'login' || currentGroup === 'auth';

  const redirect = useMemo(() => {
    if (!isAuthenticated && !isAuthRoute) {
      return <Redirect href={'/login' as never} />;
    }

    if (isAuthenticated && isAuthRoute) {
      const target = (user?.role === 'admin' || user?.role === 'auxiliar') ? '/(tabs)/explore' : '/(tabs)';
      return <Redirect href={target as never} />;
    }

    return null;
  }, [isAuthenticated, isAuthRoute, user?.role]);

  return (
    <>
      {redirect}
      {children}
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <AuthGate>
          <Stack initialRouteName="login">
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
        </AuthGate>
      </AuthProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
