import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Animated,
    Dimensions,
    PanResponder,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { X, Maximize2, Play, Pause } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useColors, spacing, borderRadius, typography } from '@/theme';
import { useFloatingPlayer } from '@/contexts';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const PLAYER_WIDTH = SCREEN_WIDTH * 0.4;
const PLAYER_HEIGHT = PLAYER_WIDTH * (9 / 16);
const INITIAL_X = SCREEN_WIDTH - PLAYER_WIDTH - 16;
const INITIAL_Y = SCREEN_HEIGHT - PLAYER_HEIGHT - 100;

export function FloatingPlayer() {
    const colors = useColors();
    const router = useRouter();
    const { channel, isPlaying, isMinimized, stop, maximize, play, pause } = useFloatingPlayer();
    const videoRef = useRef<Video>(null);

    const position = useRef(new Animated.ValueXY({ x: INITIAL_X, y: INITIAL_Y })).current;
    const [showControls, setShowControls] = useState(false);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                position.setOffset({
                    x: (position.x as any)._value,
                    y: (position.y as any)._value,
                });
                position.setValue({ x: 0, y: 0 });
            },
            onPanResponderMove: Animated.event(
                [null, { dx: position.x, dy: position.y }],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: (_, gesture) => {
                position.flattenOffset();

                // Snap to edges
                const finalX = gesture.moveX < SCREEN_WIDTH / 2 ? 16 : SCREEN_WIDTH - PLAYER_WIDTH - 16;
                const finalY = Math.max(50, Math.min(SCREEN_HEIGHT - PLAYER_HEIGHT - 100, (position.y as any)._value));

                Animated.spring(position, {
                    toValue: { x: finalX, y: finalY },
                    useNativeDriver: false,
                }).start();
            },
        })
    ).current;

    if (!channel || !isMinimized) {
        return null;
    }

    const handleMaximize = () => {
        maximize();
        router.push(`/channels/${channel.id}` as any);
    };

    const handlePlayPause = () => {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    };

    const styles = StyleSheet.create({
        container: {
            position: 'absolute',
            width: PLAYER_WIDTH,
            height: PLAYER_HEIGHT + 40,
            backgroundColor: colors.card,
            borderRadius: borderRadius.lg,
            borderWidth: 2,
            borderColor: colors.primary,
            overflow: 'hidden',
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
        },
        videoContainer: {
            width: PLAYER_WIDTH,
            height: PLAYER_HEIGHT,
            backgroundColor: '#000',
        },
        video: {
            width: '100%',
            height: '100%',
        },
        controls: {
            height: 40,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.sm,
            backgroundColor: colors.card,
        },
        title: {
            ...typography.small,
            color: colors.foreground,
            fontWeight: '600',
            flex: 1,
            marginRight: spacing.xs,
        },
        actions: {
            flexDirection: 'row',
            gap: spacing.xs,
        },
        actionButton: {
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: colors.muted,
            alignItems: 'center',
            justifyContent: 'center',
        },
        overlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'transparent',
        },
    });

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: position.getTranslateTransform(),
                },
            ]}
            {...panResponder.panHandlers}
        >
            <Pressable
                style={styles.videoContainer}
                onPress={() => setShowControls(!showControls)}
            >
                <Video
                    ref={videoRef}
                    style={styles.video}
                    source={{ uri: channel.streamUrl }}
                    resizeMode={ResizeMode.CONTAIN}
                    shouldPlay={isPlaying}
                    isLooping={false}
                />

                {showControls && (
                    <View style={styles.overlay}>
                        <Pressable
                            style={[styles.actionButton, { position: 'absolute', top: 4, right: 4 }]}
                            onPress={stop}
                        >
                            <X size={16} color={colors.foreground} />
                        </Pressable>
                    </View>
                )}
            </Pressable>

            <View style={styles.controls}>
                <Text style={styles.title} numberOfLines={1}>
                    {channel.name}
                </Text>

                <View style={styles.actions}>
                    <Pressable style={styles.actionButton} onPress={handlePlayPause}>
                        {isPlaying ? (
                            <Pause size={14} color={colors.foreground} />
                        ) : (
                            <Play size={14} color={colors.foreground} />
                        )}
                    </Pressable>

                    <Pressable style={styles.actionButton} onPress={handleMaximize}>
                        <Maximize2 size={14} color={colors.foreground} />
                    </Pressable>

                    <Pressable style={styles.actionButton} onPress={stop}>
                        <X size={14} color={colors.foreground} />
                    </Pressable>
                </View>
            </View>
        </Animated.View>
    );
}
