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
                // Ensure the cached rates are for the same currency (we'll assume GMD for now as simple caching)
                // In a multi-currency app, we'd add currency to the cache key
                return {
                    ...rates,
                    lastFetched: new Date(timestamp).toLocaleDateString(),
                    isFromCache: true
                };
            }
        }

        // 2. If no fresh cache, attempt to fetch from API
        try {
            if (!API_KEY || API_KEY === 'REPLACE_WITH_YOUR_KEY' || API_KEY.length < 10) {
                throw new Error('Missing or invalid API Key. Please check your .env file.');
            }

            // Using USD as base because free tier often restricts non-USD bases
            // We fetch the target currency rate (e.g. GMD) along with metals
            const response = await axios.get(`${BASE_URL}?api_key=${API_KEY}&base=USD&currencies=XAU,XAG,${currency}`);

            if (response.data && response.data.success) {
                const rates = response.data.rates;
                const xauRate = rates.XAU; // 1 USD = X Gold Oz
                const xagRate = rates.XAG; // 1 USD = X Silver Oz
                const targetCurrencyRate = rates[currency] || 70; // 1 USD = X Target Currency (e.g. 70 GMD)

                if (!xauRate || !xagRate) throw new Error('Metal rate data not available');

                // Price of 1 Gold Oz in USD = 1 / xauRate
                // Price of 1 Gold Oz in Target Currency = (1 / xauRate) * targetCurrencyRate
                const goldPricePerOz = (1 / xauRate) * targetCurrencyRate;
                const silverPricePerOz = (1 / xagRate) * targetCurrencyRate;

                // Convert Ounce to Gram (1 Ounce = 31.1035 Grams)
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
                const errorInfo = response.data?.error?.info || 'API response unsuccessful';
                throw new Error(errorInfo);
            }
        } catch (fetchError: any) {
            console.error('MetalPriceAPI fetch error:', fetchError?.message || fetchError);

            // 3. Fallback: If fetch fails (offline or API error), use cache even if old
            if (cachedRates && cachedTimestamp) {
                const rates = JSON.parse(cachedRates);
                return {
                    ...rates,
                    lastFetched: new Date(parseInt(cachedTimestamp, 10)).toLocaleDateString(),
                    isFromCache: true
                };
            }
            throw fetchError; // Re-throw if no cache at all
        }
    } catch (error) {
        console.error('GoldService fatal error:', error);
        return null;
    }
};
