import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Switch, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import {
  User,
  Moon,
  Sun,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Heart,
  List,
  Globe,
  Users,
  ChevronDown,
} from 'lucide-react-native';
import { useAuthStore } from '@/stores';
import { useColors, useTheme, spacing, borderRadius, typography } from '@/theme';
import { ScreenContainer, Header } from '@/components/layout';
import { Avatar, Card, ProfileSelector } from '@/components/ui';
import { useFavoritesStats, useDashboardStats } from '@/hooks';

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

  const [showProfileSelector, setShowProfileSelector] = useState(false);

  const currentProfile = getCurrentProfile();
  const profiles = user?.profiles || [];

  const { data: favStats } = useFavoritesStats();
  const { data: dashStats } = useDashboardStats();

  const handleLogout = useCallback(async () => {
    const doLogout = async () => {
      await logout();
      router.replace('/login');
    };

    if (Platform.OS === 'web') {
      // Use browser confirm on web
      if (window.confirm('Tem certeza que deseja sair da sua conta?')) {
        doLogout();
      }
    } else {
      // Use native Alert on mobile
      Alert.alert(
        'Sair',
        'Tem certeza que deseja sair da sua conta?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Sair',
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
      <Header title="Perfil" icon={User} />

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
              <Text style={styles.switchProfileText}>Trocar perfil</Text>
              <ChevronDown size={14} color={colors.primary} />
            </Pressable>
          )}

          <Text style={styles.userEmail}>{user?.email}</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{favStats?.total || 0}</Text>
              <Text style={styles.statLabel}>Favoritos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{dashStats?.totalChannels || 0}</Text>
              <Text style={styles.statLabel}>Canais</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{dashStats?.totalMovies || 0}</Text>
              <Text style={styles.statLabel}>Filmes</Text>
            </View>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONTEÚDO</Text>
          <Card style={styles.menuCard}>
            <MenuItem
              icon={Heart}
              label="Favoritos"
              value={`${favStats?.total || 0} itens`}
              onPress={() => router.push('/favorites')}
            />
            <MenuItem
              icon={List}
              label="Playlists"
              onPress={() => router.push('/playlists')}
            />
          </Card>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PREFERÊNCIAS</Text>
          <Card style={styles.menuCard}>
            <MenuItem
              icon={mode === 'dark' ? Moon : Sun}
              label="Tema escuro"
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
              icon={Bell}
              label="Notificações"
              onPress={() => router.push('/settings')}
            />
            <MenuItem
              icon={Globe}
              label="Idioma"
              value="Português"
              onPress={() => router.push('/settings')}
            />
          </Card>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONTA</Text>
          <Card style={styles.menuCard}>
            <MenuItem
              icon={Shield}
              label="Privacidade e segurança"
              onPress={() => router.push('/settings')}
            />
            <MenuItem
              icon={HelpCircle}
              label="Ajuda e suporte"
              onPress={() => {}}
            />
            <MenuItem
              icon={LogOut}
              label="Sair"
              onPress={handleLogout}
              destructive
              showArrow={false}
            />
          </Card>
        </View>

        <Text style={styles.versionText}>
          BestPlayer8k v1.0.0
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
    </ScreenContainer>
  );
}
