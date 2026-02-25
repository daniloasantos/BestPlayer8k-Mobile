import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
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
  autoPlay = true,
  isFullscreen: externalFullscreen,
  onFullscreenToggle,
  onBack,
  onError,
}: VideoPlayerProps) {
  const colors = useColors();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { setFullscreen: setGlobalFullscreen } = useFullscreen();

  const [internalFullscreen, setInternalFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [bufferedMs, setBufferedMs] = useState(0);

  // Use external fullscreen state if provided, otherwise use internal
  const isFullscreen = externalFullscreen !== undefined ? externalFullscreen : internalFullscreen;

  const controlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Calculate player dimensions based on screen
  const playerHeight = isFullscreen ? windowHeight : Math.floor(windowWidth * (9 / 16));

  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
    if (autoPlay) p.play();
  });

  // Subscribe to player events
  useEffect(() => {
    const playingSub = player.addListener('playingChange', ({ isPlaying: playing }) => {
      setIsPlaying(playing);
    });

    const statusSub = player.addListener('statusChange', ({ status }) => {
      if (status === 'loading') {
        setIsLoading(true);
      } else if (status === 'readyToPlay') {
        setIsLoading(false);
        setError(null);
        setDurationMs(Math.round((player.duration ?? 0) * 1000));
      } else if (status === 'error') {
        const errMsg = player.error?.message || 'Erro ao reproduzir vídeo';
        setError(errMsg);
        setIsLoading(false);
        onError?.(errMsg);
      }
    });

    const timeSub = player.addListener('timeUpdate', ({ currentTime, bufferedPosition }) => {
      setPositionMs(Math.round(currentTime * 1000));
      setBufferedMs(Math.round((bufferedPosition ?? 0) * 1000));
    });

    const endSub = player.addListener('playToEnd', () => {
      setShowControls(true);
    });

    return () => {
      playingSub.remove();
      statusSub.remove();
      timeSub.remove();
      endSub.remove();
    };
  }, [player]);

  // Cleanup on unmount — player is released automatically by useVideoPlayer
  useEffect(() => {
    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, []);

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
        } else {
          await ScreenOrientation.lockAsync(
            ScreenOrientation.OrientationLock.PORTRAIT_UP
          );
          StatusBar.setHidden(false);
          await NavigationBar.setVisibilityAsync('hidden');
        }
      } catch (err) {
        console.error('Error changing orientation:', err);
      }
    };
    handleFullscreenOrientation();

    return () => {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      ).catch(() => { });
      StatusBar.setHidden(false);
      NavigationBar.setVisibilityAsync('visible').catch(() => { });
    };
  }, [isFullscreen]);

  // Sync fullscreen state with global context
  useEffect(() => {
    setGlobalFullscreen(isFullscreen);
    return () => {
      setGlobalFullscreen(false);
    };
  }, [isFullscreen, setGlobalFullscreen]);

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

  const handlePlayPause = () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  const handleSeek = (valueMs: number) => {
    player.currentTime = valueMs / 1000;
  };

  const handleSkipBack = () => {
    player.seekBy(-10);
  };

  const handleSkipForward = () => {
    player.seekBy(10);
  };

  const handleFullscreenToggle = useCallback(() => {
    if (onFullscreenToggle) {
      onFullscreenToggle();
    } else {
      setInternalFullscreen((prev) => !prev);
    }
  }, [onFullscreenToggle]);

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    player.replace({ uri });
    if (autoPlay) player.play();
  };

  const handleBack = useCallback(() => {
    if (isFullscreen) {
      handleFullscreenToggle();
    } else {
      onBack?.();
    }
  }, [isFullscreen, handleFullscreenToggle, onBack]);

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

      <VideoView
        player={player}
        style={styles.video}
        contentFit="contain"
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
            position={positionMs}
            duration={durationMs}
            buffered={bufferedMs}
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
