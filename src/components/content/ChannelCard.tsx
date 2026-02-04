import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Play, Heart, Clock } from 'lucide-react-native';
import { useColors, spacing, borderRadius, typography } from '@/theme';
import { QualityBadge, Badge } from '@/components/ui';
import type { Channel } from '@/types';

interface ChannelCardProps {
  channel: Channel;
  onPress?: () => void;
  onFavoritePress?: () => void;
  showFavorite?: boolean;
  compact?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 3) / 2;

export function ChannelCard({
  channel,
  onPress,
  onFavoritePress,
  showFavorite = true,
  compact = false,
}: ChannelCardProps) {
  const colors = useColors();
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/channels/${channel.id}` as any);
    }
  };

  const styles = StyleSheet.create({
    container: {
      width: compact ? CARD_WIDTH : '100%',
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      overflow: 'hidden',
    },
    imageContainer: {
      width: '100%',
      aspectRatio: 16 / 9,
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
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0,
    },
    overlayVisible: {
      opacity: 1,
    },
    playButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badges: {
      position: 'absolute',
      top: spacing.xs,
      left: spacing.xs,
      flexDirection: 'row',
      gap: spacing.xs,
    },
    favoriteButton: {
      position: 'absolute',
      top: spacing.xs,
      right: spacing.xs,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      padding: compact ? spacing.sm : spacing.md,
    },
    name: {
      ...typography.body,
      color: colors.foreground,
      fontWeight: '600',
      marginBottom: spacing.xs,
    },
    nameCompact: {
      fontSize: 14,
    },
    category: {
      ...typography.label,
      color: colors.mutedForeground,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.sm,
    },
    watchedContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    watchedText: {
      ...typography.small,
      color: colors.mutedForeground,
    },
    liveIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    liveDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.error,
    },
    liveText: {
      ...typography.small,
      color: colors.error,
      fontWeight: '600',
    },
  });

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { opacity: pressed ? 0.8 : 1 },
      ]}
      onPress={handlePress}
    >
      <View style={styles.imageContainer}>
        {channel.logo ? (
          <Image
            source={{ uri: channel.logo }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Play size={compact ? 24 : 32} color={colors.mutedForeground} />
          </View>
        )}

        <View style={styles.badges}>
          {channel.type === 'LIVE' && (
            <Badge variant="error" size="sm">
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>AO VIVO</Text>
              </View>
            </Badge>
          )}
          {channel.quality && (
            <QualityBadge quality={channel.quality} size="sm" />
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
              color={channel.isFavorite ? colors.error : colors.foreground}
              fill={channel.isFavorite ? colors.error : 'transparent'}
            />
          </Pressable>
        )}
      </View>

      <View style={styles.content}>
        <Text
          style={[styles.name, compact ? styles.nameCompact : undefined]}
          numberOfLines={1}
        >
          {channel.name}
        </Text>
        {channel.category && (
          <Text style={styles.category} numberOfLines={1}>
            {channel.category}
          </Text>
        )}

        {channel.lastWatched && (
          <View style={styles.footer}>
            <View style={styles.watchedContainer}>
              <Clock size={12} color={colors.mutedForeground} />
              <Text style={styles.watchedText}>Assistido recentemente</Text>
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );
}
