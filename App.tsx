import React, { useEffect, useState, useCallback } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import HomeScreen from './src/screens/HomeScreen';
import MirathInputScreen from './src/screens/MirathInputScreen';
import MirathResultScreen from './src/screens/MirathResultScreen';
import ZakaatScreen from './src/screens/ZakaatScreen';
import { initI18n } from './src/i18n';
import { useTranslation } from 'react-i18next';

import './global.css';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

export default function App() {
    const [appIsReady, setAppIsReady] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        async function prepare() {
            try {
                // Initialize i18n
                await initI18n();

                // Pre-load fonts, make any API calls you need to do here
                // await Font.loadAsync(Entypo.font);

                // Artificially delay for one second to simulate a slow loading
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (e) {
                console.warn(e);
            } finally {
                // Tell the application to render
                setAppIsReady(true);
            }
        }

        prepare();
    }, []);

    const onLayoutRootView = useCallback(async () => {
        if (appIsReady) {
            // This tells the splash screen to hide immediately! If we call this after
            // `setAppIsReady`, then we may see a blank screen while the app is
            // loading its initial state and rendering its first pixels. So instead,
            // we hide the splash screen once we know the root view has already
            // performed layout.
            await SplashScreen.hideAsync();
        }
    }, [appIsReady]);

    if (!appIsReady) {
        return null;
    }

    return (
        <SafeAreaProvider onLayout={onLayoutRootView}>
            <NavigationContainer>
                <Stack.Navigator
                    screenOptions={{
                        headerStyle: { backgroundColor: '#10B981' },
                        headerTintColor: '#fff',
                        headerTitleStyle: { fontWeight: 'bold' },
                        headerTitleAlign: 'center',
                        contentStyle: { backgroundColor: '#F9FAFB' }
                    }}
                >
                    <Stack.Screen
                        name="Home"
                        component={HomeScreen}
                        options={{ title: t('navigation.home') }}
                    />
                    <Stack.Screen
                        name="MirathInput"
                        component={MirathInputScreen}
                        options={{ title: t('navigation.mirath_input') }}
                    />
                    <Stack.Screen
                        name="MirathResult"
                        component={MirathResultScreen}
                        options={{ title: t('navigation.mirath_result') }}
                    />
                    <Stack.Screen
                        name="Zakaat"
                        component={ZakaatScreen}
                        options={{ title: t('navigation.zakaat') }}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}
