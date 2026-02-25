import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { useColors, spacing, borderRadius, typography } from '@/theme';
import { QualityBadge } from '@/components/ui';
import type { Channel } from '@/types';

interface ChannelCardProps {
  channel: Channel;
  onPress?: () => void;
  onFavoritePress?: () => void;
  showFavorite?: boolean;
  compact?: boolean;
  width?: number;
}

export function ChannelCard({
  channel,
  onPress,
  onFavoritePress,
  showFavorite = true,
  compact = false,
  width,
}: ChannelCardProps) {
  const colors = useColors();
  const router = useRouter();
  const [isFav, setIsFav] = useState(channel.isFavorite);
  const [imageError, setImageError] = useState(false);
  useEffect(() => { setIsFav(channel.isFavorite); }, [channel.isFavorite]);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/channels/${channel.id}` as any);
    }
  };

  // Gera cor baseada no nome do canal
  const getInitialColor = (name: string) => {
    const colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#6366F1'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
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
      aspectRatio: compact ? 4 / 3 : 16 / 9,
      backgroundColor: colors.muted,
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
      padding: compact ? spacing.sm : spacing.md,
    },
    image: {
      width: '100%',
      height: '100%',
      maxHeight: compact ? 50 : 80,
    },
    imagePlaceholder: {
      width: compact ? 40 : 56,
      height: compact ? 40 : 56,
      borderRadius: compact ? 20 : 28,
      backgroundColor: getInitialColor(channel.name),
      alignItems: 'center',
      justifyContent: 'center',
    },
    initialText: {
      fontSize: compact ? 18 : 24,
      fontWeight: '800',
      color: '#fff',
    },
    qualityBadge: {
      position: 'absolute',
      top: spacing.xs,
      left: spacing.xs,
    },
    favoriteButton: {
      position: 'absolute',
      top: spacing.xs,
      right: spacing.xs,
      width: compact ? 26 : 32,
      height: compact ? 26 : 32,
      borderRadius: borderRadius.md,
      backgroundColor: isFav ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0, 0, 0, 0.4)',
      borderWidth: 1,
      borderColor: isFav ? 'rgba(239, 68, 68, 0.3)' : 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
      elevation: 5,
    },
    content: {
      padding: spacing.sm,
      paddingTop: spacing.xs,
      minHeight: compact ? 52 : 60,
    },
    name: {
      ...typography.body,
      fontSize: compact ? 11 : 14,
      color: colors.foreground,
      fontWeight: '700',
      letterSpacing: -0.2,
      lineHeight: compact ? 14 : 18,
    },
    categoryText: {
      fontSize: compact ? 9 : 10,
      fontWeight: '600',
      color: colors.mutedForeground,
      textTransform: 'uppercase',
      letterSpacing: 0.3,
      marginTop: 3,
    },
  });

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
        {channel.logo && !imageError ? (
          <Image
            source={{ uri: channel.logo }}
            style={styles.image}
            resizeMode="contain"
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.initialText}>
              {channel.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <View style={styles.qualityBadge}>
          {channel.quality && (
            <QualityBadge quality={channel.quality} size="sm" />
          )}
        </View>

        {showFavorite && (
          <Pressable
            style={styles.favoriteButton}
            onPress={(e) => {
              e.stopPropagation?.();
              setIsFav(!isFav);
              onFavoritePress?.();
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Heart
              size={compact ? 12 : 16}
              color={isFav ? '#EF4444' : colors.foreground}
              fill={isFav ? '#EF4444' : 'transparent'}
            />
          </Pressable>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {channel.name}
        </Text>
        {channel.category && (
          <Text style={styles.categoryText} numberOfLines={1}>
            {channel.category}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
