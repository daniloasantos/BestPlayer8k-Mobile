import React, { useState } from 'react';
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
  VolumeX,
  Settings,
  Gauge,
} from 'lucide-react-native';
import { useColors, spacing, borderRadius, typography } from '@/theme';
import Slider from '@react-native-community/slider';

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

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
  isMuted?: boolean;
  onMuteToggle?: () => void;
  playbackRate?: number;
  onPlaybackRateChange?: (rate: number) => void;
  onToggleVisibility?: () => void;
  onSeekStart?: () => void;
  onSeekEnd?: () => void;
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
  isMuted = false,
  onMuteToggle,
  playbackRate = 1,
  onPlaybackRateChange,
  onToggleVisibility,
  onSeekStart,
  onSeekEnd,
}: PlayerControlsProps) {
  const colors = useColors();
  // Player overlay is always dark (black video bg) — use fixed white for all controls
  const PLAYER_FG = '#ffffff';

  const [showSettings, setShowSettings] = useState(false);
  // Local position while scrubbing — prevents timeUpdate from overriding the thumb during drag
  const [seekingPosition, setSeekingPosition] = useState<number | null>(null);
  const displayedPosition = seekingPosition ?? position;

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

  // In portrait (non-fullscreen) the player container is only ~219px tall on a 390px wide phone.
  // Use compact sizing to ensure controls never overflow the container.
  const compact = !isFullscreen;
  const btnSize = compact ? 34 : 40;
  const btnRadius = btnSize / 2;
  const playSize = compact ? 52 : 64;
  const playRadius = playSize / 2;
  const skipSize = compact ? 40 : 48;
  const skipRadius = skipSize / 2;
  const iconSm = compact ? 16 : 20;
  const iconMd = compact ? 20 : 24;
  const iconLg = compact ? 26 : 32;

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
      paddingTop: isFullscreen ? spacing.xl : spacing.xs,
      zIndex: 20,
    },
    backButton: {
      width: btnSize,
      height: btnSize,
      borderRadius: btnRadius,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    title: {
      ...typography.body,
      color: PLAYER_FG,
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
      width: btnSize,
      height: btnSize,
      borderRadius: btnRadius,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    iconButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    centerControls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xl,
    },
    playButton: {
      width: playSize,
      height: playSize,
      borderRadius: playRadius,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    skipButton: {
      width: skipSize,
      height: skipSize,
      borderRadius: skipRadius,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    bottomBar: {
      paddingHorizontal: spacing.md,
      paddingBottom: compact ? spacing.xs : spacing.md,
    },
    progressContainer: {
      marginBottom: compact ? 2 : spacing.sm,
    },
    slider: {
      width: '100%',
      height: compact ? 32 : 40,
    },
    timeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    timeText: {
      ...typography.small,
      color: PLAYER_FG,
    },
    bottomActions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: spacing.sm,
      marginTop: compact ? 2 : spacing.xs,
    },
    // Settings panel
    settingsPanel: {
      position: 'absolute',
      top: isFullscreen ? spacing.xl + 48 : spacing.md + 48,
      right: spacing.md,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.15)',
      overflow: 'hidden',
      zIndex: 30,
      minWidth: 160,
    },
    settingsSectionTitle: {
      ...typography.small,
      color: 'rgba(255,255,255,0.5)',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
      paddingBottom: spacing.xs,
    },
    speedRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
      paddingHorizontal: spacing.sm,
      paddingBottom: spacing.sm,
    },
    speedButton: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.md,
      backgroundColor: 'rgba(255,255,255,0.1)',
    },
    speedButtonActive: {
      backgroundColor: colors.primary,
    },
    speedText: {
      ...typography.small,
      color: PLAYER_FG,
      fontWeight: '500',
    },
    speedTextActive: {
      fontWeight: '700',
    },
  });

  return (
    <View style={styles.container}>
      {/* Background tap — hides controls; buttons rendered after capture their own taps */}
      <Pressable style={StyleSheet.absoluteFillObject} onPress={onToggleVisibility} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        {onBack ? (
          <Pressable style={styles.backButton} onPress={onBack}>
            <ChevronLeft size={iconMd} color={PLAYER_FG} />
          </Pressable>
        ) : (
          <View style={{ width: btnSize }} />
        )}

        {title && (
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        )}

        <View style={styles.topActions}>
          <Pressable
            style={[styles.iconButton, showSettings && styles.iconButtonActive]}
            onPress={() => setShowSettings(v => !v)}
          >
            <Settings size={iconSm} color={PLAYER_FG} />
          </Pressable>
        </View>
      </View>

      {/* Settings panel */}
      {showSettings && (
        <View style={styles.settingsPanel}>
          <Text style={styles.settingsSectionTitle}>
            <Gauge size={10} color="rgba(255,255,255,0.5)" /> Velocidade
          </Text>
          <View style={styles.speedRow}>
            {PLAYBACK_SPEEDS.map(speed => (
              <Pressable
                key={speed}
                style={[styles.speedButton, playbackRate === speed && styles.speedButtonActive]}
                onPress={() => {
                  onPlaybackRateChange?.(speed);
                  setShowSettings(false);
                }}
              >
                <Text style={[styles.speedText, playbackRate === speed && styles.speedTextActive]}>
                  {speed === 1 ? 'Normal' : `${speed}x`}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Center Controls */}
      <View style={styles.centerControls}>
        <Pressable style={styles.skipButton} onPress={onSkipBack}>
          <SkipBack size={iconMd} color={PLAYER_FG} />
        </Pressable>

        <Pressable style={styles.playButton} onPress={onPlayPause}>
          {isPlaying ? (
            <Pause size={iconLg} color={PLAYER_FG} />
          ) : (
            <Play size={iconLg} color={PLAYER_FG} fill={PLAYER_FG} />
          )}
        </Pressable>

        <Pressable style={styles.skipButton} onPress={onSkipForward}>
          <SkipForward size={iconMd} color={PLAYER_FG} />
        </Pressable>
      </View>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.progressContainer}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration > 0 ? duration : 1}
            value={displayedPosition}
            onValueChange={(v) => {
              if (seekingPosition === null) onSeekStart?.();
              setSeekingPosition(v);
            }}
            onSlidingComplete={(v) => {
              onSeek(v);
              setSeekingPosition(null);
              onSeekEnd?.();
            }}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.muted}
            thumbTintColor={colors.primary}
            disabled={duration === 0}
          />
        </View>

        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(displayedPosition)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>

        <View style={styles.bottomActions}>
          <Pressable style={styles.iconButton} onPress={onMuteToggle}>
            {isMuted ? (
              <VolumeX size={iconSm} color={PLAYER_FG} />
            ) : (
              <Volume2 size={iconSm} color={PLAYER_FG} />
            )}
          </Pressable>

          {onFullscreenToggle && (
            <Pressable style={styles.iconButton} onPress={onFullscreenToggle}>
              {isFullscreen ? (
                <Minimize2 size={iconSm} color={PLAYER_FG} />
              ) : (
                <Maximize2 size={iconSm} color={PLAYER_FG} />
              )}
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}
