import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useColors, spacing, borderRadius } from '@/theme';
import { Skeleton } from '@/components/ui';
import { ChannelCard } from './ChannelCard';
import { MovieCard } from './MovieCard';
import { SeriesCard } from './SeriesCard';
import type { Channel, Movie, Series } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ContentType = 'channel' | 'movie' | 'series' | 'mixed';
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
  compact?: boolean;
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
  compact = true,
}: HorizontalListProps<T>) {
  const colors = useColors();

  const getDefaultWidth = (itemType?: string) => {
    if (compact) {
      if (itemType === 'MOVIE' || itemType === 'SERIES' || type === 'movie' || type === 'series') {
        return (SCREEN_WIDTH - spacing.md * 4) / 3;
      }
      return (SCREEN_WIDTH - spacing.md * 4) / 2.5; // Channel width slightly larger
    }

    // Non-compact widths
    const effectiveType = itemType || type;
    switch (effectiveType) {
      case 'channel':
      case 'LIVE':
        return SCREEN_WIDTH * 0.5;
      case 'movie':
      case 'series':
      case 'MOVIE':
      case 'SERIES':
        return SCREEN_WIDTH * 0.32;
      default:
        return SCREEN_WIDTH * 0.35;
    }
  };

  const getMinHeight = () => {
    // For mixed or movie/series, we need more height
    if (type === 'mixed' || type === 'movie' || type === 'series') {
      return compact ? 200 : 280;
    }
    return compact ? 140 : 180;
  };

  const styles = StyleSheet.create({
    container: {
      minHeight: getMinHeight(),
    },
    contentContainer: {
      paddingHorizontal: spacing.sm,
      gap: spacing.sm,
      alignItems: 'flex-start', // Align items to top
    },
    // Removed fixed width itemContainer/skeletonItem from styles as it will be dynamic
    skeletonContainer: {
      flexDirection: 'row',
      paddingHorizontal: spacing.sm,
      gap: spacing.sm,
    },
    skeletonImage: {
      width: '100%',
      aspectRatio: type === 'channel' ? 4 / 3 : 2 / 3, // Default aspect
      borderRadius: borderRadius.lg,
      marginBottom: spacing.xs,
    },
    skeletonText: {
      height: 12,
      width: '80%',
      borderRadius: borderRadius.sm,
      marginBottom: spacing.xs,
    },
    skeletonTextShort: {
      height: 10,
      width: '50%',
      borderRadius: borderRadius.sm,
    },
  });

  const renderItem = ({ item }: { item: T }) => {
    const handlePress = () => onItemPress?.(item);
    const handleFavorite = () => onFavoritePress?.(item);

    // Determine type for this specific item if mixed
    let itemType = type;
    if (type === 'mixed' && 'type' in item) {
      const channelType = (item as Channel).type;
      if (channelType === 'MOVIE') itemType = 'movie';
      else if (channelType === 'SERIES') itemType = 'series';
      else itemType = 'channel';
    }

    // Dynamic width based on specific item type
    const currentWidth = itemWidth || getDefaultWidth(
      'type' in item ? (item as Channel).type : undefined
    );

    const itemStyle = { width: currentWidth };

    switch (itemType) {
      case 'channel':
        return (
          <View style={itemStyle}>
            <ChannelCard
              channel={item as Channel}
              onPress={handlePress}
              onFavoritePress={handleFavorite}
              showFavorite={showFavorite}
              compact={compact}
              width={currentWidth}
            />
          </View>
        );
      case 'movie':
        return (
          <View style={itemStyle}>
            <MovieCard
              movie={item as Movie | Channel}
              onPress={handlePress}
              onFavoritePress={handleFavorite}
              showFavorite={showFavorite}
              showInfo={showInfo}
              compact={compact}
              width={currentWidth}
            />
          </View>
        );
      case 'series':
        return (
          <View style={itemStyle}>
            <SeriesCard
              series={item as Series}
              onPress={handlePress}
              onFavoritePress={handleFavorite}
              showFavorite={showFavorite}
              showInfo={showInfo}
              compact={compact}
              width={currentWidth}
            />
          </View>
        );
      default:
        return null;
    }
  };

  const renderLoadingSkeleton = () => {
    // Defines skeleton width based on list type (defaulting to channel if mixed, or just avg)
    const skeletonWidth = itemWidth || getDefaultWidth(type === 'mixed' ? 'channel' : undefined);

    return (
      <View style={styles.skeletonContainer}>
        {Array.from({ length: 4 }).map((_, index) => (
          <View key={index} style={{ width: skeletonWidth }}>
            <Skeleton style={styles.skeletonImage} />
            <Skeleton style={styles.skeletonText} />
            <Skeleton style={styles.skeletonTextShort} />
          </View>
        ))}
      </View>
    );
  };

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
