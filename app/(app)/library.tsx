import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Library, Film, Tv2 } from 'lucide-react-native';
import { spacing } from '@/theme';
import { ScreenContainer, Header } from '@/components/layout';
import { SegmentedControl, SearchBar } from '@/components/ui';
import { ContentGrid, CategoryFilter } from '@/components/content';
import { useChannels, useCategories, useToggleFavorite, useSeries } from '@/hooks';
import type { Channel, Series, ChannelType } from '@/types';
import { useLanguage } from '@/contexts';

type ContentTab = 'movies' | 'series';

export default function LibraryScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<ContentTab>('movies');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const TABS = [
    { id: 'movies' as ContentTab, label: t('library.tab_movies'), icon: Film },
    { id: 'series' as ContentTab, label: t('library.tab_series'), icon: Tv2 },
  ];

  const channelType: ChannelType = activeTab === 'movies' ? 'MOVIE' : 'SERIES';

  // Use useChannels for movies
  const {
    data: moviesData,
    isLoading: loadingMovies,
    refetch: refetchMovies,
    isRefetching: isRefetchingMovies,
  } = useChannels({
    type: 'MOVIE',
    categoryId: selectedCategory || undefined,
    search: searchQuery || undefined,
  });

  // Use useSeries for series (grouped)
  const {
    data: seriesData,
    isLoading: loadingSeries,
    refetch: refetchSeries,
    isRefetching: isRefetchingSeries,
  } = useSeries({
    categoryId: selectedCategory || undefined,
    search: searchQuery || undefined,
  });

  const {
    data: categories,
    isLoading: loadingCategories,
  } = useCategories(channelType);

  const toggleFavorite = useToggleFavorite();

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId as ContentTab);
    setSelectedCategory(null);
    setSearchQuery('');
  }, []);

  const handleCategorySelect = useCallback((categoryId: string | null) => {
    setSelectedCategory(categoryId);
  }, []);

  const handleItemPress = useCallback((item: Channel | Series) => {
    if (activeTab === 'movies') {
      router.push(`/channels/${item.id}` as any);
    } else {
      router.push(`/series/${item.id}` as any);
    }
  }, [activeTab, router]);

  const handleFavoritePress = useCallback((item: Channel | Series) => {
    toggleFavorite.mutate(item.id);
  }, [toggleFavorite]);

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const styles = StyleSheet.create({
    segmentContainer: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
    searchContainer: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.sm,
    },
  });

  // Select the correct data based on active tab
  const items = activeTab === 'movies'
    ? (moviesData?.items || [])
    : (seriesData?.items || []);
  const isLoading = activeTab === 'movies' ? loadingMovies : loadingSeries;
  const isRefreshing = activeTab === 'movies' ? isRefetchingMovies : isRefetchingSeries;
  const refetch = activeTab === 'movies' ? refetchMovies : refetchSeries;
  const contentType = activeTab === 'movies' ? 'movie' : 'series';

  return (
    <ScreenContainer scrollable={false} noPadding>
      <Header
        title={t('library.screen_title')}
        icon={Library}
        showSearch
        onSearchPress={() => router.push('/search')}
      />

      <View style={styles.segmentContainer}>
        <SegmentedControl
          options={TABS.map((tab) => ({
            value: tab.id,
            label: tab.label,
          }))}
          value={activeTab}
          onChange={handleTabChange}
        />
      </View>

      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder={activeTab === 'movies' ? t('library.search_movies') : t('library.search_series')}
        />
      </View>

      <CategoryFilter
        categories={categories || []}
        selectedId={selectedCategory}
        onSelect={handleCategorySelect}
        isLoading={loadingCategories}
        allLabel={activeTab === 'movies' ? t('library.all_movies') : t('library.all_series')}
      />

      <ContentGrid
        data={items}
        type={contentType}
        numColumns={3}
        isLoading={isLoading && items.length === 0}
        isRefreshing={isRefreshing}
        onRefresh={refetch}
        onItemPress={handleItemPress}
        onFavoritePress={handleFavoritePress}
        emptyTitle={
          activeTab === 'movies' ? t('library.empty_movies_title') : t('library.empty_series_title')
        }
        emptyDescription={
          searchQuery
            ? t('library.empty_search', { query: searchQuery })
            : (activeTab === 'movies' ? t('library.empty_movies_description') : t('library.empty_series_description'))
        }
        emptyIcon={activeTab === 'movies' ? Film : Tv2}
      />
    </ScreenContainer>
  );
}
