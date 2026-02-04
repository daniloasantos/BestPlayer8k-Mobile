import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Play, Heart, Tv2 } from 'lucide-react-native';
import { useColors, spacing, borderRadius, typography } from '@/theme';
import { QualityBadge, Badge } from '@/components/ui';
import type { Series, Channel } from '@/types';

interface SeriesCardProps {
  series: Series | Channel;
  onPress?: () => void;
  onFavoritePress?: () => void;
  showFavorite?: boolean;
  showInfo?: boolean;
  compact?: boolean;
  width?: number | string;
}

export function SeriesCard({
  series,
  onPress,
  onFavoritePress,
  showFavorite = true,
  showInfo = true,
  compact = false,
  width,
}: SeriesCardProps) {
  const colors = useColors();
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/series/${series.id}` as any);
    }
  };

  // Verifica se tem imagem válida
  const posterUrl = 'poster' in series ? series.poster : series.logo;
  const hasValidImage = posterUrl && posterUrl.trim() !== '' && !imageError;

  // Gera cor baseada no nome
  const getInitialColor = (name: string) => {
    const colorList = ['#10B981', '#8B5CF6', '#EC4899', '#F59E0B', '#3B82F6', '#6366F1'];
    const index = name.charCodeAt(0) % colorList.length;
    return colorList[index];
  };

  const styles = StyleSheet.create({
    container: {
      width: width || '100%',
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
      overflow: 'hidden',
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
    placeholderCircle: {
      width: compact ? 36 : 56,
      height: compact ? 36 : 56,
      borderRadius: compact ? 18 : 28,
      backgroundColor: getInitialColor(series.name) + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xs,
    },
    initialText: {
      fontSize: compact ? 16 : 22,
      fontWeight: '800',
      color: getInitialColor(series.name),
    },
    placeholderIcon: {
      opacity: 0.3,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      padding: compact ? spacing.xs : spacing.sm,
      justifyContent: 'space-between',
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    badges: {
      flexDirection: 'row',
      gap: 2,
      flex: 1,
      flexWrap: 'wrap',
    },
    favoriteButton: {
      width: compact ? 24 : 32,
      height: compact ? 24 : 32,
      borderRadius: borderRadius.md,
      backgroundColor: series.isFavorite ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0, 0, 0, 0.5)',
      borderWidth: 1,
      borderColor: series.isFavorite ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: spacing.xs,
    },
    bottomRow: {
      alignItems: 'center',
    },
    playButton: {
      width: compact ? 32 : 44,
      height: compact ? 32 : 44,
      borderRadius: compact ? 16 : 22,
      backgroundColor: '#10B981',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 4,
    },
    content: {
      padding: spacing.sm,
      paddingTop: spacing.xs,
      minHeight: compact ? 48 : 56,
    },
    title: {
      ...typography.body,
      color: colors.foreground,
      fontWeight: '700',
      fontSize: compact ? 10 : 13,
      letterSpacing: -0.2,
      lineHeight: compact ? 13 : 16,
    },
    categoryText: {
      fontSize: compact ? 8 : 10,
      fontWeight: '600',
      color: colors.mutedForeground,
      textTransform: 'uppercase',
      letterSpacing: 0.3,
      marginTop: 2,
    },
  });

  // Verifica se é uma série completa com temporadas
  const hasSeries = 'seasons' in series && series.seasons;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        {
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
      onPress={handlePress}
    >
      <View style={styles.imageContainer}>
        {hasValidImage && posterUrl ? (
          <Image
            source={{ uri: posterUrl }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <View style={styles.placeholderCircle}>
              <Text style={styles.initialText}>
                {series.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Tv2 size={compact ? 18 : 24} color={colors.mutedForeground} style={styles.placeholderIcon} />
          </View>
        )}

        <View style={styles.overlay}>
          <View style={styles.topRow}>
            <View style={styles.badges}>
              {series.quality && (
                <QualityBadge quality={series.quality} size="sm" />
              )}
              {!compact && hasSeries && series.seasons && series.seasons.length > 0 && (
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
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Heart
                  size={compact ? 12 : 16}
                  color={series.isFavorite ? '#EF4444' : '#fff'}
                  fill={series.isFavorite ? '#EF4444' : 'transparent'}
                />
              </Pressable>
            )}
          </View>
          <View style={styles.bottomRow}>
            <View style={styles.playButton}>
              <Play size={compact ? 14 : 20} color="#fff" fill="#fff" />
            </View>
          </View>
        </View>
      </View>

      {showInfo && (
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {series.name}
          </Text>
          {'category' in series && series.category && (
            <Text style={styles.categoryText} numberOfLines={1}>
              {series.category}
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );
}
