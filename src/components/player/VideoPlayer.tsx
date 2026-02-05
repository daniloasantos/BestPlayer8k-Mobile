import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as NavigationBar from 'expo-navigation-bar';
import { useColors } from '@/theme';
import { useFullscreen } from '@/contexts';
import { PlayerControls } from './PlayerControls';
import { PlayerError } from './PlayerError';

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
  isFullscreen: externalFullscreen,
  onFullscreenToggle,
  onBack,
  onError,
}: VideoPlayerProps) {
  const colors = useColors();
  const videoRef = useRef<Video>(null);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { setFullscreen: setGlobalFullscreen } = useFullscreen();

  const [internalFullscreen, setInternalFullscreen] = useState(false);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use external fullscreen state if provided, otherwise use internal
  const isFullscreen = externalFullscreen !== undefined ? externalFullscreen : internalFullscreen;

  const isPlaying = status?.isLoaded ? status.isPlaying : false;
  const position = status?.isLoaded ? status.positionMillis : 0;
  const duration = status?.isLoaded ? status.durationMillis || 0 : 0;
  const buffered = status?.isLoaded ? status.playableDurationMillis || 0 : 0;

  const controlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Calculate player dimensions based on screen
  const playerHeight = isFullscreen ? windowHeight : Math.floor(windowWidth * (9 / 16));

  const styles = StyleSheet.create({
    container: {
      width: windowWidth,
      height: playerHeight,
      backgroundColor: '#000',
      position: isFullscreen ? 'absolute' : 'relative',
      top: isFullscreen ? 0 : undefined,
      left: isFullscreen ? 0 : undefined,
      right: isFullscreen ? 0 : undefined,
      bottom: isFullscreen ? 0 : undefined,
      zIndex: isFullscreen ? 1000 : 1,
      overflow: 'hidden',
    },
    video: {
      width: windowWidth,
      height: playerHeight,
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

  // Handle orientation changes and system bars for fullscreen
  useEffect(() => {
    const handleFullscreenOrientation = async () => {
      try {
        if (isFullscreen) {
          await ScreenOrientation.lockAsync(
            ScreenOrientation.OrientationLock.LANDSCAPE
          );
          StatusBar.setHidden(true);
          await NavigationBar.setVisibilityAsync('hidden');
          await NavigationBar.setBehaviorAsync('overlay-swipe');
        } else {
          await ScreenOrientation.lockAsync(
            ScreenOrientation.OrientationLock.PORTRAIT_UP
          );
          StatusBar.setHidden(false);
          // Manter immersive ou restaurar conforme app.json, aqui garantimos hidden por padrão do app
          await NavigationBar.setVisibilityAsync('hidden');
        }
      } catch (error) {
        console.error('Error changing orientation:', error);
      }
    };
    handleFullscreenOrientation();

    return () => {
      // Reset to portrait when component unmounts
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      ).catch(() => { });
      StatusBar.setHidden(false);
      NavigationBar.setVisibilityAsync('visible').catch(() => { });
      NavigationBar.setBehaviorAsync('inset-swipe').catch(() => { });
    };
  }, [isFullscreen]);

  // Sync fullscreen state with global context
  useEffect(() => {
    setGlobalFullscreen(isFullscreen);
    return () => {
      setGlobalFullscreen(false);
    };
  }, [isFullscreen, setGlobalFullscreen]);

  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.unloadAsync().catch(() => { });
      }
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, []);

  // Auto-hide controls effect
  useEffect(() => {
    if (showControls && isPlaying) {
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
      controlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 4000);
    } else {
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    }
  }, [showControls, isPlaying]);

  const handleTouchScreen = () => {
    setShowControls((prev) => !prev);
  };

  const handlePlayPause = async () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
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

  const handleFullscreenToggle = useCallback(async () => {
    if (onFullscreenToggle) {
      onFullscreenToggle();
    } else {
      setInternalFullscreen((prev) => !prev);
    }
  }, [onFullscreenToggle]);

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

  const handleBack = useCallback(() => {
    if (isFullscreen) {
      handleFullscreenToggle();
    } else {
      onBack?.();
    }
  }, [isFullscreen, handleFullscreenToggle, onBack]);

  if (error) {
    return (
      <View style={styles.container}>
        <PlayerError
          message={error}
          onRetry={handleRetry}
          onBack={handleBack}
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
            onFullscreenToggle={handleFullscreenToggle}
            onBack={handleBack}
          />
        )}
      </Pressable>
    </View>
  );
}
