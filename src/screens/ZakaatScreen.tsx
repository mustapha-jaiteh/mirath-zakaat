import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, I18nManager, useWindowDimensions } from 'react-native';
import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

// Placeholder API Key - User should replace this
const API_KEY = 'YOUR_METALS_API_KEY';

const ZakaatScreen = () => {
    const { t, i18n } = useTranslation();
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;

    const isRTL = i18n.language.startsWith('ar');
    const writingDirection = isRTL ? 'rtl' : 'ltr';
    const textAlign = 'auto';

    const [cash, setCash] = useState('');
    const [goldGrams, setGoldGrams] = useState('');
    const [silverGrams, setSilverGrams] = useState('');
    const [assets, setAssets] = useState('');
    const [debts, setDebts] = useState('');

    const [goldRate, setGoldRate] = useState('5000');
    const [silverRate, setSilverRate] = useState('60');

    const [loading, setLoading] = useState(false);
    const [currency, setCurrency] = useState('GMD');

    interface ZakaatResult {
        totalWealth: number;
        nisaab: number;
        zakaatDue: number;
        isEligible: boolean;
    }

    const [result, setResult] = useState<ZakaatResult | null>(null);

    const fetchRates = async () => {
        setLoading(true);
        try {
            if (API_KEY === 'YOUR_METALS_API_KEY') {
                await new Promise(r => setTimeout(r, 1500));
                Alert.alert('Developer Preview', 'Please add a valid Metals-API Key for live pricing. Using market estimates.');
                setGoldRate('5150');
                setSilverRate('62');
            } else {
                const response = await axios.get(`https://metals-api.com/api/latest?access_key=${API_KEY}&base=USD&symbols=XAU,XAG`);
                if (response.data.success) {
                    const usdToGoldOz = response.data.rates.XAU;
                    const usdToSilverOz = response.data.rates.XAG;
                    const goldPriceUSDPerGram = (1 / usdToGoldOz) / 31.1035;
                    const silverPriceUSDPerGram = (1 / usdToSilverOz) / 31.1035;
                    const gmdRate = 70;
                    setGoldRate((goldPriceUSDPerGram * gmdRate).toFixed(2));
                    setSilverRate((silverPriceUSDPerGram * gmdRate).toFixed(2));
                }
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch rates. Please enter manually.');
        } finally {
            setLoading(false);
        }
    };

    const calculateZakaat = () => {
        const g = Number(goldGrams) || 0;
        const s = Number(silverGrams) || 0;
        const c = Number(cash) || 0;
        const a = Number(assets) || 0;
        const d = Number(debts) || 0;

        const gRate = Number(goldRate) || 0;
        const sRate = Number(silverRate) || 0;

        const totalWealth = c + (g * gRate) + (s * sRate) + a - d;
        const nisaab = 85 * gRate;
        const isEligible = totalWealth >= nisaab;
        const zakaatDue = isEligible ? totalWealth * 0.025 : 0;

        setResult({
            totalWealth,
            nisaab,
            zakaatDue,
            isEligible
        });
    };

    return (
        <ScrollView
            key={i18n.language}
            className="flex-1 bg-gray-50"
            contentContainerStyle={{ padding: 16 }}
            style={{ direction: writingDirection }}
        >
            <View className={isTablet ? 'self-center w-full' : ''} style={isTablet ? { maxWidth: 650 } : {}}>
                <View className="bg-white p-4 rounded-xl shadow-sm mb-4">
                    <Text className="font-bold text-gray-800 mb-3 text-lg" style={{ textAlign, writingDirection }}>{t('zakaat.market_rates')}</Text>
                    <View className="flex-row gap-4 mb-4">
                        <View className="flex-1">
                            <Text className="text-gray-500 text-xs mb-1" style={{ textAlign, writingDirection }}>{t('zakaat.gold_rate')} ({currency})</Text>
                            <TextInput
                                className="border border-amber-200 bg-amber-50 rounded-lg p-2 font-bold text-amber-900"
                                style={{ textAlign, writingDirection }}
                                value={goldRate}
                                onChangeText={setGoldRate}
                                keyboardType="numeric"
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-500 text-xs mb-1" style={{ textAlign, writingDirection }}>{t('zakaat.silver_rate')} ({currency})</Text>
                            <TextInput
                                className="border border-gray-300 bg-gray-100 rounded-lg p-2 font-bold text-gray-700"
                                style={{ textAlign, writingDirection }}
                                value={silverRate}
                                onChangeText={setSilverRate}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={fetchRates}
                        className="bg-gray-800 p-2 rounded-lg items-center flex-row justify-center"
                    >
                        {loading && <ActivityIndicator size="small" color="#fff" style={{ [isRTL ? 'marginLeft' : 'marginRight']: 8 }} />}
                        <Text className="text-white font-medium" style={{ writingDirection }}>{t('zakaat.fetch_rates')}</Text>
                    </TouchableOpacity>
                </View>

                <View className="bg-white p-4 rounded-xl shadow-sm mb-4">
                    <Text className="font-bold text-gray-800 mb-3 text-lg" style={{ textAlign, writingDirection }}>{t('zakaat.assets')}</Text>
                    <InputRow label={t('zakaat.cash')} value={cash} onChange={setCash} placeholder="0.00" isRTL={isRTL} />
                    <InputRow label={t('zakaat.gold_grams')} value={goldGrams} onChange={setGoldGrams} placeholder="0" isRTL={isRTL} />
                    <InputRow label={t('zakaat.silver_grams')} value={silverGrams} onChange={setSilverGrams} placeholder="0" isRTL={isRTL} />
                    <InputRow label={t('zakaat.other_assets')} value={assets} onChange={setAssets} placeholder="0.00" isRTL={isRTL} />
                    <View className="h-4" />
                    <Text className="font-bold text-red-800 mb-3 text-lg" style={{ textAlign, writingDirection }}>{t('zakaat.liabilities')}</Text>
                    <InputRow label={t('zakaat.debts')} value={debts} onChange={setDebts} placeholder="0.00" isRTL={isRTL} />
                </View>

                <TouchableOpacity
                    onPress={calculateZakaat}
                    className="bg-emerald-700 p-4 rounded-xl items-center shadow-lg mb-8"
                >
                    <Text className="text-white font-bold text-xl" style={{ writingDirection }}>{t('zakaat.calculate')}</Text>
                </TouchableOpacity>

                {result && (
                    <View className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12 border-t-8 border-emerald-600">
                        <View className="p-6 items-center">
                            <Text className="text-gray-500 font-medium uppercase tracking-wide mb-2" style={{ textAlign: 'center', writingDirection }}>{t('zakaat.total_wealth')}</Text>
                            <Text className="text-3xl font-bold text-gray-800 mb-6" style={{ textAlign: 'center', writingDirection }}>{result.totalWealth.toLocaleString(undefined, { maximumFractionDigits: 2 })}</Text>
                            <View className="w-full h-px bg-gray-100 mb-6" />

                            <View className="w-full flex-row items-center justify-between mb-4">
                                <Text className="text-gray-500" style={{ textAlign, writingDirection }}>{t('zakaat.nisaab')}</Text>
                                <Text className="font-bold text-gray-700" style={{ writingDirection }}>{result.nisaab.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
                            </View>

                            <View className="w-full flex-row items-center justify-between mb-6">
                                <Text className="text-gray-500" style={{ textAlign, writingDirection }}>{t('zakaat.status')}</Text>
                                <Text className={`font-bold ${result.isEligible ? 'text-green-500' : 'text-red-500'}`} style={{ writingDirection }}>
                                    {result.isEligible ? t('zakaat.eligible') : t('zakaat.not_eligible')}
                                </Text>
                            </View>

                            {result.isEligible && (
                                <View className="bg-emerald-50 w-full p-6 rounded-2xl items-center border border-emerald-100">
                                    <Text className="text-emerald-800 text-xs font-bold uppercase mb-2 tracking-widest" style={{ writingDirection }}>{t('zakaat.payable')}</Text>
                                    <Text className="text-emerald-600 text-5xl font-black" style={{ writingDirection }}>
                                        {result.zakaatDue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </Text>
                                    <Text className="text-emerald-700 font-medium mt-1" style={{ writingDirection }}>{currency}</Text>
                                </View>
                            )}

                            <View className="mt-6 p-4 bg-gray-50 rounded-xl w-full">
                                <Text className="text-gray-500 text-xs leading-5" style={{ textAlign, writingDirection }}>
                                    {t('zakaat.note')}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

const InputRow = ({ label, value, onChange, placeholder, isRTL }: any) => {
    const writingDirection = isRTL ? 'rtl' : 'ltr';
    const textAlign = 'auto';
    return (
        <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-600 font-medium flex-1" style={{ textAlign, writingDirection }}>{label}</Text>
            <TextInput
                className="border border-gray-200 rounded-lg p-2 w-32 font-medium bg-gray-50"
                style={{ textAlign, writingDirection }}
                placeholder={placeholder}
                value={value}
                onChangeText={onChange}
                keyboardType="numeric"
            />
        </View>
    );
};

export default ZakaatScreen;
