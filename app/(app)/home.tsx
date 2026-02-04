import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Tv, Film, Heart, Clock, ChevronRight, Search, Bell } from 'lucide-react-native';
import { useAuthStore } from '@/stores';
import { useColors, spacing, borderRadius, typography } from '@/theme';
import { ScreenContainer, Header, Section } from '@/components/layout';
import { Card, Avatar, Skeleton } from '@/components/ui';
import { HorizontalList } from '@/components/content';
import {
  useRecentlyWatched,
  useDashboardStats,
  useFavorites,
  useChannels,
} from '@/hooks';

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const {
    data: recentlyWatched,
    isLoading: loadingRecent,
    refetch: refetchRecent,
  } = useRecentlyWatched(6);

  const {
    data: stats,
    isLoading: loadingStats,
    refetch: refetchStats,
  } = useDashboardStats();

  const {
    data: favorites,
    isLoading: loadingFavorites,
    refetch: refetchFavorites,
  } = useFavorites();

  const {
    data: liveChannels,
    isLoading: loadingLive,
    refetch: refetchLive,
  } = useChannels({ type: 'LIVE', limit: 10 });

  const isRefreshing = loadingRecent && loadingStats;

  const onRefresh = useCallback(async () => {
    await Promise.all([
      refetchRecent(),
      refetchStats(),
      refetchFavorites(),
      refetchLive(),
    ]);
  }, [refetchRecent, refetchStats, refetchFavorites, refetchLive]);

  const styles = StyleSheet.create({
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    greeting: {
      ...typography.header,
      color: colors.foreground,
    },
    subtitle: {
      ...typography.label,
      color: colors.mutedForeground,
    },
    headerActions: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.muted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statsContainer: {
      flexDirection: 'row',
      paddingHorizontal: spacing.lg,
      gap: spacing.md,
      marginBottom: spacing.lg,
    },
    statCard: {
      flex: 1,
      padding: spacing.md,
    },
    statIconContainer: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    statValue: {
      ...typography.title,
      color: colors.foreground,
      fontSize: 24,
    },
    statLabel: {
      ...typography.label,
      color: colors.mutedForeground,
    },
    emptyState: {
      padding: spacing.xl,
      alignItems: 'center',
    },
    emptyText: {
      ...typography.body,
      color: colors.mutedForeground,
      textAlign: 'center',
    },
    quickActions: {
      flexDirection: 'row',
      paddingHorizontal: spacing.lg,
      gap: spacing.md,
      marginBottom: spacing.lg,
    },
    quickAction: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.md,
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    quickActionText: {
      ...typography.label,
      color: colors.foreground,
      fontWeight: '600',
    },
  });

  const StatCard = ({
    icon: Icon,
    iconColor,
    value,
    label,
    isLoading,
  }: {
    icon: any;
    iconColor: string;
    value?: number;
    label: string;
    isLoading?: boolean;
  }) => (
    <Card style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: `${iconColor}20` }]}>
        <Icon size={20} color={iconColor} />
      </View>
      {isLoading ? (
        <Skeleton style={{ width: 50, height: 28, marginBottom: spacing.xs }} />
      ) : (
        <Text style={styles.statValue}>{value ?? 0}</Text>
      )}
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            <Avatar name={user?.profiles?.find(p => p.isPrimary)?.name || user?.email?.split('@')[0] || 'U'} size={48} />
            <View>
              <Text style={styles.greeting}>
                Olá, {user?.profiles?.find(p => p.isPrimary)?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Usuário'}!
              </Text>
              <Text style={styles.subtitle}>Bem-vindo ao BestPlayer8k</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              style={styles.iconButton}
              onPress={() => router.push('/search')}
            >
              <Search size={20} color={colors.foreground} />
            </Pressable>
            <Pressable style={styles.iconButton}>
              <Bell size={20} color={colors.foreground} />
            </Pressable>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Pressable style={styles.quickAction} onPress={() => router.push('/live')}>
            <Tv size={20} color={colors.primary} />
            <Text style={styles.quickActionText}>TV ao Vivo</Text>
          </Pressable>
          <Pressable style={styles.quickAction} onPress={() => router.push('/library')}>
            <Film size={20} color={colors.accent} />
            <Text style={styles.quickActionText}>Filmes</Text>
          </Pressable>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatCard
            icon={Tv}
            iconColor={colors.primary}
            value={stats?.totalChannels}
            label="Canais"
            isLoading={loadingStats}
          />
          <StatCard
            icon={Film}
            iconColor={colors.accent}
            value={stats?.totalMovies}
            label="Filmes"
            isLoading={loadingStats}
          />
          <StatCard
            icon={Heart}
            iconColor={colors.error}
            value={stats?.totalFavorites}
            label="Favoritos"
            isLoading={loadingStats}
          />
        </View>

        {/* Recently Watched */}
        <Section
          title="Assistidos Recentemente"
          icon={Clock}
          actionLabel="Ver todos"
          onActionPress={() => router.push('/library')}
        >
          {loadingRecent ? (
            <HorizontalList
              data={[]}
              type="channel"
              isLoading={true}
            />
          ) : recentlyWatched && recentlyWatched.length > 0 ? (
            <HorizontalList
              data={recentlyWatched}
              type="channel"
              onItemPress={(channel) => router.push(`/channels/${channel.id}` as any)}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                Nenhum canal assistido recentemente.
              </Text>
            </View>
          )}
        </Section>

        {/* Live TV */}
        <Section
          title="TV ao Vivo"
          icon={Tv}
          actionLabel="Ver todos"
          onActionPress={() => router.push('/live')}
        >
          {loadingLive ? (
            <HorizontalList
              data={[]}
              type="channel"
              isLoading={true}
            />
          ) : liveChannels?.items && liveChannels.items.length > 0 ? (
            <HorizontalList
              data={liveChannels.items}
              type="channel"
              onItemPress={(channel) => router.push(`/channels/${channel.id}` as any)}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                Nenhum canal ao vivo disponível.
              </Text>
            </View>
          )}
        </Section>

        {/* Favorites */}
        {favorites && favorites.length > 0 && (
          <Section
            title="Seus Favoritos"
            icon={Heart}
            actionLabel="Ver todos"
            onActionPress={() => router.push('/favorites')}
          >
            <HorizontalList
              data={favorites.slice(0, 10)}
              type="channel"
              isLoading={loadingFavorites}
              onItemPress={(channel) => router.push(`/channels/${channel.id}` as any)}
            />
          </Section>
        )}

        <View style={{ height: spacing.xl * 2 }} />
      </ScrollView>
    </ScreenContainer>
  );
}
