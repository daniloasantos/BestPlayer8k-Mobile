import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Star, Calendar, Tag } from 'lucide-react-native';
import { useColors, spacing, borderRadius, typography } from '@/theme';
import { Skeleton, SkeletonText } from '@/components/ui';
import { useLanguage } from '@/contexts';
import type { TmdbMovieInfo } from '@/services/tmdb.service';

interface MovieSynopsisProps {
  info: TmdbMovieInfo | null | undefined;
  isLoading: boolean;
}

const MAX_LINES = 4;

export function MovieSynopsis({ info, isLoading }: MovieSynopsisProps) {
  const colors = useColors();
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  const styles = StyleSheet.create({
    container: {
      marginTop: spacing.md,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: spacing.md,
      marginBottom: spacing.sm,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    metaText: {
      ...typography.small,
      color: colors.mutedForeground,
    },
    ratingText: {
      ...typography.small,
      color: '#f59e0b',
      fontWeight: '600',
    },
    genreRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
      marginBottom: spacing.sm,
    },
    genrePill: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: borderRadius.full,
      backgroundColor: colors.muted,
    },
    genreText: {
      ...typography.small,
      color: colors.mutedForeground,
      fontSize: 11,
    },
    overview: {
      ...typography.body,
      color: colors.mutedForeground,
      lineHeight: 22,
    },
    toggleButton: {
      marginTop: spacing.xs,
    },
    toggleText: {
      ...typography.small,
      color: colors.primary,
      fontWeight: '600',
    },
    skeletonMeta: {
      height: 14,
      width: 120,
      borderRadius: borderRadius.sm,
    },
    skeletonGenre: {
      height: 20,
      width: 70,
      borderRadius: borderRadius.full,
    },
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.metaRow}>
          <Skeleton style={styles.skeletonMeta} />
          <Skeleton style={styles.skeletonMeta} />
        </View>
        <View style={[styles.genreRow, { marginBottom: spacing.sm }]}>
          <Skeleton style={styles.skeletonGenre} />
          <Skeleton style={styles.skeletonGenre} />
          <Skeleton style={styles.skeletonGenre} />
        </View>
        <SkeletonText lines={4} />
      </View>
    );
  }

  if (!info?.overview) return null;

  return (
    <View style={styles.container}>
      {/* Meta: rating + year */}
      <View style={styles.metaRow}>
        {info.rating !== null && (
          <View style={styles.metaItem}>
            <Star size={13} color="#f59e0b" fill="#f59e0b" />
            <Text style={styles.ratingText}>{info.rating.toFixed(1)}</Text>
            <Text style={styles.metaText}>/10</Text>
          </View>
        )}
        {info.releaseYear !== null && (
          <View style={styles.metaItem}>
            <Calendar size={13} color={colors.mutedForeground} />
            <Text style={styles.metaText}>{info.releaseYear}</Text>
          </View>
        )}
      </View>

      {/* Genres */}
      {info.genres.length > 0 && (
        <View style={styles.genreRow}>
          {info.genres.map((g) => (
            <View key={g} style={styles.genrePill}>
              <Text style={styles.genreText}>{g}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Synopsis */}
      <Text
        style={styles.overview}
        numberOfLines={expanded ? undefined : MAX_LINES}
      >
        {info.overview}
      </Text>
      {info.overview.length > 200 && (
        <Pressable style={styles.toggleButton} onPress={() => setExpanded((v) => !v)}>
          <Text style={styles.toggleText}>
            {expanded ? t('movies.see_less') : t('movies.see_more')}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
