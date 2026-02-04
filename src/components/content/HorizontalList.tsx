import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useColors, spacing, borderRadius } from '@/theme';
import { Skeleton } from '@/components/ui';
import { ChannelCard } from './ChannelCard';
import { MovieCard } from './MovieCard';
import { SeriesCard } from './SeriesCard';
import type { Channel, Movie, Series } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ContentType = 'channel' | 'movie' | 'series';
type ContentItem = Channel | Movie | Series;

interface HorizontalListProps<T extends ContentItem> {
  data: T[];
  type: ContentType;
  isLoading?: boolean;
  onItemPress?: (item: T) => void;
  onFavoritePress?: (item: T) => void;
  showFavorite?: boolean;
  itemWidth?: number;
  showInfo?: boolean;
}

export function HorizontalList<T extends ContentItem>({
  data,
  type,
  isLoading = false,
  onItemPress,
  onFavoritePress,
  showFavorite = true,
  itemWidth,
  showInfo = true,
}: HorizontalListProps<T>) {
  const colors = useColors();

  const getDefaultWidth = () => {
    switch (type) {
      case 'channel':
        return SCREEN_WIDTH * 0.7;
      case 'movie':
      case 'series':
        return SCREEN_WIDTH * 0.38;
      default:
        return SCREEN_WIDTH * 0.45;
    }
  };

  const width = itemWidth || getDefaultWidth();

  const styles = StyleSheet.create({
    container: {
      minHeight: type === 'channel' ? 180 : 280,
    },
    contentContainer: {
      paddingHorizontal: spacing.md,
      gap: spacing.md,
    },
    itemContainer: {
      width,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.xl,
    },
    skeletonContainer: {
      flexDirection: 'row',
      paddingHorizontal: spacing.md,
      gap: spacing.md,
    },
    skeletonItem: {
      width,
    },
    skeletonImage: {
      width: '100%',
      aspectRatio: type === 'channel' ? 16 / 9 : 2 / 3,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.sm,
    },
    skeletonText: {
      height: 14,
      width: '80%',
      borderRadius: borderRadius.sm,
      marginBottom: spacing.xs,
    },
    skeletonTextShort: {
      height: 12,
      width: '50%',
      borderRadius: borderRadius.sm,
    },
  });

  const renderItem = ({ item }: { item: T }) => {
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
              showInfo={showInfo}
              width={width}
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
              showInfo={showInfo}
              width={width}
            />
          </View>
        );
      default:
        return null;
    }
  };

  const renderLoadingSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {Array.from({ length: 3 }).map((_, index) => (
        <View key={index} style={styles.skeletonItem}>
          <Skeleton style={styles.skeletonImage} />
          <Skeleton style={styles.skeletonText} />
          <Skeleton style={styles.skeletonTextShort} />
        </View>
      ))}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        {renderLoadingSkeleton()}
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
      style={styles.container}
    />
  );
}
