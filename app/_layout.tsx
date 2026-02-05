import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryProvider } from '../src/providers';
import { ThemeProvider, useTheme } from '../src/theme';
import { FullscreenProvider, FloatingPlayerProvider } from '../src/contexts';
import { useAuthStore } from '../src/stores';
import { useAndroidNavigationBar } from '../src/hooks';
import { FloatingPlayer } from '../src/components/player';

function RootLayoutContent() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const { isDark } = useTheme();

  // Setup Android navigation bar
  useAndroidNavigationBar();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
      <FloatingPlayer />
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <FullscreenProvider>
          <FloatingPlayerProvider>
            <QueryProvider>
              <RootLayoutContent />
            </QueryProvider>
          </FloatingPlayerProvider>
        </FullscreenProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
