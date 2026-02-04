import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  StatusBar,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { useColors, spacing } from '@/theme';
import { PlayerControls } from './PlayerControls';
import { PlayerError } from './PlayerError';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface VideoPlayerProps {
  uri: string;
  title?: string;
  poster?: string;
  autoPlay?: boolean;
  isFullscreen?: boolean;
  onFullscreenToggle?: () => void;
  onBack?: () => void;
  onError?: (error: string) => void;
}

export function VideoPlayer({
  uri,
  title,
  poster,
  autoPlay = true,
  isFullscreen = false,
  onFullscreenToggle,
  onBack,
  onError,
}: VideoPlayerProps) {
  const colors = useColors();
  const videoRef = useRef<Video>(null);

  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isPlaying = status?.isLoaded ? status.isPlaying : false;
  const position = status?.isLoaded ? status.positionMillis : 0;
  const duration = status?.isLoaded ? status.durationMillis || 0 : 0;
  const buffered = status?.isLoaded ? status.playableDurationMillis || 0 : 0;

  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

  const styles = StyleSheet.create({
    container: {
      width: isFullscreen ? SCREEN_HEIGHT : SCREEN_WIDTH,
      height: isFullscreen ? SCREEN_WIDTH : SCREEN_WIDTH * (9 / 16),
      backgroundColor: '#000',
      position: 'relative',
    },
    video: {
      width: '100%',
      height: '100%',
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingContainer: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    touchArea: {
      ...StyleSheet.absoluteFillObject,
    },
  });

  useEffect(() => {
    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, []);

  const hideControlsAfterDelay = useCallback(() => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }

    if (isPlaying) {
      controlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  const handleTouchScreen = () => {
    setShowControls((prev) => !prev);
    if (!showControls) {
      hideControlsAfterDelay();
    }
  };

  const handlePlayPause = async () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
      hideControlsAfterDelay();
    }
  };

  const handleSeek = async (value: number) => {
    if (!videoRef.current) return;
    await videoRef.current.setPositionAsync(value);
  };

  const handleSkipBack = async () => {
    if (!videoRef.current) return;
    const newPosition = Math.max(0, position - 10000);
    await videoRef.current.setPositionAsync(newPosition);
  };

  const handleSkipForward = async () => {
    if (!videoRef.current) return;
    const newPosition = Math.min(duration, position + 10000);
    await videoRef.current.setPositionAsync(newPosition);
  };

  const handlePlaybackStatusUpdate = (playbackStatus: AVPlaybackStatus) => {
    setStatus(playbackStatus);

    if (playbackStatus.isLoaded) {
      setIsLoading(false);
      setError(null);

      if (playbackStatus.didJustFinish) {
        setShowControls(true);
      }
    } else if (playbackStatus.error) {
      setError(playbackStatus.error);
      setIsLoading(false);
      onError?.(playbackStatus.error);
    }
  };

  const handleRetry = async () => {
    setError(null);
    setIsLoading(true);
    if (videoRef.current) {
      await videoRef.current.unloadAsync();
      await videoRef.current.loadAsync(
        { uri },
        { shouldPlay: autoPlay },
        false
      );
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <PlayerError
          message={error}
          onRetry={handleRetry}
          onBack={onBack}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden={isFullscreen} />

      <Video
        ref={videoRef}
        style={styles.video}
        source={{ uri }}
        posterSource={poster ? { uri: poster } : undefined}
        usePoster={!!poster}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay={autoPlay}
        isLooping={false}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        onLoadStart={() => setIsLoading(true)}
        onLoad={() => setIsLoading(false)}
      />

      <Pressable style={styles.touchArea} onPress={handleTouchScreen}>
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}

        {showControls && !isLoading && (
          <PlayerControls
            isPlaying={isPlaying}
            position={position}
            duration={duration}
            buffered={buffered}
            title={title}
            isFullscreen={isFullscreen}
            onPlayPause={handlePlayPause}
            onSeek={handleSeek}
            onSkipBack={handleSkipBack}
            onSkipForward={handleSkipForward}
            onFullscreenToggle={onFullscreenToggle}
            onBack={onBack}
          />
        )}
      </Pressable>
    </View>
  );
}
