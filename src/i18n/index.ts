import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import * as Updates from 'expo-updates';

import en from './locales/en.json';
import ar from './locales/ar.json';

const resources = {
    en: { translation: en },
    ar: { translation: ar },
};

const getLanguage = async () => {
    try {
        const savedLanguage = await AsyncStorage.getItem('user-language');
        if (savedLanguage) {
            return savedLanguage;
        }
        return Localization.getLocales()[0].languageCode || 'en';
    } catch (error) {
        console.log('Error reading language', error);
        return 'en';
    }
};

export const initI18n = async () => {
    const lang = await getLanguage();

    await i18n
        .use(initReactI18next)
        .init({
            resources,
            lng: lang,
            fallbackLng: 'en',
            interpolation: {
                escapeValue: false,
            },
            react: {
                useSuspense: false,
            }
        });

    const isRTL = lang.startsWith('ar');

    // Only force if absolutely necessary and only set the flag for future loads
    if (I18nManager.isRTL !== isRTL) {
        I18nManager.allowRTL(isRTL);
        I18nManager.forceRTL(isRTL);
        // Force a reload to apply RTL changes on initial load if mismatched
        await Updates.reloadAsync();
    }
};

export default i18n;
