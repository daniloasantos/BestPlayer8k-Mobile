import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Library, Film, Tv2 } from 'lucide-react-native';
import { useColors, spacing } from '@/theme';
import { ScreenContainer, Header } from '@/components/layout';
import { SegmentedControl, SearchBar, EmptyState } from '@/components/ui';
import { ContentGrid, CategoryFilter } from '@/components/content';
import { useChannels, useCategories, useToggleFavorite } from '@/hooks';
import type { Channel, ChannelType } from '@/types';

type ContentTab = 'movies' | 'series';

const TABS = [
  { id: 'movies' as ContentTab, label: 'Filmes', icon: Film },
  { id: 'series' as ContentTab, label: 'Séries', icon: Tv2 },
];

export default function LibraryScreen() {
  const colors = useColors();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ContentTab>('movies');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const channelType: ChannelType = activeTab === 'movies' ? 'MOVIE' : 'SERIES';

  const {
    data: contentData,
    isLoading: loadingContent,
    refetch: refetchContent,
    isRefetching,
  } = useChannels({
    type: channelType,
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

  const handleItemPress = useCallback((item: Channel) => {
    if (activeTab === 'movies') {
      router.push(`/channels/${item.id}` as any);
    } else {
      router.push(`/series/${item.id}` as any);
    }
  }, [activeTab, router]);

  const handleFavoritePress = useCallback((item: Channel) => {
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

  const items = contentData?.items || [];
  const contentType = activeTab === 'movies' ? 'movie' : 'series';

  return (
    <ScreenContainer scrollable={false} noPadding>
      <Header
        title="Biblioteca"
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
          placeholder={`Buscar ${activeTab === 'movies' ? 'filmes' : 'séries'}...`}
        />
      </View>

      <CategoryFilter
        categories={categories || []}
        selectedId={selectedCategory}
        onSelect={handleCategorySelect}
        isLoading={loadingCategories}
        allLabel={activeTab === 'movies' ? 'Todos os filmes' : 'Todas as séries'}
      />

      <ContentGrid
        data={items}
        type={contentType}
        numColumns={3}
        isLoading={loadingContent && items.length === 0}
        isRefreshing={isRefetching}
        onRefresh={refetchContent}
        onItemPress={handleItemPress}
        onFavoritePress={handleFavoritePress}
        emptyTitle={
          activeTab === 'movies' ? 'Nenhum filme encontrado' : 'Nenhuma série encontrada'
        }
        emptyDescription={
          searchQuery
            ? `Nenhum resultado para "${searchQuery}"`
            : `Não há ${activeTab === 'movies' ? 'filmes' : 'séries'} disponíveis no momento.`
        }
        emptyIcon={activeTab === 'movies' ? Film : Tv2}
      />
    </ScreenContainer>
  );
}
