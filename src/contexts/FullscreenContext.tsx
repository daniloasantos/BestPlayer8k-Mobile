import React, { createContext, useContext, useState, useCallback } from 'react';

interface FullscreenContextType {
    isFullscreen: boolean;
    setFullscreen: (value: boolean) => void;
}

const FullscreenContext = createContext<FullscreenContextType | undefined>(undefined);

export function FullscreenProvider({ children }: { children: React.ReactNode }) {
    const [isFullscreen, setIsFullscreen] = useState(false);

    const setFullscreen = useCallback((value: boolean) => {
        setIsFullscreen(value);
    }, []);

    return (
        <FullscreenContext.Provider value={{ isFullscreen, setFullscreen }}>
            {children}
        </FullscreenContext.Provider>
    );
}

export function useFullscreen() {
    const context = useContext(FullscreenContext);
    if (!context) {
        throw new Error('useFullscreen must be used within FullscreenProvider');
    }
    return context;
}
