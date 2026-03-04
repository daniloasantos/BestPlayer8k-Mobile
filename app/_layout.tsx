import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { QueryProvider } from '../src/providers';
import { ThemeProvider, useTheme } from '../src/theme';
import { FullscreenProvider, FloatingPlayerProvider, LanguageProvider, SubscriptionProvider } from '../src/contexts';
import { useAuthStore } from '../src/stores';
import { useAndroidNavigationBar } from '../src/hooks';
import { FloatingPlayer } from '../src/components/player';

function RootLayoutContent() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const { isDark } = useTheme();
  const router = useRouter();

  // Setup Android navigation bar
  useAndroidNavigationBar();

  useEffect(() => {
    checkAuth();
  }, []);

  // Handle deep links — e.g. bestplayer8k://subscription/confirmed (returned from external checkout)
  useEffect(() => {
    const handleUrl = ({ url }: { url: string }) => {
      const parsed = Linking.parse(url);
      if (parsed.path === 'subscription/confirmed') {
        router.replace('/subscription');
      }
    };

    // Cold-start URL (app was closed when deep link fired)
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url });
    });

    const subscription = Linking.addEventListener('url', handleUrl);
    return () => subscription.remove();
  }, [router]);

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
      <LanguageProvider>
        <ThemeProvider>
          <FullscreenProvider>
            <FloatingPlayerProvider>
              <QueryProvider>
                <SubscriptionProvider>
                  <RootLayoutContent />
                </SubscriptionProvider>
              </QueryProvider>
            </FloatingPlayerProvider>
          </FullscreenProvider>
        </ThemeProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
