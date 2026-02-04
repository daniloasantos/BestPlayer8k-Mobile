import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { Search as SearchIcon, X, Clock, TrendingUp, Tv, Film, Tv2 } from 'lucide-react-native';
import { useColors, spacing, borderRadius, typography } from '@/theme';
import { ScreenContainer, Header } from '@/components/layout';
import { SearchBar, SegmentedControl, EmptyState } from '@/components/ui';
import { ContentGrid } from '@/components/content';
import { useSearchChannels, useToggleFavorite } from '@/hooks';
import type { Channel, ChannelType } from '@/types';

type SearchFilter = 'ALL' | 'LIVE' | 'MOVIE' | 'SERIES';

const FILTERS = [
  { value: 'ALL' as SearchFilter, label: 'Todos' },
  { value: 'LIVE' as SearchFilter, label: 'TV' },
  { value: 'MOVIE' as SearchFilter, label: 'Filmes' },
  { value: 'SERIES' as SearchFilter, label: 'Séries' },
];

export default function SearchScreen() {
  const colors = useColors();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<SearchFilter>('ALL');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const {
    data: searchResults,
    isLoading,
    isFetching,
  } = useSearchChannels(searchQuery, activeFilter);

  const toggleFavorite = useToggleFavorite();

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const handleFilterChange = useCallback((value: string) => {
    setActiveFilter(value as SearchFilter);
  }, []);

  const handleItemPress = useCallback((item: Channel) => {
    // Add to recent searches
    if (searchQuery && !recentSearches.includes(searchQuery)) {
      setRecentSearches((prev) => [searchQuery, ...prev.slice(0, 4)]);
    }

    if (item.type === 'SERIES') {
      router.push(`/series/${item.id}` as any);
    } else {
      router.push(`/channels/${item.id}` as any);
    }
  }, [searchQuery, recentSearches, router]);

  const handleFavoritePress = useCallback((item: Channel) => {
    toggleFavorite.mutate(item.id);
  }, [toggleFavorite]);

  const handleRecentSearchPress = useCallback((query: string) => {
    setSearchQuery(query);
    Keyboard.dismiss();
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
  }, []);

  const styles = StyleSheet.create({
    searchContainer: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
    filterContainer: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
    recentContainer: {
      padding: spacing.lg,
    },
    recentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    recentTitle: {
      ...typography.header,
      color: colors.foreground,
      flexDirection: 'row',
      alignItems: 'center',
    },
    recentTitleIcon: {
      marginRight: spacing.sm,
    },
    clearButton: {
      ...typography.label,
      color: colors.primary,
    },
    recentItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.sm,
    },
    recentText: {
      ...typography.body,
      color: colors.mutedForeground,
      flex: 1,
    },
    removeButton: {
      padding: spacing.xs,
    },
    suggestionsContainer: {
      padding: spacing.lg,
    },
    suggestionsTitle: {
      ...typography.header,
      color: colors.foreground,
      marginBottom: spacing.md,
    },
    suggestionChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    suggestionChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: colors.card,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    suggestionText: {
      ...typography.label,
      color: colors.foreground,
    },
  });

  const getContentType = (filter: SearchFilter) => {
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
        return SearchIcon;
    }
  };

  const showResults = searchQuery.length >= 2;
  const hasResults = searchResults && searchResults.length > 0;

  return (
    <ScreenContainer>
      <Header
        title="Buscar"
        icon={SearchIcon}
        showBack
        onBack={() => router.back()}
      />

      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Buscar canais, filmes, séries..."
          autoFocus
        />
      </View>

      <View style={styles.filterContainer}>
        <SegmentedControl
          options={FILTERS}
          value={activeFilter}
          onChange={handleFilterChange}
        />
      </View>

      {showResults ? (
        <ContentGrid
          data={searchResults || []}
          type={getContentType(activeFilter)}
          isLoading={isLoading}
          onItemPress={handleItemPress}
          onFavoritePress={handleFavoritePress}
          emptyTitle="Nenhum resultado"
          emptyDescription={`Não encontramos resultados para "${searchQuery}"`}
          emptyIcon={getEmptyIcon()}
        />
      ) : (
        <View>
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <View style={styles.recentContainer}>
              <View style={styles.recentHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Clock size={18} color={colors.foreground} style={styles.recentTitleIcon} />
                  <Text style={styles.recentTitle}>Buscas recentes</Text>
                </View>
                <Pressable onPress={clearRecentSearches}>
                  <Text style={styles.clearButton}>Limpar</Text>
                </Pressable>
              </View>

              {recentSearches.map((query, index) => (
                <Pressable
                  key={index}
                  style={styles.recentItem}
                  onPress={() => handleRecentSearchPress(query)}
                >
                  <Clock size={16} color={colors.mutedForeground} />
                  <Text style={styles.recentText}>{query}</Text>
                  <Pressable
                    style={styles.removeButton}
                    onPress={() => {
                      setRecentSearches((prev) => prev.filter((_, i) => i !== index));
                    }}
                  >
                    <X size={16} color={colors.mutedForeground} />
                  </Pressable>
                </Pressable>
              ))}
            </View>
          )}

          {/* Suggestions */}
          <View style={styles.suggestionsContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
              <TrendingUp size={18} color={colors.foreground} style={styles.recentTitleIcon} />
              <Text style={styles.suggestionsTitle}>Em alta</Text>
            </View>
            <View style={styles.suggestionChips}>
              {['Globo', 'SBT', 'HBO', 'Netflix', 'Esportes', 'Filmes 2024'].map(
                (suggestion) => (
                  <Pressable
                    key={suggestion}
                    style={styles.suggestionChip}
                    onPress={() => handleRecentSearchPress(suggestion)}
                  >
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </Pressable>
                )
              )}
            </View>
          </View>
        </View>
      )}
    </ScreenContainer>
  );
}
