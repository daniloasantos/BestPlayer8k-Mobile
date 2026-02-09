import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Tv, Search } from 'lucide-react-native';
import { useColors, spacing } from '@/theme';
import { ScreenContainer, Header } from '@/components/layout';
import { SearchBar, EmptyState } from '@/components/ui';
import { ContentGrid, CategoryFilter } from '@/components/content';
import { useChannels, useCategories, useToggleFavorite } from '@/hooks';
import { useLanguage } from '@/contexts';
import type { Channel, Category } from '@/types';

export default function LiveScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const {
    data: channelsData,
    isLoading: loadingChannels,
    refetch: refetchChannels,
    isRefetching,
  } = useChannels({
    type: 'LIVE',
    categoryId: selectedCategory || undefined,
    search: searchQuery || undefined,
  });

  const {
    data: categories,
    isLoading: loadingCategories,
  } = useCategories('LIVE');

  const toggleFavorite = useToggleFavorite();

  const handleCategorySelect = useCallback((categoryId: string | null) => {
    setSelectedCategory(categoryId);
  }, []);

  const handleChannelPress = useCallback((channel: Channel) => {
    router.push(`/channels/${channel.id}` as any);
  }, [router]);

  const handleFavoritePress = useCallback((channel: Channel) => {
    toggleFavorite.mutate(channel.id);
  }, [toggleFavorite]);

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const styles = StyleSheet.create({
    searchContainer: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.sm,
    },
  });

  const channels = channelsData?.items || [];

  return (
    <ScreenContainer scrollable={false} noPadding>
      <Header
        title={t('live.screen_title')}
        icon={Tv}
        showSearch
        onSearchPress={() => router.push('/search')}
      />

      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder={t('live.search_placeholder')}
        />
      </View>

      <CategoryFilter
        categories={categories || []}
        selectedId={selectedCategory}
        onSelect={handleCategorySelect}
        isLoading={loadingCategories}
        allLabel={t('live.all_channels')}
      />

      <ContentGrid
        data={channels}
        type="channel"
        numColumns={3}
        isLoading={loadingChannels && channels.length === 0}
        isRefreshing={isRefetching}
        onRefresh={refetchChannels}
        onItemPress={handleChannelPress}
        onFavoritePress={handleFavoritePress}
        emptyTitle={t('live.empty_title')}
        emptyDescription={
          searchQuery
            ? t('live.empty_search', { query: searchQuery })
            : t('live.empty_description')
        }
        emptyIcon={Tv}
      />
    </ScreenContainer>
  );
}
