import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Switch, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import {
  User,
  Moon,
  Sun,
  HelpCircle,
  LogOut,
  ChevronRight,
  Heart,
  List,
  Globe,
  Users,
  ChevronDown,
  CreditCard,
} from 'lucide-react-native';
import { useAuthStore } from '@/stores';
import { useColors, useTheme, spacing, borderRadius, typography } from '@/theme';
import { ScreenContainer, Header } from '@/components/layout';
import { Avatar, Card, ProfileSelector, Modal, ContactModal } from '@/components/ui';
import { useFavoritesStats, useDashboardStats } from '@/hooks';
import { useLanguage } from '@/contexts';

interface MenuItemProps {
  icon: any;
  label: string;
  value?: string;
  onPress?: () => void;
  showArrow?: boolean;
  rightElement?: React.ReactNode;
  destructive?: boolean;
}

export default function ProfileScreen() {
  const colors = useColors();
  const { mode, toggleTheme } = useTheme();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const selectedProfileId = useAuthStore((state) => state.selectedProfileId);
  const selectProfile = useAuthStore((state) => state.selectProfile);
  const getCurrentProfile = useAuthStore((state) => state.getCurrentProfile);
  const { language, setLanguage, t } = useLanguage();

  const [showProfileSelector, setShowProfileSelector] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const currentProfile = getCurrentProfile();
  const profiles = user?.profiles || [];

  const { data: favStats } = useFavoritesStats();
  const { data: dashStats } = useDashboardStats();

  const getLanguageLabel = () => {
    switch (language) {
      case 'pt':
        return 'Português';
      case 'en':
        return 'English';
      case 'es':
        return 'Español';
      default:
        return 'Português';
    }
  };

  const handleLogout = useCallback(async () => {
    const doLogout = async () => {
      await logout();
      router.replace('/login');
    };

    if (Platform.OS === 'web') {
      // Use browser confirm on web
      if (window.confirm(t('profiles.logout_confirm_message'))) {
        doLogout();
      }
    } else {
      // Use native Alert on mobile
      Alert.alert(
        t('profiles.logout_confirm_title'),
        t('profiles.logout_confirm_message'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('sidebar.logout'),
            style: 'destructive',
            onPress: doLogout,
          },
        ]
      );
    }
  }, [logout, router]);

  const styles = StyleSheet.create({
    scrollContent: {
      paddingBottom: spacing.xl * 2,
    },
    profileSection: {
      alignItems: 'center',
      padding: spacing.xl,
    },
    avatarButton: {
      position: 'relative',
    },
    switchProfileBadge: {
      position: 'absolute',
      bottom: -4,
      right: -4,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.background,
    },
    userName: {
      ...typography.title,
      color: colors.foreground,
      marginTop: spacing.md,
    },
    switchProfileButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginTop: spacing.xs,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
      backgroundColor: colors.muted,
    },
    switchProfileText: {
      ...typography.label,
      color: colors.primary,
      fontWeight: '600',
    },
    userEmail: {
      ...typography.body,
      color: colors.mutedForeground,
      marginTop: spacing.sm,
    },
    statsContainer: {
      flexDirection: 'row',
      marginTop: spacing.lg,
      gap: spacing.md,
    },
    statItem: {
      alignItems: 'center',
      padding: spacing.md,
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      minWidth: 80,
    },
    statValue: {
      ...typography.header,
      color: colors.foreground,
    },
    statLabel: {
      ...typography.small,
      color: colors.mutedForeground,
      marginTop: spacing.xs,
    },
    section: {
      marginTop: spacing.lg,
      paddingHorizontal: spacing.lg,
    },
    sectionTitle: {
      ...typography.label,
      color: colors.mutedForeground,
      marginBottom: spacing.sm,
      paddingLeft: spacing.sm,
    },
    menuCard: {
      padding: 0,
      overflow: 'hidden',
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.cardBorder,
    },
    menuItemLast: {
      borderBottomWidth: 0,
    },
    menuIcon: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.md,
      backgroundColor: colors.muted,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    menuContent: {
      flex: 1,
    },
    menuLabel: {
      ...typography.body,
      color: colors.foreground,
    },
    menuLabelDestructive: {
      color: colors.error,
    },
    menuValue: {
      ...typography.label,
      color: colors.mutedForeground,
    },
    menuRight: {
      marginLeft: spacing.sm,
    },
    versionText: {
      ...typography.small,
      color: colors.mutedForeground,
      textAlign: 'center',
      marginTop: spacing.xl,
    },
  });

  const MenuItem = ({
    icon: Icon,
    label,
    value,
    onPress,
    showArrow = true,
    rightElement,
    destructive = false,
  }: MenuItemProps) => (
    <Pressable
      style={({ pressed }) => [
        styles.menuItem,
        { opacity: pressed && onPress ? 0.7 : 1 },
      ]}
      onPress={onPress}
      disabled={!onPress && !rightElement}
    >
      <View
        style={[
          styles.menuIcon,
          destructive && { backgroundColor: colors.error + '20' },
        ]}
      >
        <Icon size={20} color={destructive ? colors.error : colors.foreground} />
      </View>
      <View style={styles.menuContent}>
        <Text
          style={[
            styles.menuLabel,
            destructive ? styles.menuLabelDestructive : undefined,
          ]}
        >
          {label}
        </Text>
        {value && <Text style={styles.menuValue}>{value}</Text>}
      </View>
      <View style={styles.menuRight}>
        {rightElement || (showArrow && onPress && (
          <ChevronRight size={20} color={colors.mutedForeground} />
        ))}
      </View>
    </Pressable>
  );

  return (
    <ScreenContainer>
      <Header title={t('profiles.screen_title')} icon={User} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Pressable
            style={styles.avatarButton}
            onPress={() => setShowProfileSelector(true)}
          >
            <Avatar
              name={currentProfile?.name || user?.email?.split('@')[0] || 'U'}
              size={80}
            />
            {profiles.length > 1 && (
              <View style={styles.switchProfileBadge}>
                <Users size={14} color="#fff" />
              </View>
            )}
          </Pressable>

          <Text style={styles.userName}>
            {currentProfile?.name || user?.email?.split('@')[0] || 'Usuário'}
          </Text>

          {profiles.length > 1 && (
            <Pressable
              style={styles.switchProfileButton}
              onPress={() => setShowProfileSelector(true)}
            >
              <Text style={styles.switchProfileText}>{t('profiles.switch_profile')}</Text>
              <ChevronDown size={14} color={colors.primary} />
            </Pressable>
          )}

          <Text style={styles.userEmail}>{user?.email}</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{favStats?.total || 0}</Text>
              <Text style={styles.statLabel}>{t('profiles.stats_favorites')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{dashStats?.totalChannels || 0}</Text>
              <Text style={styles.statLabel}>{t('profiles.stats_channels')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{dashStats?.totalMovies || 0}</Text>
              <Text style={styles.statLabel}>{t('profiles.stats_movies')}</Text>
            </View>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profiles.content_section')}</Text>
          <Card style={styles.menuCard}>
            <MenuItem
              icon={Heart}
              label={t('sidebar.favorites')}
              value={t('profiles.items_count', { count: favStats?.total || 0 })}
              onPress={() => router.push('/favorites')}
            />
            <MenuItem
              icon={List}
              label={t('sidebar.playlists')}
              onPress={() => router.push('/playlists')}
            />
          </Card>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profiles.preferences_section')}</Text>
          <Card style={styles.menuCard}>
            <MenuItem
              icon={mode === 'dark' ? Moon : Sun}
              label={mode === 'dark' ? t('settings.dark_mode') : t('settings.light_mode')}
              showArrow={false}
              rightElement={
                <Switch
                  value={mode === 'dark'}
                  onValueChange={toggleTheme}
                  trackColor={{ false: colors.muted, true: colors.primary }}
                  thumbColor={colors.foreground}
                />
              }
            />
            <MenuItem
              icon={Globe}
              label={t('settings.language')}
              value={getLanguageLabel()}
              onPress={() => setShowLanguageSelector(true)}
            />
          </Card>
        </View>

        {/* Subscription Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profiles.subscription_section')}</Text>
          <Card style={styles.menuCard}>
            <MenuItem
              icon={CreditCard}
              label={t('profiles.my_subscription')}
              onPress={() => router.push('/subscription')}
            />
            <MenuItem
              icon={CreditCard}
              label={t('profiles.see_plans')}
              onPress={() => router.push('/plans')}
            />
          </Card>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profiles.account_section')}</Text>
          <Card style={styles.menuCard}>
            <MenuItem
              icon={HelpCircle}
              label={t('profiles.help_support')}
              onPress={() => setShowContactModal(true)}
            />
            <MenuItem
              icon={LogOut}
              label={t('sidebar.logout')}
              onPress={handleLogout}
              destructive
              showArrow={false}
            />
          </Card>
        </View>

        <Text style={styles.versionText}>
          {t('profiles.app_version')}
        </Text>
      </ScrollView>

      <ProfileSelector
        visible={showProfileSelector}
        onClose={() => setShowProfileSelector(false)}
        profiles={profiles}
        selectedProfileId={selectedProfileId}
        onSelectProfile={async (profileId) => {
          await selectProfile(profileId);
          setShowProfileSelector(false);
        }}
      />

      <Modal
        visible={showLanguageSelector}
        onClose={() => setShowLanguageSelector(false)}
        title={t('profiles.select_language')}
        size="sm"
      >
        <View style={languageStyles.container}>
          {[
            { code: 'pt', label: 'Português', flag: '🇧🇷' },
            { code: 'en', label: 'English', flag: '🇺🇸' },
            { code: 'es', label: 'Español', flag: '🇪🇸' },
          ].map((lang) => (
            <Pressable
              key={lang.code}
              style={({ pressed }) => [
                languageStyles.languageOption,
                {
                  backgroundColor: language === lang.code ? colors.primary : colors.card,
                  opacity: pressed ? 0.7 : 1,
                  borderColor: language === lang.code ? colors.primary : colors.cardBorder,
                },
              ]}
              onPress={async () => {
                await setLanguage(lang.code as any);
                setShowLanguageSelector(false);
              }}
            >
              <Text style={languageStyles.flag}>{lang.flag}</Text>
              <Text
                style={[
                  languageStyles.languageLabel,
                  {
                    color: language === lang.code ? '#fff' : colors.foreground,
                  },
                ]}
              >
                {lang.label}
              </Text>
              {language === lang.code && (
                <View style={languageStyles.checkmark}>
                  <Text style={languageStyles.checkmarkText}>✓</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>
      </Modal>

      <ContactModal
        visible={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </ScreenContainer>
  );
}

const languageStyles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    gap: spacing.md,
  },
  flag: {
    fontSize: 24,
  },
  languageLabel: {
    ...typography.body,
    flex: 1,
    fontWeight: '600',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
