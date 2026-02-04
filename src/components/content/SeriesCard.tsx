import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Play, Heart, Star, Tv, Calendar } from 'lucide-react-native';
import { useColors, spacing, borderRadius, typography } from '@/theme';
import { QualityBadge, Badge } from '@/components/ui';
import type { Series } from '@/types';

interface SeriesCardProps {
  series: Series;
  onPress?: () => void;
  onFavoritePress?: () => void;
  showFavorite?: boolean;
  showInfo?: boolean;
  width?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DEFAULT_WIDTH = (SCREEN_WIDTH - spacing.lg * 3) / 2;

export function SeriesCard({
  series,
  onPress,
  onFavoritePress,
  showFavorite = true,
  showInfo = true,
  width = DEFAULT_WIDTH,
}: SeriesCardProps) {
  const colors = useColors();
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/series/${series.id}` as any);
    }
  };

  const styles = StyleSheet.create({
    container: {
      width,
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      overflow: 'hidden',
    },
    imageContainer: {
      width: '100%',
      aspectRatio: 2 / 3,
      backgroundColor: colors.muted,
      position: 'relative',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    imagePlaceholder: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.muted,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      padding: spacing.sm,
      justifyContent: 'space-between',
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    badges: {
      flexDirection: 'row',
      gap: spacing.xs,
      flexWrap: 'wrap',
      flex: 1,
    },
    favoriteButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: spacing.xs,
    },
    bottomRow: {
      alignItems: 'center',
    },
    playButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      padding: spacing.sm,
    },
    title: {
      ...typography.body,
      color: colors.foreground,
      fontWeight: '600',
      fontSize: 14,
      marginBottom: spacing.xs,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.xs,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    metaText: {
      ...typography.small,
      color: colors.mutedForeground,
    },
    ratingText: {
      ...typography.small,
      color: colors.accent,
      fontWeight: '600',
    },
    seasonsText: {
      ...typography.small,
      color: colors.primary,
      fontWeight: '600',
    },
    genre: {
      ...typography.small,
      color: colors.mutedForeground,
    },
    episodeCount: {
      ...typography.small,
      color: colors.mutedForeground,
    },
  });

  const getTotalEpisodes = () => {
    if (!series.seasons) return 0;
    return series.seasons.reduce((total, season) => total + (season.episodes?.length || 0), 0);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { opacity: pressed ? 0.8 : 1 },
      ]}
      onPress={handlePress}
    >
      <View style={styles.imageContainer}>
        {series.poster ? (
          <Image
            source={{ uri: series.poster }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Tv size={32} color={colors.mutedForeground} />
          </View>
        )}

        <View style={styles.overlay}>
          <View style={styles.topRow}>
            <View style={styles.badges}>
              {series.quality && (
                <QualityBadge quality={series.quality} size="sm" />
              )}
              {series.seasons && series.seasons.length > 0 && (
                <Badge variant="primary" size="sm">
                  {series.seasons.length} Temp.
                </Badge>
              )}
            </View>
            {showFavorite && (
              <Pressable
                style={styles.favoriteButton}
                onPress={(e) => {
                  e.stopPropagation?.();
                  onFavoritePress?.();
                }}
              >
                <Heart
                  size={18}
                  color={series.isFavorite ? colors.error : colors.foreground}
                  fill={series.isFavorite ? colors.error : 'transparent'}
                />
              </Pressable>
            )}
          </View>
          <View style={styles.bottomRow}>
            <View style={styles.playButton}>
              <Play size={20} color={colors.foreground} fill={colors.foreground} />
            </View>
          </View>
        </View>
      </View>

      {showInfo && (
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {series.name}
          </Text>

          <View style={styles.metaRow}>
            {series.rating && (
              <View style={styles.metaItem}>
                <Star size={12} color={colors.accent} fill={colors.accent} />
                <Text style={styles.ratingText}>{series.rating.toFixed(1)}</Text>
              </View>
            )}
            {series.year && (
              <View style={styles.metaItem}>
                <Calendar size={12} color={colors.mutedForeground} />
                <Text style={styles.metaText}>{series.year}</Text>
              </View>
            )}
          </View>

          {series.seasons && (
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Tv size={12} color={colors.primary} />
                <Text style={styles.seasonsText}>
                  {series.seasons.length} Temporada{series.seasons.length !== 1 ? 's' : ''}
                </Text>
              </View>
              {getTotalEpisodes() > 0 && (
                <Text style={styles.episodeCount}>
                  • {getTotalEpisodes()} episódios
                </Text>
              )}
            </View>
          )}

          {series.genre && (
            <Text style={styles.genre} numberOfLines={1}>
              {series.genre}
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );
}
