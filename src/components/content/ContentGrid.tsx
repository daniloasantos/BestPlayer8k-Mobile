import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ListRenderItem,
} from 'react-native';
import { useColors, spacing, borderRadius } from '@/theme';
import { EmptyState, Skeleton } from '@/components/ui';
import { ChannelCard } from './ChannelCard';
import { MovieCard } from './MovieCard';
import { SeriesCard } from './SeriesCard';
import type { Channel, Movie, Series } from '@/types';

type ContentType = 'channel' | 'movie' | 'series';
type ContentItem = Channel | Movie | Series;

interface ContentGridProps<T extends ContentItem> {
  data: T[];
  type: ContentType;
  isLoading?: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  onItemPress?: (item: T) => void;
  onFavoritePress?: (item: T) => void;
  numColumns?: number;
  showFavorite?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: any;
  ListHeaderComponent?: React.ReactElement;
  ListFooterComponent?: React.ReactElement;
  contentContainerStyle?: object;
}

export function ContentGrid<T extends ContentItem>({
  data,
  type,
  isLoading = false,
  isRefreshing = false,
  onRefresh,
  onEndReached,
  onEndReachedThreshold = 0.5,
  onItemPress,
  onFavoritePress,
  numColumns = 2,
  showFavorite = true,
  emptyTitle = 'Nenhum conteúdo',
  emptyDescription = 'Não há conteúdo disponível no momento.',
  emptyIcon,
  ListHeaderComponent,
  ListFooterComponent,
  contentContainerStyle,
}: ContentGridProps<T>) {
  const colors = useColors();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    contentContainer: {
      padding: spacing.md,
      paddingBottom: spacing.xl * 2,
    },
    columnWrapper: {
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    itemContainer: {
      flex: 1,
      maxWidth: numColumns === 1 ? '100%' : `${100 / numColumns - 2}%`,
      marginBottom: spacing.md,
    },
    loadingContainer: {
      padding: spacing.xl,
      alignItems: 'center',
    },
    skeletonGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      padding: spacing.md,
    },
    skeletonItem: {
      width: '48%',
      marginBottom: spacing.md,
    },
    skeletonImage: {
      width: '100%',
      aspectRatio: type === 'channel' ? 16 / 9 : 2 / 3,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.sm,
    },
    skeletonText: {
      height: 16,
      borderRadius: borderRadius.sm,
      marginBottom: spacing.xs,
    },
    skeletonTextShort: {
      width: '60%',
      height: 14,
      borderRadius: borderRadius.sm,
    },
  });

  const renderItem: ListRenderItem<T> = ({ item }) => {
    const handlePress = () => onItemPress?.(item);
    const handleFavorite = () => onFavoritePress?.(item);

    switch (type) {
      case 'channel':
        return (
          <View style={styles.itemContainer}>
            <ChannelCard
              channel={item as Channel}
              onPress={handlePress}
              onFavoritePress={handleFavorite}
              showFavorite={showFavorite}
              compact
            />
          </View>
        );
      case 'movie':
        return (
          <View style={styles.itemContainer}>
            <MovieCard
              movie={item as Movie}
              onPress={handlePress}
              onFavoritePress={handleFavorite}
              showFavorite={showFavorite}
            />
          </View>
        );
      case 'series':
        return (
          <View style={styles.itemContainer}>
            <SeriesCard
              series={item as Series}
              onPress={handlePress}
              onFavoritePress={handleFavorite}
              showFavorite={showFavorite}
            />
          </View>
        );
      default:
        return null;
    }
  };

  const renderLoadingSkeleton = () => (
    <View style={styles.skeletonGrid}>
      {Array.from({ length: 6 }).map((_, index) => (
        <View key={index} style={styles.skeletonItem}>
          <Skeleton style={styles.skeletonImage} />
          <Skeleton style={styles.skeletonText} />
          <Skeleton style={styles.skeletonTextShort} />
        </View>
      ))}
    </View>
  );

  const renderFooter = () => {
    if (isLoading && data.length > 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      );
    }
    return ListFooterComponent || null;
  };

  const renderEmpty = () => {
    if (isLoading) {
      return renderLoadingSkeleton();
    }
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  };

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={numColumns}
      columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={renderFooter()}
      ListEmptyComponent={renderEmpty()}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        ) : undefined
      }
    />
  );
}
