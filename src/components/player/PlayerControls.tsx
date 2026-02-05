import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Maximize2,
  Minimize2,
  ChevronLeft,
  Volume2,
  Settings,
} from 'lucide-react-native';
import { useColors, spacing, borderRadius, typography } from '@/theme';
import Slider from '@react-native-community/slider';

interface PlayerControlsProps {
  isPlaying: boolean;
  position: number;
  duration: number;
  buffered: number;
  title?: string;
  isFullscreen?: boolean;
  onPlayPause: () => void;
  onSeek: (value: number) => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  onFullscreenToggle?: () => void;
  onBack?: () => void;
}

export function PlayerControls({
  isPlaying,
  position,
  duration,
  buffered,
  title,
  isFullscreen = false,
  onPlayPause,
  onSeek,
  onSkipBack,
  onSkipForward,
  onFullscreenToggle,
  onBack,
}: PlayerControlsProps) {
  const colors = useColors();

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const styles = StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      justifyContent: 'space-between',
      zIndex: 10,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingTop: isFullscreen ? spacing.xl : spacing.md,
      zIndex: 20,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    title: {
      ...typography.body,
      color: colors.foreground,
      fontWeight: '600',
      flex: 1,
      marginHorizontal: spacing.md,
      textAlign: 'center',
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: { width: -1, height: 1 },
      textShadowRadius: 10,
    },
    topActions: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    centerControls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xl,
    },
    playButton: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    skipButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    bottomBar: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.md,
    },
    progressContainer: {
      marginBottom: spacing.sm,
    },
    slider: {
      width: '100%',
      height: 40,
    },
    timeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    timeText: {
      ...typography.small,
      color: colors.foreground,
    },
    bottomActions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
  });

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        {onBack ? (
          <Pressable style={styles.backButton} onPress={onBack}>
            <ChevronLeft size={24} color={colors.foreground} />
          </Pressable>
        ) : (
          <View style={{ width: 40 }} />
        )}

        {title && (
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        )}

        <View style={styles.topActions}>
          <Pressable style={styles.iconButton}>
            <Settings size={20} color={colors.foreground} />
          </Pressable>
        </View>
      </View>

      {/* Center Controls */}
      <View style={styles.centerControls}>
        <Pressable style={styles.skipButton} onPress={onSkipBack}>
          <SkipBack size={24} color={colors.foreground} />
        </Pressable>

        <Pressable style={styles.playButton} onPress={onPlayPause}>
          {isPlaying ? (
            <Pause size={32} color={colors.foreground} />
          ) : (
            <Play size={32} color={colors.foreground} fill={colors.foreground} />
          )}
        </Pressable>

        <Pressable style={styles.skipButton} onPress={onSkipForward}>
          <SkipForward size={24} color={colors.foreground} />
        </Pressable>
      </View>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.progressContainer}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration}
            value={position}
            onSlidingComplete={onSeek}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.muted}
            thumbTintColor={colors.primary}
          />
        </View>

        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>

        <View style={styles.bottomActions}>
          <Pressable style={styles.iconButton}>
            <Volume2 size={20} color={colors.foreground} />
          </Pressable>

          {onFullscreenToggle && (
            <Pressable style={styles.iconButton} onPress={onFullscreenToggle}>
              {isFullscreen ? (
                <Minimize2 size={20} color={colors.foreground} />
              ) : (
                <Maximize2 size={20} color={colors.foreground} />
              )}
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}
