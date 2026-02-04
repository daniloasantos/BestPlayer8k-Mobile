import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryProvider } from '../src/providers';
import { ThemeProvider, useTheme } from '../src/theme';
import { useAuthStore } from '../src/stores';

function RootLayoutContent() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const { isDark } = useTheme();

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
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <QueryProvider>
          <RootLayoutContent />
        </QueryProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
