import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image as RNImage } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Heart,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Play,
  Star,
  Calendar,
  Tv2,
  ListVideo,
} from 'lucide-react-native';
import { useColors, spacing, borderRadius, typography } from '@/theme';
import { QualityBadge, Badge, Loading, EmptyState, Card } from '@/components/ui';
import { MovieSynopsis } from '@/components/content';
import { useSeriesDetail, useToggleFavorite, useSeriesInfo } from '@/hooks';
import { useLanguage } from '@/contexts';
import type { Season, Episode } from '@/types';

export default function SeriesScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t } = useLanguage();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [expandedSeasons, setExpandedSeasons] = useState<Set<number>>(new Set([1]));

  const {
    data: series,
    isLoading,
    error,
  } = useSeriesDetail(id || '');

  const toggleFavorite = useToggleFavorite();
  const [isFav, setIsFav] = useState(false);
  useEffect(() => { setIsFav(series?.isFavorite ?? false); }, [series?.isFavorite]);

  const { data: seriesInfo, isLoading: loadingSeriesInfo } = useSeriesInfo(series?.name);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleFavorite = useCallback(() => {
    const channelId = series?.channelId || series?.id;
    if (channelId) {
      setIsFav(prev => !prev);
      toggleFavorite.mutate(channelId);
    }
  }, [series, toggleFavorite]);

  const handleEpisodePress = useCallback((episode: Episode) => {
    // Navigate to episode player
    router.push({
      pathname: '/series/[id]/watch/[episodeId]',
      params: {
        id: id || '',
        episodeId: episode.id,
        episodeName: episode.name || t('series.episode_fallback', { number: episode.number }),
        streamUrl: episode.streamUrl,
        season: episode.season?.toString() || '1',
        episodeNumber: episode.number?.toString() || '1',
      },
    } as any);
  }, [router, id]);

  const handlePlayFirst = useCallback(() => {
    const firstEpisode = series?.seasons?.[0]?.episodes?.[0];
    if (firstEpisode) {
      handleEpisodePress(firstEpisode);
    }
  }, [series, handleEpisodePress]);

  const toggleSeason = useCallback((seasonNumber: number) => {
    setExpandedSeasons((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(seasonNumber)) {
        newSet.delete(seasonNumber);
      } else {
        newSet.add(seasonNumber);
      }
      return newSet;
    });
  }, []);

  // Count total episodes
  const totalEpisodes = useMemo(() => {
    if (!series?.seasons) return 0;
    return series.seasons.reduce((acc, season) => acc + (season.episodes?.length || 0), 0);
  }, [series]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      paddingTop: spacing.xl,
      backgroundColor: colors.background,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.muted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      ...typography.header,
      color: colors.foreground,
      flex: 1,
      marginLeft: spacing.md,
    },
    posterContainer: {
      width: '100%',
      aspectRatio: 16 / 9,
      backgroundColor: colors.muted,
      overflow: 'hidden',
    },
    posterImage: {
      width: '100%',
      height: '100%',
    },
    posterPlaceholder: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      padding: spacing.lg,
    },
    title: {
      ...typography.title,
      color: colors.foreground,
      marginBottom: spacing.sm,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: spacing.md,
      marginBottom: spacing.md,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    metaText: {
      ...typography.label,
      color: colors.mutedForeground,
    },
    ratingText: {
      ...typography.label,
      color: colors.accent,
      fontWeight: '600',
    },
    badges: {
      flexDirection: 'row',
      gap: spacing.xs,
      marginBottom: spacing.md,
      flexWrap: 'wrap',
    },
    description: {
      ...typography.body,
      color: colors.mutedForeground,
      lineHeight: 22,
      marginBottom: spacing.lg,
    },
    actions: {
      flexDirection: 'row',
      gap: spacing.md,
      marginBottom: spacing.xl,
    },
    playButton: {
      flex: 2,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      padding: spacing.md,
      backgroundColor: colors.primary,
      borderRadius: borderRadius.lg,
    },
    playButtonText: {
      ...typography.label,
      color: '#FFFFFF',
      fontWeight: '700',
    },
    actionButton: {
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
    actionButtonActive: {
      backgroundColor: colors.error + '20',
      borderColor: colors.error,
    },
    actionText: {
      ...typography.label,
      color: colors.foreground,
      fontWeight: '600',
    },
    seasonsSection: {
      marginTop: spacing.md,
    },
    sectionTitle: {
      ...typography.header,
      color: colors.foreground,
      marginBottom: spacing.md,
    },
    seasonCard: {
      marginBottom: spacing.sm,
      padding: 0,
      overflow: 'hidden',
    },
    seasonHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.md,
    },
    seasonInfo: {
      flex: 1,
    },
    seasonTitle: {
      ...typography.body,
      color: colors.foreground,
      fontWeight: '600',
    },
    seasonEpisodes: {
      ...typography.label,
      color: colors.mutedForeground,
    },
    episodesList: {
      borderTopWidth: 1,
      borderTopColor: colors.cardBorder,
    },
    episodeItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.cardBorder,
    },
    episodeNumber: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.md,
      backgroundColor: colors.muted,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    episodeNumberText: {
      ...typography.label,
      color: colors.foreground,
      fontWeight: '600',
    },
    episodeInfo: {
      flex: 1,
    },
    episodeName: {
      ...typography.body,
      color: colors.foreground,
      marginBottom: 2,
    },
    episodeMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    episodeDuration: {
      ...typography.small,
      color: colors.mutedForeground,
    },
    episodePlayButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
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

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={handleBack}>
            <ChevronLeft size={24} color={colors.foreground} />
          </Pressable>
        </View>
        <View style={styles.loadingContainer}>
          <Loading />
        </View>
      </View>
    );
  }

  if (error || !series) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={handleBack}>
            <ChevronLeft size={24} color={colors.foreground} />
          </Pressable>
        </View>
        <View style={styles.errorContainer}>
          <EmptyState
            icon={AlertCircle}
            title={t('series.not_found')}
            description={t('series.not_found_desc')}
            actionLabel={t('common.back')}
            onAction={handleBack}
          />
        </View>
      </View>
    );
  }

  const seasons = series.seasons || [];
  const hasEpisodes = seasons.some(s => s.episodes && s.episodes.length > 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <ChevronLeft size={24} color={colors.foreground} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {series.name}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.posterContainer}>
          {series.poster || series.logo ? (
            <RNImage
              source={{ uri: series.poster || series.logo || '' }}
              style={styles.posterImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.posterPlaceholder}>
              <Tv2 size={48} color={colors.mutedForeground} />
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{series.name}</Text>

          <View style={styles.metaRow}>
            {series.rating && (
              <View style={styles.metaItem}>
                <Star size={14} color={colors.accent} fill={colors.accent} />
                <Text style={styles.ratingText}>
                  {series.rating.toFixed(1)}
                </Text>
              </View>
            )}
            {series.year && (
              <View style={styles.metaItem}>
                <Calendar size={14} color={colors.mutedForeground} />
                <Text style={styles.metaText}>{series.year}</Text>
              </View>
            )}
            {seasons.length > 0 && (
              <View style={styles.metaItem}>
                <Tv2 size={14} color={colors.mutedForeground} />
                <Text style={styles.metaText}>
                  {seasons.length} {seasons.length !== 1 ? t('series.season_plural') : t('series.season_singular')}
                </Text>
              </View>
            )}
            {totalEpisodes > 0 && (
              <View style={styles.metaItem}>
                <ListVideo size={14} color={colors.mutedForeground} />
                <Text style={styles.metaText}>
                  {totalEpisodes} {totalEpisodes !== 1 ? t('series.episode_plural') : t('series.episode_singular')}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.badges}>
            {series.quality && (
              <QualityBadge quality={series.quality} size="md" />
            )}
            {series.genre && (
              <Badge variant="secondary" size="md">
                {series.genre}
              </Badge>
            )}
            {series.category && (
              <Badge variant="secondary" size="md">
                {series.category}
              </Badge>
            )}
          </View>

          {series.description && (
            <Text style={styles.description}>{series.description}</Text>
          )}

          <MovieSynopsis info={seriesInfo} isLoading={loadingSeriesInfo} />

          <View style={styles.actions}>
            {hasEpisodes && (
              <Pressable style={styles.playButton} onPress={handlePlayFirst}>
                <Play size={20} color="#FFFFFF" fill="#FFFFFF" />
                <Text style={styles.playButtonText}>{t('series.watch_first')}</Text>
              </Pressable>
            )}

            <Pressable
              style={[
                styles.actionButton,
                isFav ? styles.actionButtonActive : undefined,
              ]}
              onPress={handleFavorite}
            >
              <Heart
                size={20}
                color={isFav ? colors.error : colors.foreground}
                fill={isFav ? colors.error : 'transparent'}
              />
            </Pressable>

          </View>

          {seasons.length > 0 && (
            <View style={styles.seasonsSection}>
              <Text style={styles.sectionTitle}>{t('series.seasons_section')}</Text>

              {seasons.map((season: Season) => (
                <Card key={season.id} style={styles.seasonCard}>
                  <Pressable
                    style={styles.seasonHeader}
                    onPress={() => toggleSeason(season.number)}
                  >
                    <View style={styles.seasonInfo}>
                      <Text style={styles.seasonTitle}>
                        {season.name || t('series.season_fallback', { number: season.number })}
                      </Text>
                      <Text style={styles.seasonEpisodes}>
                        {(() => {
                          const count = season.episodes?.length || 0;
                          return `${count} ${(count !== 1 ? t('series.episode_plural') : t('series.episode_singular')).toLowerCase()}`;
                        })()}
                      </Text>
                    </View>
                    {expandedSeasons.has(season.number) ? (
                      <ChevronUp size={20} color={colors.mutedForeground} />
                    ) : (
                      <ChevronDown size={20} color={colors.mutedForeground} />
                    )}
                  </Pressable>

                  {expandedSeasons.has(season.number) && season.episodes && (
                    <View style={styles.episodesList}>
                      {season.episodes.map((episode: Episode) => (
                        <Pressable
                          key={episode.id}
                          style={styles.episodeItem}
                          onPress={() => handleEpisodePress(episode)}
                        >
                          <View style={styles.episodeNumber}>
                            <Text style={styles.episodeNumberText}>
                              {episode.number}
                            </Text>
                          </View>
                          <View style={styles.episodeInfo}>
                            <Text style={styles.episodeName} numberOfLines={1}>
                              {episode.name || t('series.episode_fallback', { number: episode.number })}
                            </Text>
                            <View style={styles.episodeMeta}>
                              {episode.quality && (
                                <QualityBadge quality={episode.quality} size="sm" />
                              )}
                              {episode.duration && (
                                <Text style={styles.episodeDuration}>
                                  {episode.duration} min
                                </Text>
                              )}
                            </View>
                          </View>
                          <View style={styles.episodePlayButton}>
                            <Play
                              size={16}
                              color="#FFFFFF"
                              fill="#FFFFFF"
                            />
                          </View>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </Card>
              ))}
            </View>
          )}

          {!hasEpisodes && (
            <EmptyState
              icon={ListVideo}
              title={t('series.no_episodes_title')}
              description={t('series.no_episodes_desc')}
            />
          )}
        </View>

        <View style={{ height: spacing.xl * 2 }} />
      </ScrollView>
    </View>
  );
}
