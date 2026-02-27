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

const SPINNER_DELAY_MS = 400; // Only show spinner if loading takes longer than this
const AUTO_RETRY_DELAY_MS = 3_000; // Wait before auto-retrying on error
const MAX_AUTO_RETRIES = 1;

interface VideoPlayerProps {
  uri: string;
  title?: string;
  poster?: string;
  autoPlay?: boolean;
  isFullscreen?: boolean;
  onFullscreenToggle?: () => void;
  onBack?: () => void;
  onError?: (error: string) => void;
  onReady?: () => void;
}

export function VideoPlayer({
  uri,
  title,
  autoPlay = true,
  isFullscreen: externalFullscreen,
  onFullscreenToggle,
  onBack,
  onError,
  onReady,
}: VideoPlayerProps) {
  const colors = useColors();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { setFullscreen: setGlobalFullscreen } = useFullscreen();

  const [internalFullscreen, setInternalFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // Spinner is debounced: only shown after SPINNER_DELAY_MS of continuous loading
  const [showSpinner, setShowSpinner] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [bufferedMs, setBufferedMs] = useState(0);
  const [autoRetryCount, setAutoRetryCount] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);

  const isFullscreen = externalFullscreen !== undefined ? externalFullscreen : internalFullscreen;

  const controlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spinnerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const playerHeight = isFullscreen ? windowHeight : Math.floor(windowWidth * (9 / 16));

  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
    if (autoPlay) p.play();
  });

  const startSpinnerTimer = () => {
    if (spinnerTimerRef.current) clearTimeout(spinnerTimerRef.current);
    spinnerTimerRef.current = setTimeout(() => setShowSpinner(true), SPINNER_DELAY_MS);
  };

  const cancelSpinner = () => {
    if (spinnerTimerRef.current) clearTimeout(spinnerTimerRef.current);
    setShowSpinner(false);
  };

  // Subscribe to player events
  useEffect(() => {
    const playingSub = player.addListener('playingChange', ({ isPlaying: playing }) => {
      setIsPlaying(playing);
    });

    const statusSub = player.addListener('statusChange', ({ status }) => {
      if (status === 'loading') {
        setIsLoading(true);
        startSpinnerTimer();
      } else if (status === 'readyToPlay') {
        setIsLoading(false);
        setAutoRetryCount(0);
        cancelSpinner();
        setError(null);
        setDurationMs(Math.round((player.duration ?? 0) * 1000));
        onReady?.();
      } else if (status === 'error') {
        const errMsg = player.error?.message || 'Erro ao reproduzir vídeo';
        setError(errMsg);
        setIsLoading(false);
        cancelSpinner();
        onError?.(errMsg);
      }
    });

    const timeSub = player.addListener('timeUpdate', ({ currentTime, bufferedPosition }) => {
      setPositionMs(Math.round(currentTime * 1000));
      setBufferedMs(Math.round((bufferedPosition ?? 0) * 1000));
      // Duration may arrive late for HLS VOD streams — keep it in sync
      const dur = player.duration;
      if (dur && dur > 0) {
        setDurationMs(prev => {
          const next = Math.round(dur * 1000);
          return next !== prev ? next : prev;
        });
      }
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

  // Poll currentTime while playing for smooth real-time updates (timeUpdate interval may be too coarse)
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      const t = player.currentTime;
      if (typeof t === 'number' && t > 0) {
        setPositionMs(Math.round(t * 1000));
      }
    }, 250);
    return () => clearInterval(id);
  }, [isPlaying, player]);

  // Auto-retry once on transient errors (network hiccups, segment timeouts)
  useEffect(() => {
    if (error && autoRetryCount < MAX_AUTO_RETRIES) {
      retryTimerRef.current = setTimeout(() => {
        setAutoRetryCount(prev => prev + 1);
        setError(null);
        setIsLoading(true);
        startSpinnerTimer();
        player.replace({ uri });
        if (autoPlay) player.play();
      }, AUTO_RETRY_DELAY_MS);
    }
    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, [error]);

  // Cleanup on unmount
  useEffect(() => {
    // Start debounced spinner on mount since player begins loading immediately
    startSpinnerTimer();
    return () => {
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
      if (spinnerTimerRef.current) clearTimeout(spinnerTimerRef.current);
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, []);

  // Handle orientation and system bars for fullscreen
  useEffect(() => {
    const handleFullscreenOrientation = async () => {
      try {
        if (isFullscreen) {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
          StatusBar.setHidden(true);
          await NavigationBar.setVisibilityAsync('hidden');
        } else {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
          StatusBar.setHidden(false);
          await NavigationBar.setVisibilityAsync('hidden');
        }
      } catch (err) {
        console.error('Error changing orientation:', err);
      }
    };
    handleFullscreenOrientation();

    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => { });
      StatusBar.setHidden(false);
      NavigationBar.setVisibilityAsync('visible').catch(() => { });
    };
  }, [isFullscreen]);

  // Sync fullscreen with global context
  useEffect(() => {
    setGlobalFullscreen(isFullscreen);
    return () => { setGlobalFullscreen(false); };
  }, [isFullscreen, setGlobalFullscreen]);

  // Auto-hide controls
  useEffect(() => {
    if (showControls && isPlaying) {
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
      controlsTimeout.current = setTimeout(() => setShowControls(false), 4000);
    } else {
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    }
  }, [showControls, isPlaying]);

  const handleTouchScreen = () => setShowControls((prev) => !prev);

  const handlePlayPause = () => {
    if (isPlaying) { player.pause(); } else { player.play(); }
  };

  const handleSeek = (valueMs: number) => {
    player.currentTime = valueMs / 1000;
    setPositionMs(valueMs); // optimistic update — avoids snap-back before timeUpdate fires
  };
  const handleSkipBack = () => {
    player.seekBy(-10);
    setPositionMs(prev => Math.max(0, prev - 10_000));
  };
  const handleSkipForward = () => {
    player.seekBy(10);
    setPositionMs(prev => Math.min(durationMs > 0 ? durationMs : prev + 10_000, prev + 10_000));
  };

  const handleFullscreenToggle = useCallback(() => {
    if (onFullscreenToggle) { onFullscreenToggle(); }
    else { setInternalFullscreen((prev) => !prev); }
  }, [onFullscreenToggle]);

  const handleRetry = () => {
    setError(null);
    setAutoRetryCount(0);
    setIsLoading(true);
    startSpinnerTimer();
    player.replace({ uri });
    if (autoPlay) player.play();
  };

  // Pause auto-hide while scrubbing the seek bar
  const handleSeekStart = useCallback(() => {
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
  }, []);

  const handleSeekEnd = useCallback(() => {
    if (isPlaying) {
      controlsTimeout.current = setTimeout(() => setShowControls(false), 4000);
    }
  }, [isPlaying]);

  const handleMuteToggle = useCallback(() => {
    const next = !isMuted;
    player.muted = next;
    setIsMuted(next);
  }, [isMuted, player]);

  const handlePlaybackRateChange = useCallback((rate: number) => {
    player.playbackRate = rate;
    setPlaybackRate(rate);
  }, [player]);

  const handleBack = useCallback(() => {
    if (isFullscreen) { handleFullscreenToggle(); }
    else { onBack?.(); }
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

  // Show error screen only after auto-retry is exhausted
  if (error && autoRetryCount >= MAX_AUTO_RETRIES) {
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

      {/* Tap-to-toggle area — sits under PlayerControls; only fires when controls are hidden */}
      <Pressable style={styles.touchArea} onPress={handleTouchScreen} />

      {showSpinner && isLoading && (
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
          isMuted={isMuted}
          onMuteToggle={handleMuteToggle}
          playbackRate={playbackRate}
          onPlaybackRateChange={handlePlaybackRateChange}
          onToggleVisibility={handleTouchScreen}
          onSeekStart={handleSeekStart}
          onSeekEnd={handleSeekEnd}
        />
      )}
    </View>
  );
}
