import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Ensure you have EXPO_PUBLIC_METALPRICE_API_KEY in your .env file
const API_KEY = process.env.EXPO_PUBLIC_METALPRICE_API_KEY;
const BASE_URL = 'https://api.metalpriceapi.com/v1/latest';
const CACHE_KEY = 'GOLD_RATES_CACHE';
const TIMESTAMP_KEY = 'GOLD_RATES_TIMESTAMP';
const CACHE_DURATION = 5 * 24 * 60 * 60 * 1000; // 5 days in milliseconds

export interface GoldRates {
    gold: string;
    silver: string;
    lastFetched: string;
    isFromCache: boolean;
}

/**
 * Fetches gold and silver rates from MetalPriceAPI.
 * Implements a 5-day caching mechanism with offline fallback.
 */
export const fetchGoldRates = async (currency: string = 'GMD'): Promise<GoldRates | null> => {
    try {
        const cachedRates = await AsyncStorage.getItem(CACHE_KEY);
        const cachedTimestamp = await AsyncStorage.getItem(TIMESTAMP_KEY);
        const now = Date.now();

        // 1. Check if cache exists and is fresh (less than 5 days old)
        if (cachedRates && cachedTimestamp) {
            const timestamp = parseInt(cachedTimestamp, 10);
            if (now - timestamp < CACHE_DURATION) {
                const rates = JSON.parse(cachedRates);
                return {
                    ...rates,
                    lastFetched: new Date(timestamp).toLocaleDateString(),
                    isFromCache: true
                };
            }
        }

        // 2. If no fresh cache, attempt to fetch from API
        try {
            if (!API_KEY || API_KEY === 'REPLACE_WITH_YOUR_KEY') {
                throw new Error('Missing or invalid API Key');
            }

            const response = await axios.get(`${BASE_URL}?api_key=${API_KEY}&base=${currency}&currencies=XAU,XAG`);

            if (response.data && response.data.success) {
                // The API returns rates as 1 [Base] = X [Metal Ounce]
                // To get price per Ounce: 1 / rate
                const xauRate = response.data.rates.XAU;
                const xagRate = response.data.rates.XAG;

                if (!xauRate || !xagRate) throw new Error('Invalid rate data received');

                const goldPricePerOz = 1 / xauRate;
                const silverPricePerOz = 1 / xagRate;

                // Convert Ounce to Gram (1 Ounce = 31.1034768 Grams)
                const goldPricePerGram = (goldPricePerOz / 31.1035).toFixed(2);
                const silverPricePerGram = (silverPricePerOz / 31.1035).toFixed(2);

                const newRates = {
                    gold: goldPricePerGram,
                    silver: silverPricePerGram,
                };

                // Save to cache
                await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(newRates));
                await AsyncStorage.setItem(TIMESTAMP_KEY, now.toString());

                return {
                    ...newRates,
                    lastFetched: new Date(now).toLocaleDateString(),
                    isFromCache: false
                };
            } else {
                throw new Error(response.data?.error?.info || 'API fetch unsuccessful');
            }
        } catch (fetchError) {
            console.error('MetalPriceAPI fetch error:', fetchError);

            // 3. Fallback: If fetch fails (offline or API error), use cache even if old
            if (cachedRates && cachedTimestamp) {
                const rates = JSON.parse(cachedRates);
                return {
                    ...rates,
                    lastFetched: new Date(parseInt(cachedTimestamp, 10)).toLocaleDateString(),
                    isFromCache: true
                };
            }
        }

        return null;
    } catch (error) {
        console.error('GoldService fatal error:', error);
        return null;
    }
};
