import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import pt from '@/locales/pt.json';
import en from '@/locales/en.json';
import es from '@/locales/es.json';

type Language = 'pt' | 'en' | 'es';
type Translations = typeof pt;

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
}

const translations: Record<Language, any> = { pt, en, es };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = '@bestplayer:language';

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('pt');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        loadLanguage();
    }, []);

    const loadLanguage = async () => {
        try {
            const savedLang = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
            if (savedLang && ['pt', 'en', 'es'].includes(savedLang)) {
                setLanguageState(savedLang as Language);
            } else {
                // Try to detect device language
                const locale = Localization.locale || Localization.getLocales()[0]?.languageCode || 'pt';
                const deviceLang = locale.split('-')[0];
                if (['pt', 'en', 'es'].includes(deviceLang)) {
                    setLanguageState(deviceLang as Language);
                }
            }
        } catch (error) {
            console.error('Error loading language:', error);
        } finally {
            setIsLoaded(true);
        }
    };

    const setLanguage = async (lang: Language) => {
        try {
            setLanguageState(lang);
            await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
        } catch (error) {
            console.error('Error saving language:', error);
        }
    };

    const t = useCallback((path: string, params?: Record<string, string | number>) => {
        try {
            const keys = path.split('.');
            let value: any = translations[language];

            // Navigate through the keys
            for (const key of keys) {
                if (value && typeof value === 'object' && key in value) {
                    value = value[key];
                } else {
                    // Key not found, try fallback to PT
                    let fallbackValue: any = translations['pt'];
                    for (const fallbackKey of keys) {
                        if (fallbackValue && typeof fallbackValue === 'object' && fallbackKey in fallbackValue) {
                            fallbackValue = fallbackValue[fallbackKey];
                        } else {
                            console.warn(`Translation key not found: ${path}`);
                            return path;
                        }
                    }
                    value = fallbackValue;
                    break;
                }
            }

            if (typeof value !== 'string') {
                console.warn(`Translation value is not a string for key: ${path}, got: ${typeof value}`);
                return path;
            }

            // Replace parameters
            if (params) {
                Object.entries(params).forEach(([key, val]) => {
                    value = (value as string).replace(`{${key}}`, String(val));
                });
            }

            return value;
        } catch (error) {
            console.error(`Error translating key: ${path}`, error);
            return path;
        }
    }, [language]);

    // Don't render children until language is loaded
    if (!isLoaded) {
        return null;
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

