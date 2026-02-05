import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Tv, Tv2, Film, Heart, Clock, ChevronRight, Search, Bell } from 'lucide-react-native';
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
  useToggleFavorite,
} from '@/hooks';
import type { Channel } from '@/types';

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const {
    data: recentlyWatched,
    isLoading: loadingRecent,
    refetch: refetchRecent,
  } = useRecentlyWatched(6);

  // Refetch recently watched when screen gains focus
  useFocusEffect(
    useCallback(() => {
      refetchRecent();
    }, [refetchRecent])
  );

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

  const {
    data: movies,
    isLoading: loadingMovies,
    refetch: refetchMovies,
  } = useChannels({ type: 'MOVIE', limit: 10 });

  const {
    data: series,
    isLoading: loadingSeries,
    refetch: refetchSeries,
  } = useChannels({ type: 'SERIES', limit: 10 });

  const toggleFavorite = useToggleFavorite();

  const isRefreshing = loadingRecent && loadingStats;

  const onRefresh = useCallback(async () => {
    await Promise.all([
      refetchRecent(),
      refetchStats(),
      refetchFavorites(),
      refetchLive(),
      refetchMovies(),
      refetchSeries(),
    ]);
  }, [refetchRecent, refetchStats, refetchFavorites, refetchLive, refetchMovies, refetchSeries]);

  const handleFavoritePress = useCallback((item: Channel) => {
    toggleFavorite.mutate(item.id);
  }, [toggleFavorite]);

  const styles = StyleSheet.create({
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    greeting: {
      ...typography.header,
      color: colors.foreground,
      fontSize: 18,
    },
    subtitle: {
      ...typography.label,
      color: colors.mutedForeground,
      fontSize: 12,
    },
    headerActions: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
    iconButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.muted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statsContainer: {
      flexDirection: 'row',
      paddingHorizontal: spacing.lg,
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    statCard: {
      flex: 1,
      padding: spacing.sm,
    },
    statIconContainer: {
      width: 32,
      height: 32,
      borderRadius: borderRadius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xs,
    },
    statValue: {
      ...typography.title,
      color: colors.foreground,
      fontSize: 20,
    },
    statLabel: {
      ...typography.label,
      color: colors.mutedForeground,
      fontSize: 11,
    },
    emptyState: {
      padding: spacing.lg,
      alignItems: 'center',
    },
    emptyText: {
      ...typography.body,
      color: colors.mutedForeground,
      textAlign: 'center',
      fontSize: 13,
    },
    quickActions: {
      flexDirection: 'row',
      paddingHorizontal: spacing.lg,
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    quickAction: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      padding: spacing.sm,
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    quickActionText: {
      ...typography.label,
      color: colors.foreground,
      fontWeight: '600',
      fontSize: 13,
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
        <Icon size={16} color={iconColor} />
      </View>
      {isLoading ? (
        <Skeleton style={{ width: 40, height: 22, marginBottom: spacing.xs }} />
      ) : (
        <Text style={styles.statValue}>{value ?? 0}</Text>
      )}
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );

  return (
    <ScreenContainer scrollable={false} noPadding>
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
            <Avatar name={user?.profiles?.find(p => p.isPrimary)?.name || user?.email?.split('@')[0] || 'U'} size={40} />
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
              type="mixed"
              onItemPress={(channel) => router.push(`/channels/${channel.id}` as any)}
              onFavoritePress={handleFavoritePress}
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
              onFavoritePress={handleFavoritePress}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                Nenhum canal ao vivo disponível.
              </Text>
            </View>
          )}
        </Section>

        {/* Movies */}
        <Section
          title="Filmes"
          icon={Film}
          actionLabel="Ver todos"
          onActionPress={() => router.push('/library')}
        >
          {loadingMovies ? (
            <HorizontalList
              data={[]}
              type="movie"
              isLoading={true}
            />
          ) : movies?.items && movies.items.length > 0 ? (
            <HorizontalList
              data={movies.items}
              type="movie"
              onItemPress={(movie) => router.push(`/channels/${movie.id}` as any)}
              onFavoritePress={handleFavoritePress}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                Nenhum filme disponível.
              </Text>
            </View>
          )}
        </Section>

        {/* Series */}
        {series?.items && series.items.length > 0 && (
          <Section
            title="Séries"
            icon={Tv2}
            actionLabel="Ver todos"
            onActionPress={() => router.push('/library')}
          >
            <HorizontalList
              data={series.items}
              type="series"
              isLoading={loadingSeries}
              onItemPress={(item) => router.push(`/series/${item.id}` as any)}
              onFavoritePress={handleFavoritePress}
            />
          </Section>
        )}

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
              onFavoritePress={handleFavoritePress}
            />
          </Section>
        )}

        <View style={{ height: spacing.lg }} />
      </ScrollView>
    </ScreenContainer>
  );
}
