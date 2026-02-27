import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import {
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Heart,
} from 'lucide-react-native';
import { useColors, spacing, borderRadius, typography } from '@/theme';
import { VideoPlayer } from '@/components/player';
import { QualityBadge, Badge, Loading, EmptyState } from '@/components/ui';
import { MovieSynopsis } from '@/components/content';
import { useSeriesDetail, useMarkAsWatched, useToggleFavorite, useEpisodeInfo } from '@/hooks';
import { useFloatingPlayer, useLanguage } from '@/contexts';
import type { Episode } from '@/types';

export default function EpisodePlayerScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t } = useLanguage();
  const {
    id: seriesId,
    episodeId,
    episodeName,
    streamUrl,
    season,
    episodeNumber,
  } = useLocalSearchParams<{
    id: string;
    episodeId: string;
    episodeName?: string;
    streamUrl?: string;
    season?: string;
    episodeNumber?: string;
  }>();

  const { setChannel: setFloatingChannel, stop: stopFloatingPlayer, maximize } = useFloatingPlayer();
  const [isActive, setIsActive] = useState(true);

  // Fetch series details to get all episodes for navigation
  const { data: series, isLoading: seriesLoading } = useSeriesDetail(seriesId || '');
  const markAsWatched = useMarkAsWatched();
  const toggleFavorite = useToggleFavorite();

  useFocusEffect(
    useCallback(() => {
      setIsActive(true);
      return () => {
        setIsActive(false);
        setFloatingChannel(null);
      };
    }, [setFloatingChannel])
  );

  // Close floating player when opening this screen
  useEffect(() => {
    stopFloatingPlayer();
    maximize();
  }, [episodeId, stopFloatingPlayer, maximize]);

  // Record watch history
  useEffect(() => {
    if (episodeId) {
      markAsWatched.mutate(episodeId);
    }
  }, [episodeId]);

  const handleBack = useCallback(() => {
    setFloatingChannel(null);
    // Navigate explicitly to series detail page
    router.replace(`/series/${seriesId}` as any);
  }, [setFloatingChannel, router, seriesId]);

  const handleFavorite = useCallback(() => {
    if (seriesId) {
      toggleFavorite.mutate(seriesId);
    }
  }, [toggleFavorite, seriesId]);

  // Find current episode and adjacent episodes
  const { currentEpisode, prevEpisode, nextEpisode, allEpisodes } = React.useMemo(() => {
    if (!series?.seasons) {
      return { currentEpisode: null, prevEpisode: null, nextEpisode: null, allEpisodes: [] };
    }

    // Flatten all episodes
    const episodes: Episode[] = [];
    series.seasons.forEach((s) => {
      if (s.episodes) {
        episodes.push(...s.episodes);
      }
    });

    const currentIndex = episodes.findIndex((ep) => ep.id === episodeId);
    const current = currentIndex >= 0 ? episodes[currentIndex] : null;
    const prev = currentIndex > 0 ? episodes[currentIndex - 1] : null;
    const next = currentIndex < episodes.length - 1 ? episodes[currentIndex + 1] : null;

    return {
      currentEpisode: current,
      prevEpisode: prev,
      nextEpisode: next,
      allEpisodes: episodes,
    };
  }, [series, episodeId]);

  const navigateToEpisode = useCallback((episode: Episode) => {
    router.replace({
      pathname: '/series/[id]/watch/[episodeId]',
      params: {
        id: seriesId || '',
        episodeId: episode.id,
        episodeName: episode.name || t('series.episode_fallback', { number: episode.number }),
        streamUrl: episode.streamUrl,
        season: episode.season?.toString() || '1',
        episodeNumber: episode.number?.toString() || '1',
      },
    } as any);
  }, [router, seriesId]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: spacing.md,
      paddingTop: spacing.xl + spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    headerTitle: {
      ...typography.header,
      color: colors.foreground,
      flex: 1,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.muted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    favoriteButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.muted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      flex: 1,
    },
    info: {
      padding: spacing.lg,
    },
    episodeLabel: {
      ...typography.label,
      color: colors.primary,
      fontWeight: '600',
      marginBottom: spacing.xs,
    },
    title: {
      ...typography.title,
      color: colors.foreground,
      marginBottom: spacing.sm,
    },
    seriesName: {
      ...typography.body,
      color: colors.mutedForeground,
      marginBottom: spacing.md,
    },
    badges: {
      flexDirection: 'row',
      gap: spacing.xs,
      marginBottom: spacing.lg,
    },
    navigation: {
      flexDirection: 'row',
      gap: spacing.md,
      marginTop: spacing.md,
    },
    navButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      padding: spacing.md,
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    navButtonPrimary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    navButtonText: {
      ...typography.label,
      color: colors.foreground,
      fontWeight: '600',
    },
    navButtonTextPrimary: {
      color: '#FFFFFF',
    },
    navButtonDisabled: {
      opacity: 0.5,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    errorContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
    },
  });

  // Use URL params or fetched episode data
  const displayStreamUrl = currentEpisode?.streamUrl || streamUrl || '';
  const displayName = currentEpisode?.name || episodeName || t('series.episode_label');
  const displaySeason = currentEpisode?.season?.toString() || season || '1';
  const displayEpisodeNumber = currentEpisode?.number?.toString() || episodeNumber || '1';
  const episodeQuality = currentEpisode?.quality;

  const seasonNum = currentEpisode?.season ?? parseInt(displaySeason, 10);
  const episodeNum = currentEpisode?.number ?? parseInt(displayEpisodeNumber, 10);
  const { data: episodeInfo, isLoading: loadingEpisodeInfo } = useEpisodeInfo(
    series?.name,
    seasonNum,
    episodeNum,
  );

  if (!displayStreamUrl) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={handleBack} hitSlop={8}>
            <ChevronLeft size={24} color={colors.foreground} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {t('series.episode_label')}
          </Text>
          <Pressable style={styles.favoriteButton} onPress={handleFavorite} hitSlop={8}>
            <Heart
              size={20}
              color={series?.isFavorite ? colors.error : colors.foreground}
              fill={series?.isFavorite ? colors.error : 'transparent'}
            />
          </Pressable>
        </View>
        <View style={styles.errorContainer}>
          <EmptyState
            icon={AlertCircle}
            title={t('series.stream_unavailable')}
            description={t('series.stream_unavailable_desc')}
            actionLabel={t('common.back')}
            onAction={handleBack}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header with Title, Back Button and Favorite */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={handleBack} hitSlop={8}>
            <ChevronLeft size={24} color={colors.foreground} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={2}>
            {series?.name || t('series.series_fallback')}
          </Text>
          <Pressable style={styles.favoriteButton} onPress={handleFavorite} hitSlop={8}>
            <Heart
              size={20}
              color={series?.isFavorite ? colors.error : colors.foreground}
              fill={series?.isFavorite ? colors.error : 'transparent'}
            />
          </Pressable>
        </View>

        {/* Video Player */}
        {isActive ? (
          <VideoPlayer
            uri={displayStreamUrl}
            title={displayName}
            onBack={handleBack}
          />
        ) : (
          <View style={{ width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000' }} />
        )}

        <View style={styles.info}>
          {/* Episode Info */}
          <Text style={styles.episodeLabel}>
            S{displaySeason.padStart(2, '0')}E{displayEpisodeNumber.padStart(2, '0')}
          </Text>
          <Text style={styles.title}>{displayName}</Text>
          {series?.name && (
            <Text style={styles.seriesName}>{series.name}</Text>
          )}

          <View style={styles.badges}>
            {episodeQuality && (
              <QualityBadge quality={episodeQuality} size="md" />
            )}
            <Badge variant="secondary" size="md">
              {t('series.episode_badge', { number: displayEpisodeNumber })}
            </Badge>
          </View>

          <MovieSynopsis info={episodeInfo} isLoading={loadingEpisodeInfo} />

          {/* Episode Navigation */}
          <View style={styles.navigation}>
            <Pressable
              style={[styles.navButton, !prevEpisode && styles.navButtonDisabled]}
              onPress={() => prevEpisode && navigateToEpisode(prevEpisode)}
              disabled={!prevEpisode}
            >
              <ChevronLeft size={20} color={colors.foreground} />
              <Text style={styles.navButtonText}>{t('series.prev_episode')}</Text>
            </Pressable>

            <Pressable
              style={[styles.navButton, styles.navButtonPrimary, !nextEpisode && styles.navButtonDisabled]}
              onPress={() => nextEpisode && navigateToEpisode(nextEpisode)}
              disabled={!nextEpisode}
            >
              <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>{t('series.next_episode')}</Text>
              <ChevronRight size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        <View style={{ height: spacing.xl * 2 }} />
      </ScrollView>
    </View>
  );
}
