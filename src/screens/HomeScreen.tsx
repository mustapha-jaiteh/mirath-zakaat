import { View, Text, TouchableOpacity, Image, I18nManager, useWindowDimensions } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSelector';

const HomeScreen = () => {
    const navigation = useNavigation();
    const { t, i18n } = useTranslation();
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;

    const isRTL = i18n.language.startsWith('ar');
    const writingDirection = isRTL ? 'rtl' : 'ltr';
    const textAlign = 'auto';

    return (
        <View key={i18n.language} className="flex-1 bg-white" style={{ direction: writingDirection }}>
            {/* Header / Hero */}
            <View className="bg-emerald-700 pt-20 pb-16 px-8 rounded-b-[40px] shadow-2xl relative">
                <View
                    style={{
                        position: 'absolute',
                        top: 56,
                        [isRTL ? 'left' : 'right']: 24,
                        zIndex: 10
                    }}
                >
                    <LanguageSelector />
                </View>
                <Text
                    className="text-emerald-100 text-base font-bold uppercase tracking-widest mb-2"
                    style={{ textAlign: 'center', writingDirection }}
                >
                    {t('home.subtitle')}
                </Text>
                <Text
                    className="text-white text-3xl font-black mb-4"
                    style={{ textAlign: 'center', writingDirection }}
                >
                    {t('home.title')}
                </Text>
                <View className="h-1.5 w-24 bg-emerald-400 self-center rounded-full" />
            </View>

            <View className={`flex-1 px-6 -mt-8 ${isTablet ? 'items-center' : ''}`}>
                <View className={isTablet ? 'flex-row flex-wrap justify-center gap-6' : ''} style={isTablet ? { maxWidth: 1000 } : {}}>
                    {/* Mirath Card */}
                    <TouchableOpacity
                        activeOpacity={0.9}
                        className={`bg-white p-8 rounded-3xl mb-6 shadow-xl border border-gray-100 flex-row items-center gap-4 ${isTablet ? 'w-[450px]' : 'w-full'}`}
                        onPress={() => navigation.navigate('MirathInput' as never)}
                    >
                        <View
                            className="bg-emerald-100 w-16 h-16 rounded-2xl items-center justify-center"
                        >
                            <Text className="text-3xl">⚖️</Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-2xl font-bold text-gray-800" style={{ textAlign, writingDirection }}>
                                {t('home.mirath_title')}
                            </Text>
                            <Text className="text-gray-500 mt-1" style={{ textAlign, writingDirection }}>
                                {t('home.mirath_desc')}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    {/* Zakaat Card */}
                    <TouchableOpacity
                        activeOpacity={0.9}
                        className={`bg-white p-8 rounded-3xl mb-6 shadow-xl border border-gray-100 flex-row items-center gap-4 ${isTablet ? 'w-[450px]' : 'w-full'}`}
                        onPress={() => navigation.navigate('Zakaat' as never)}
                    >
                        <View
                            className="bg-amber-100 w-16 h-16 rounded-2xl items-center justify-center"
                        >
                            <Text className="text-3xl">🌙</Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-2xl font-bold text-gray-800" style={{ textAlign, writingDirection }}>
                                {t('home.zakaat_title')}
                            </Text>
                            <Text className="text-gray-500 mt-1" style={{ textAlign, writingDirection }}>
                                {t('home.zakaat_desc')}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <View className="pb-10 items-center">
                <Text className="text-gray-400 font-medium tracking-widest text-xs uppercase" style={{ writingDirection }}>{t('home.footer')}</Text>
            </View>
        </View>
    );
};

export default HomeScreen;
