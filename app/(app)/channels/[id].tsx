import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import {
  Heart,
  ChevronLeft,
  AlertCircle,
  Tv,
  Film,
} from 'lucide-react-native';
import { useColors, spacing, borderRadius, typography } from '@/theme';
import { ScreenContainer } from '@/components/layout';
import { VideoPlayer } from '@/components/player';
import { QualityBadge, Badge, Button, Loading, EmptyState } from '@/components/ui';
import { HorizontalList } from '@/components/content';
import { useChannel, useChannels, useMarkAsWatched, useToggleFavorite } from '@/hooks';
import { useFloatingPlayer } from '@/contexts';
import type { Channel } from '@/types';

export default function ChannelScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { setChannel: setFloatingChannel, minimize, stop: stopFloatingPlayer, maximize } = useFloatingPlayer();
  const [isActive, setIsActive] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setIsActive(true);
      return () => {
        setIsActive(false);
        setFloatingChannel(null);
      };
    }, [setFloatingChannel])
  );

  const {
    data: channel,
    isLoading,
    error,
  } = useChannel(id || '');

  const markAsWatched = useMarkAsWatched();
  const toggleFavorite = useToggleFavorite();

  const {
    data: relatedChannels,
    isLoading: loadingRelated,
  } = useChannels({
    type: channel?.type,
    category: channel?.category,
    limit: 10,
  });

  // Close floating player when opening a new full player
  useEffect(() => {
    stopFloatingPlayer();
    maximize();
  }, [id, stopFloatingPlayer, maximize]);

  useEffect(() => {
    if (id) {
      markAsWatched.mutate(id);
    }
  }, [id]);

  const handleBack = useCallback(() => {
    // Stop floating player to ensure no background playback
    setFloatingChannel(null);
    router.back();
  }, [setFloatingChannel, router]);

  const handleFavorite = useCallback(() => {
    if (id) {
      toggleFavorite.mutate(id);
    }
  }, [id, toggleFavorite]);

  const handleRelatedPress = useCallback((item: Channel) => {
    router.push(`/channels/${item.id}` as any);
  }, [router]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing.md,
      paddingTop: spacing.xl,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerActions: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    content: {
      flex: 1,
    },
    info: {
      padding: spacing.lg,
    },
    titleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    title: {
      ...typography.title,
      color: colors.foreground,
      flex: 1,
      marginRight: spacing.md,
    },
    badges: {
      flexDirection: 'row',
      gap: spacing.xs,
      marginBottom: spacing.md,
    },
    category: {
      ...typography.body,
      color: colors.mutedForeground,
      marginBottom: spacing.sm,
    },
    description: {
      ...typography.body,
      color: colors.mutedForeground,
      lineHeight: 22,
    },
    actions: {
      flexDirection: 'row',
      gap: spacing.md,
      marginBottom: spacing.md,
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
    relatedSection: {
      marginTop: spacing.lg,
    },
    relatedTitle: {
      ...typography.header,
      color: colors.foreground,
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.md,
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

  if (error || !channel) {
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
            title="Canal não encontrado"
            description="O canal que você está procurando não existe ou foi removido."
            actionLabel="Voltar"
            onAction={handleBack}
          />
        </View>
      </View>
    );
  }

  const filteredRelated = relatedChannels?.items
    ?.filter((c) => c.id !== channel.id)
    .slice(0, 10);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header with Title and Back Button */}
        <View style={{
          padding: spacing.md,
          paddingTop: spacing.xl + spacing.sm,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm
        }}>
          <Pressable onPress={handleBack} hitSlop={16}>
            <ChevronLeft size={28} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.title, { marginBottom: 0, flex: 1 }]} numberOfLines={2}>
            {channel.name}
          </Text>
        </View>

        {/* Video Player */}
        {isActive ? (
          <VideoPlayer
            uri={channel.streamUrl}
            title={channel.name}
            poster={channel.logo || undefined}
            onBack={handleBack}
          />
        ) : (
          <View style={{ width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000' }} />
        )}

        <View style={styles.info}>
          {/* Title row removed from here */}

          <View style={styles.badges}>
            {channel.type === 'LIVE' && (
              <Badge variant="error" size="md">
                AO VIVO
              </Badge>
            )}
            {channel.type === 'MOVIE' && (
              <Badge variant="default" size="md">
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Film size={12} color={colors.foreground} />
                  <Text style={{ color: colors.foreground, fontSize: 12 }}>Filme</Text>
                </View>
              </Badge>
            )}
            {channel.quality && (
              <QualityBadge quality={channel.quality} size="md" />
            )}
          </View>

          <View style={styles.actions}>
            <Pressable
              style={[
                styles.actionButton,
                channel.isFavorite ? styles.actionButtonActive : undefined,
              ]}
              onPress={handleFavorite}
            >
              <Heart
                size={20}
                color={channel.isFavorite ? colors.error : colors.foreground}
                fill={channel.isFavorite ? colors.error : 'transparent'}
              />
              <Text style={styles.actionText}>
                {channel.isFavorite ? 'Favoritado' : 'Favoritar'}
              </Text>
            </Pressable>

          </View>

          {channel.category && (
            <Text style={styles.category}>{channel.category}</Text>
          )}

          {channel.description && (
            <Text style={styles.description}>{channel.description}</Text>
          )}


        </View>

        {/* Related Content */}
        {filteredRelated && filteredRelated.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.relatedTitle}>Conteúdo Relacionado</Text>
            <HorizontalList
              data={filteredRelated}
              type="channel"
              isLoading={loadingRelated}
              onItemPress={handleRelatedPress}
            />
          </View>
        )}

        <View style={{ height: spacing.xl * 2 }} />
      </ScrollView>
    </View>
  );
}
