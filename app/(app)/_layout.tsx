import { Tabs } from 'expo-router';
import { Home, Tv, Library, Heart, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '../../src/theme';
import { useFullscreen, useLanguage } from '../../src/contexts';

export default function AppLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isFullscreen } = useFullscreen();
  const { t } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: isFullscreen ? { display: 'none' } : {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: 12,
          paddingBottom: 20 + insets.bottom,
          height: 78 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="live"
        options={{
          title: t('tabs.live'),
          tabBarIcon: ({ color, size }) => <Tv size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: t('tabs.library'),
          tabBarIcon: ({ color, size }) => <Library size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: t('tabs.favorites'),
          tabBarIcon: ({ color, size }) => <Heart size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
      {/* Hidden screens - accessible via navigation but not in tab bar */}
      <Tabs.Screen
        name="search"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="playlists"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="channels/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="series/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
