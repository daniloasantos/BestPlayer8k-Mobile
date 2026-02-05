import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';

export function useAndroidNavigationBar() {
    useEffect(() => {
        if (Platform.OS === 'android') {
            // Hide navigation bar and make it immersive
            const setupNavigationBar = async () => {
                try {
                    // Set visibility to hidden (immersive mode)
                    await NavigationBar.setVisibilityAsync('hidden');

                    // Set background color to black
                    await NavigationBar.setBackgroundColorAsync('#000000');

                    // Set button style to light (white icons)
                    await NavigationBar.setButtonStyleAsync('light');
                } catch (error) {
                    console.error('Error setting up navigation bar:', error);
                }
            };

            setupNavigationBar();
        }
    }, []);
}
