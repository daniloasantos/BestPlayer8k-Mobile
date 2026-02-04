import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Heart,
  Share2,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Play,
  Star,
  Calendar,
  Tv2,
} from 'lucide-react-native';
import { useColors, spacing, borderRadius, typography } from '@/theme';
import { QualityBadge, Badge, Loading, EmptyState, Card } from '@/components/ui';
import { useChannel, useToggleFavorite } from '@/hooks';
import type { Season, Episode } from '@/types';

export default function SeriesScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [expandedSeason, setExpandedSeason] = useState<string | null>(null);

  const {
    data: series,
    isLoading,
    error,
  } = useChannel(id || '');

  const toggleFavorite = useToggleFavorite();

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleFavorite = useCallback(() => {
    if (id) {
      toggleFavorite.mutate(id);
    }
  }, [id, toggleFavorite]);

  const handleEpisodePress = useCallback((episode: Episode) => {
    router.push(`/channels/${episode.id}` as any);
  }, [router]);

  const toggleSeason = useCallback((seasonId: string) => {
    setExpandedSeason((prev) => (prev === seasonId ? null : seasonId));
  }, []);

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
      width: 40,
      height: 40,
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
    },
    episodeDuration: {
      ...typography.small,
      color: colors.mutedForeground,
    },
    playButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
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
            title="Série não encontrada"
            description="A série que você está procurando não existe ou foi removida."
            actionLabel="Voltar"
            onAction={handleBack}
          />
        </View>
      </View>
    );
  }

  const mockSeasons: Season[] = [
    {
      id: '1',
      number: 1,
      name: 'Temporada 1',
      episodes: [
        { id: 'e1', number: 1, name: 'Episódio 1', duration: 45, streamUrl: '' },
        { id: 'e2', number: 2, name: 'Episódio 2', duration: 42, streamUrl: '' },
        { id: 'e3', number: 3, name: 'Episódio 3', duration: 48, streamUrl: '' },
      ],
    },
    {
      id: '2',
      number: 2,
      name: 'Temporada 2',
      episodes: [
        { id: 'e4', number: 1, name: 'Episódio 1', duration: 50, streamUrl: '' },
        { id: 'e5', number: 2, name: 'Episódio 2', duration: 47, streamUrl: '' },
      ],
    },
  ];

  const seasons = (series as any).seasons || mockSeasons;

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
          <View style={styles.posterPlaceholder}>
            <Tv2 size={48} color={colors.mutedForeground} />
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{series.name}</Text>

          <View style={styles.metaRow}>
            {(series as any).rating && (
              <View style={styles.metaItem}>
                <Star size={14} color={colors.accent} fill={colors.accent} />
                <Text style={styles.ratingText}>
                  {(series as any).rating.toFixed(1)}
                </Text>
              </View>
            )}
            {(series as any).year && (
              <View style={styles.metaItem}>
                <Calendar size={14} color={colors.mutedForeground} />
                <Text style={styles.metaText}>{(series as any).year}</Text>
              </View>
            )}
            {seasons.length > 0 && (
              <View style={styles.metaItem}>
                <Tv2 size={14} color={colors.mutedForeground} />
                <Text style={styles.metaText}>
                  {seasons.length} Temporada{seasons.length !== 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.badges}>
            {(series as any).quality && (
              <QualityBadge quality={(series as any).quality} size="md" />
            )}
            {(series as any).genre && (
              <Badge variant="secondary" size="md">
                {(series as any).genre}
              </Badge>
            )}
          </View>

          {series.description && (
            <Text style={styles.description}>{series.description}</Text>
          )}

          <View style={styles.actions}>
            <Pressable
              style={[
                styles.actionButton,
                series.isFavorite ? styles.actionButtonActive : undefined,
              ]}
              onPress={handleFavorite}
            >
              <Heart
                size={20}
                color={series.isFavorite ? colors.error : colors.foreground}
                fill={series.isFavorite ? colors.error : 'transparent'}
              />
              <Text style={styles.actionText}>
                {series.isFavorite ? 'Favoritado' : 'Favoritar'}
              </Text>
            </Pressable>

            <Pressable style={styles.actionButton}>
              <Share2 size={20} color={colors.foreground} />
              <Text style={styles.actionText}>Compartilhar</Text>
            </Pressable>
          </View>

          <View style={styles.seasonsSection}>
            <Text style={styles.sectionTitle}>Temporadas</Text>

            {seasons.map((season: Season) => (
              <Card key={season.id} style={styles.seasonCard}>
                <Pressable
                  style={styles.seasonHeader}
                  onPress={() => toggleSeason(season.id)}
                >
                  <View style={styles.seasonInfo}>
                    <Text style={styles.seasonTitle}>
                      {season.name || `Temporada ${season.number}`}
                    </Text>
                    <Text style={styles.seasonEpisodes}>
                      {season.episodes?.length || 0} episódios
                    </Text>
                  </View>
                  {expandedSeason === season.id ? (
                    <ChevronUp size={20} color={colors.mutedForeground} />
                  ) : (
                    <ChevronDown size={20} color={colors.mutedForeground} />
                  )}
                </Pressable>

                {expandedSeason === season.id && season.episodes && (
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
                          <Text style={styles.episodeName}>
                            {episode.name || `Episódio ${episode.number}`}
                          </Text>
                          {episode.duration && (
                            <Text style={styles.episodeDuration}>
                              {episode.duration} min
                            </Text>
                          )}
                        </View>
                        <View style={styles.playButton}>
                          <Play
                            size={16}
                            color={colors.foreground}
                            fill={colors.foreground}
                          />
                        </View>
                      </Pressable>
                    ))}
                  </View>
                )}
              </Card>
            ))}
          </View>
        </View>

        <View style={{ height: spacing.xl * 2 }} />
      </ScrollView>
    </View>
  );
}
