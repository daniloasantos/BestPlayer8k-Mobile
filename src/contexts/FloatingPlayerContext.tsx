import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { Channel } from '@/types';

interface FloatingPlayerContextType {
    channel: Channel | null;
    isPlaying: boolean;
    isMinimized: boolean;
    setChannel: (channel: Channel | null) => void;
    play: () => void;
    pause: () => void;
    stop: () => void;
    minimize: () => void;
    maximize: () => void;
}

const FloatingPlayerContext = createContext<FloatingPlayerContextType | undefined>(undefined);

export function FloatingPlayerProvider({ children }: { children: React.ReactNode }) {
    const [channel, setChannelState] = useState<Channel | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    const setChannel = useCallback((newChannel: Channel | null) => {
        // If it's a LIVE channel, keep playing in floating mode
        if (newChannel?.type === 'LIVE') {
            setChannelState(newChannel);
            setIsPlaying(true);
            setIsMinimized(false);
        } else {
            // For MOVIE or SERIES, stop the player
            setChannelState(null);
            setIsPlaying(false);
            setIsMinimized(false);
        }
    }, []);

    const play = useCallback(() => {
        setIsPlaying(true);
    }, []);

    const pause = useCallback(() => {
        setIsPlaying(false);
    }, []);

    const stop = useCallback(() => {
        setChannelState(null);
        setIsPlaying(false);
        setIsMinimized(false);
    }, []);

    const minimize = useCallback(() => {
        setIsMinimized(true);
    }, []);

    const maximize = useCallback(() => {
        setIsMinimized(false);
    }, []);

    return (
        <FloatingPlayerContext.Provider
            value={{
                channel,
                isPlaying,
                isMinimized,
                setChannel,
                play,
                pause,
                stop,
                minimize,
                maximize,
            }}
        >
            {children}
        </FloatingPlayerContext.Provider>
    );
}

export function useFloatingPlayer() {
    const context = useContext(FloatingPlayerContext);
    if (!context) {
        throw new Error('useFloatingPlayer must be used within FloatingPlayerProvider');
    }
    return context;
}
