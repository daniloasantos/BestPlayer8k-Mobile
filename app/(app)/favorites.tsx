import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, Tv, Film, Tv2 } from 'lucide-react-native';
import { useColors, spacing, typography } from '@/theme';
import { ScreenContainer, Header } from '@/components/layout';
import { SegmentedControl, EmptyState } from '@/components/ui';
import { ContentGrid } from '@/components/content';
import { useFavorites, useFavoritesStats, useToggleFavorite } from '@/hooks';
import type { Channel, ChannelType } from '@/types';

type FavoriteFilter = 'ALL' | 'LIVE' | 'MOVIE' | 'SERIES';

const FILTERS = [
  { value: 'ALL' as FavoriteFilter, label: 'Todos' },
  { value: 'LIVE' as FavoriteFilter, label: 'TV' },
  { value: 'MOVIE' as FavoriteFilter, label: 'Filmes' },
  { value: 'SERIES' as FavoriteFilter, label: 'Séries' },
];

export default function FavoritesScreen() {
  const colors = useColors();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FavoriteFilter>('ALL');

  const {
    data: favorites,
    isLoading,
    refetch,
    isRefetching,
  } = useFavorites();

  const {
    data: stats,
    isLoading: loadingStats,
  } = useFavoritesStats();

  const toggleFavorite = useToggleFavorite();

  const filteredFavorites = useMemo(() => {
    if (!favorites) return [];
    if (activeFilter === 'ALL') return favorites;
    return favorites.filter((item) => item.type === activeFilter);
  }, [favorites, activeFilter]);

  const handleFilterChange = useCallback((value: string) => {
    setActiveFilter(value as FavoriteFilter);
  }, []);

  const handleItemPress = useCallback((item: Channel) => {
    if (item.type === 'SERIES') {
      router.push(`/series/${item.id}` as any);
    } else {
      router.push(`/channels/${item.id}` as any);
    }
  }, [router]);

  const handleFavoritePress = useCallback((item: Channel) => {
    toggleFavorite.mutate(item.id);
  }, [toggleFavorite]);

  const styles = StyleSheet.create({
    filterContainer: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
    statsContainer: {
      flexDirection: 'row',
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
      gap: spacing.md,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    statText: {
      ...typography.label,
      color: colors.mutedForeground,
    },
    statValue: {
      ...typography.label,
      color: colors.foreground,
      fontWeight: '600',
    },
  });

  const getContentType = (filter: FavoriteFilter) => {
    switch (filter) {
      case 'MOVIE':
        return 'movie';
      case 'SERIES':
        return 'series';
      default:
        return 'channel';
    }
  };

  const getEmptyIcon = () => {
    switch (activeFilter) {
      case 'LIVE':
        return Tv;
      case 'MOVIE':
        return Film;
      case 'SERIES':
        return Tv2;
      default:
        return Heart;
    }
  };

  const getEmptyTitle = () => {
    switch (activeFilter) {
      case 'LIVE':
        return 'Nenhum canal favorito';
      case 'MOVIE':
        return 'Nenhum filme favorito';
      case 'SERIES':
        return 'Nenhuma série favorita';
      default:
        return 'Nenhum favorito';
    }
  };

  const getEmptyDescription = () => {
    switch (activeFilter) {
      case 'LIVE':
        return 'Adicione canais aos seus favoritos para encontrá-los facilmente.';
      case 'MOVIE':
        return 'Adicione filmes aos seus favoritos para encontrá-los facilmente.';
      case 'SERIES':
        return 'Adicione séries aos seus favoritos para encontrá-las facilmente.';
      default:
        return 'Adicione conteúdo aos seus favoritos tocando no ícone de coração.';
    }
  };

  return (
    <ScreenContainer>
      <Header
        title="Favoritos"
        icon={Heart}
        showSearch
        onSearchPress={() => router.push('/search')}
      />

      {/* Stats */}
      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total || 0}</Text>
            <Text style={styles.statText}>favoritos</Text>
          </View>
          {stats.live > 0 && (
            <View style={styles.statItem}>
              <Tv size={14} color={colors.primary} />
              <Text style={styles.statValue}>{stats.live}</Text>
            </View>
          )}
          {stats.movies > 0 && (
            <View style={styles.statItem}>
              <Film size={14} color={colors.accent} />
              <Text style={styles.statValue}>{stats.movies}</Text>
            </View>
          )}
          {stats.series > 0 && (
            <View style={styles.statItem}>
              <Tv2 size={14} color={colors.success} />
              <Text style={styles.statValue}>{stats.series}</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.filterContainer}>
        <SegmentedControl
          options={FILTERS}
          value={activeFilter}
          onChange={handleFilterChange}
        />
      </View>

      <ContentGrid
        data={filteredFavorites}
        type={getContentType(activeFilter)}
        isLoading={isLoading && filteredFavorites.length === 0}
        isRefreshing={isRefetching}
        onRefresh={refetch}
        onItemPress={handleItemPress}
        onFavoritePress={handleFavoritePress}
        showFavorite={true}
        emptyTitle={getEmptyTitle()}
        emptyDescription={getEmptyDescription()}
        emptyIcon={getEmptyIcon()}
      />
    </ScreenContainer>
  );
}
