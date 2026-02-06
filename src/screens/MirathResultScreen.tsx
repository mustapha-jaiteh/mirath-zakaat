import { View, Text, ScrollView, TouchableOpacity, I18nManager, useWindowDimensions } from 'react-native';
import React from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { calculateInheritance, CalculationInput } from '../utils/inheritanceLogic';

const MirathResultScreen = () => {
    const { t, i18n } = useTranslation();
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;

    const isRTL = i18n.language.startsWith('ar');
    const writingDirection = isRTL ? 'rtl' : 'ltr';
    const textAlign = 'auto';

    const route = useRoute();
    const navigation = useNavigation();
    const { deceasedGender, relatives, totalWealth } = route.params as CalculationInput;

    const results = calculateInheritance({ deceasedGender, relatives, totalWealth });

    const totalDistributed = results.reduce((sum, res) => sum + res.shareValue, 0);
    const unallocated = Math.max(0, totalWealth - totalDistributed);

    return (
        <ScrollView
            key={i18n.language}
            className="flex-1 bg-gray-50"
            contentContainerStyle={{ padding: 16 }}
            style={{ direction: writingDirection }}
        >
            <View className={isTablet ? 'self-center w-full' : ''} style={isTablet ? { maxWidth: 750 } : {}}>
                {/* Summary Card */}
                <View className="bg-emerald-700 p-6 rounded-2xl mb-6 shadow-lg">
                    <Text className="text-emerald-100 text-sm font-bold uppercase tracking-wider mb-1" style={{ textAlign, writingDirection }}>{t('mirath_results.total_estate')}</Text>
                    <Text className="text-white text-3xl font-bold mb-4" style={{ textAlign, writingDirection }}>{totalWealth.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>

                    <View className="flex-row justify-between bg-emerald-800/50 p-3 rounded-lg">
                        <View>
                            <Text className="text-emerald-200 text-xs" style={{ textAlign, writingDirection }}>{t('mirath_results.distributed')}</Text>
                            <Text className="text-white font-bold" style={{ textAlign, writingDirection }}>{((totalDistributed / totalWealth) * 100).toFixed(1)}%</Text>
                        </View>
                        <View>
                            <Text className="text-emerald-200 text-xs" style={{ textAlign, writingDirection }}>{t('mirath_results.heirs_count')}</Text>
                            <Text className="text-white font-bold" style={{ textAlign, writingDirection }}>{relatives.reduce((sum, r) => sum + r.count, 0)}</Text>
                        </View>
                    </View>
                </View>

                {/* Distribution Table */}
                <View className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
                    {/* Header Row */}
                    <View className="flex-row bg-gray-100 p-3 border-b border-gray-200">
                        {/* Heir Name (Right in Arabic, Left in English) */}
                        <Text className="flex-1 font-bold text-gray-600" style={{ textAlign, writingDirection }}>{t('mirath_results.heir_col')}</Text>

                        {/* Share (Center) */}
                        <Text className="w-16 text-center font-bold text-gray-600">{t('mirath_results.share_col')}</Text>

                        {/* Amount (Left in Arabic, Right in English) */}
                        <Text className="w-24 font-bold text-gray-600" style={{ textAlign, writingDirection }}>{t('mirath_results.amount_col')}</Text>
                    </View>

                    {results.length === 0 ? (
                        <View className="p-8 items-center">
                            <Text className="text-gray-400" style={{ textAlign, writingDirection }}>{t('mirath_results.no_heirs')}</Text>
                        </View>
                    ) : (
                        results.map((item, index) => (
                            <View key={index} className="border-b border-gray-50">
                                {/* Standard Distributions */}
                                <View className="flex-row p-4 items-center">
                                    <View className="flex-1">
                                        <Text className="font-bold text-gray-800 text-lg capitalize" style={{ textAlign, writingDirection }}>
                                            {t(`mirath.heirs.${item.relativeType}`)}
                                            {item.count > 1 && ` (${item.count})`}
                                        </Text>
                                        <Text className="text-gray-400 text-xs italic" style={{ textAlign, writingDirection }}>
                                            {item.noteKey ? t(item.noteKey) : item.notes}
                                            {item.hasRadd && t('mirath_results.rules.radd_increase')}
                                        </Text>
                                    </View>

                                    <View className="w-16 items-center bg-emerald-50 rounded p-1 mx-2">
                                        <Text className="text-emerald-700 font-bold">{(item.percentage * 100).toFixed(1)}%</Text>
                                    </View>

                                    <Text className="w-24 font-bold text-gray-900" style={{ textAlign, writingDirection }}>
                                        {item.shareValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </Text>
                                </View>

                                {/* "Each Gets" breakdown */}
                                {item.count > 1 && (
                                    <View className={`bg-gray-50 px-4 py-2 flex-row items-center border-t border-gray-100 ${isRTL ? '' : 'justify-end'}`}>
                                        <Text className={`text-xs text-gray-500 ${isRTL ? 'ml-2' : 'mr-2'}`}>{t('mirath_results.each_gets')}</Text>
                                        <Text className="text-xs font-bold text-gray-700">
                                            {(item.shareValue / item.count).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        ))
                    )}
                </View>

                {/* Unallocated Warning */}
                {unallocated > 1 && (
                    <View className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-6">
                        <Text className="text-amber-800 font-bold mb-1">{t('mirath_results.unallocated')}: {unallocated.toLocaleString()}</Text>
                        <Text className="text-amber-700 text-sm">
                            {t('mirath_results.unallocated_note')}
                        </Text>
                    </View>
                )}

                {/* Action Buttons */}
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="bg-gray-200 p-4 rounded-xl items-center mb-8"
                >
                    <Text className="text-gray-700 font-bold" style={{ textAlign, writingDirection }}>{t('mirath_results.recalculate')}</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default MirathResultScreen;
