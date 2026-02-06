import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, StyleSheet, I18nManager, useWindowDimensions } from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Gender, RelativeType, Relative } from '../utils/inheritanceLogic';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type MirathInputScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MirathInput'>;

const MirathInputScreen = () => {
    const { t, i18n } = useTranslation();
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;

    const isRTL = i18n.language.startsWith('ar');
    const writingDirection = isRTL ? 'rtl' : 'ltr';
    const textAlign = 'auto';

    const navigation = useNavigation<MirathInputScreenNavigationProp>();
    const [deceasedGender, setDeceasedGender] = useState<Gender>('male');
    const [relatives, setRelatives] = useState<Relative[]>([]);
    const [wealth, setWealth] = useState('');

    const RELATIVE_TYPES: { type: RelativeType; label: string; group: string; groupKey: string }[] = [
        { type: 'father', label: t('mirath.heirs.father'), group: t('mirath.groups.ancestors'), groupKey: 'ancestors' },
        { type: 'mother', label: t('mirath.heirs.mother'), group: t('mirath.groups.ancestors'), groupKey: 'ancestors' },
        { type: 'grandfather', label: t('mirath.heirs.grandfather'), group: t('mirath.groups.ancestors'), groupKey: 'ancestors' },
        { type: 'grandmother', label: t('mirath.heirs.grandmother'), group: t('mirath.groups.ancestors'), groupKey: 'ancestors' },
        { type: 'husband', label: t('mirath.heirs.husband'), group: t('mirath.groups.spouse'), groupKey: 'spouse' },
        { type: 'wife', label: t('mirath.heirs.wife'), group: t('mirath.groups.spouse'), groupKey: 'spouse' },
        { type: 'son', label: t('mirath.heirs.son'), group: t('mirath.groups.descendants'), groupKey: 'descendants' },
        { type: 'daughter', label: t('mirath.heirs.daughter'), group: t('mirath.groups.descendants'), groupKey: 'descendants' },
        { type: 'grandson', label: t('mirath.heirs.grandson'), group: t('mirath.groups.descendants'), groupKey: 'descendants' },
        { type: 'granddaughter', label: t('mirath.heirs.granddaughter'), group: t('mirath.groups.descendants'), groupKey: 'descendants' },
        { type: 'full_brother', label: t('mirath.heirs.full_brother'), group: t('mirath.groups.siblings'), groupKey: 'siblings' },
        { type: 'full_sister', label: t('mirath.heirs.full_sister'), group: t('mirath.groups.siblings'), groupKey: 'siblings' },
        { type: 'paternal_brother', label: t('mirath.heirs.paternal_brother'), group: t('mirath.groups.siblings'), groupKey: 'siblings' },
        { type: 'paternal_sister', label: t('mirath.heirs.paternal_sister'), group: t('mirath.groups.siblings'), groupKey: 'siblings' },
        { type: 'maternal_brother', label: t('mirath.heirs.maternal_brother'), group: t('mirath.groups.siblings'), groupKey: 'siblings' },
        { type: 'maternal_sister', label: t('mirath.heirs.maternal_sister'), group: t('mirath.groups.siblings'), groupKey: 'siblings' },
        { type: 'full_nephew', label: t('mirath.heirs.full_nephew'), group: t('mirath.groups.other_heirs'), groupKey: 'other_heirs' },
        { type: 'paternal_nephew', label: t('mirath.heirs.paternal_nephew'), group: t('mirath.groups.other_heirs'), groupKey: 'other_heirs' },
        { type: 'full_uncle', label: t('mirath.heirs.full_uncle'), group: t('mirath.groups.other_heirs'), groupKey: 'other_heirs' },
        { type: 'paternal_uncle', label: t('mirath.heirs.paternal_uncle'), group: t('mirath.groups.other_heirs'), groupKey: 'other_heirs' },
        { type: 'full_cousin', label: t('mirath.heirs.full_cousin'), group: t('mirath.groups.other_heirs'), groupKey: 'other_heirs' },
        { type: 'paternal_cousin', label: t('mirath.heirs.paternal_cousin'), group: t('mirath.groups.other_heirs'), groupKey: 'other_heirs' },
    ];

    const updateRelativeCount = (type: RelativeType, change: number) => {
        setRelatives(prev => {
            const existingIndex = prev.findIndex(r => r.type === type);
            if (existingIndex >= 0) {
                const newCount = prev[existingIndex].count + change;
                if (newCount <= 0) {
                    return prev.filter(r => r.type !== type);
                }
                const updated = [...prev];
                updated[existingIndex].count = newCount;
                return updated;
            } else {
                if (change > 0) {
                    if (type === 'husband' && deceasedGender === 'male') return prev;
                    return [...prev, { id: type, name: type, type, count: change }];
                }
                return prev;
            }
        });
    };

    const getCount = (type: RelativeType) => relatives.find(r => r.type === type)?.count || 0;

    const handleCalculate = () => {
        if (!wealth || isNaN(Number(wealth))) {
            Alert.alert('Error', t('mirath.errors.invalid_wealth'));
            return;
        }

        navigation.navigate('MirathResult', {
            deceasedGender,
            relatives,
            totalWealth: Number(wealth)
        });
    };

    return (
        <ScrollView
            key={i18n.language}
            className="flex-1 bg-gray-50"
            contentContainerStyle={{ padding: 16 }}
            style={{ direction: writingDirection }}
        >
            <View className={isTablet ? 'self-center w-full' : ''} style={isTablet ? { maxWidth: 700 } : {}}>
                <View className="mb-6 bg-white p-4 rounded-xl shadow-sm">
                    <Text className="text-lg font-bold mb-4 text-gray-800" style={{ textAlign, writingDirection }}>{t('mirath.deceased_gender')}</Text>
                    <View className="flex-row gap-4">
                        <TouchableOpacity
                            onPress={() => {
                                setDeceasedGender('male');
                                setRelatives(prev => prev.filter(r => r.type !== 'husband'));
                            }}
                            className={`flex-1 p-3 rounded-lg items-center border-2 ${deceasedGender === 'male' ? 'bg-emerald-50 border-emerald-500' : 'bg-gray-100 border-transparent'}`}
                        >
                            <Text className={`font-semibold ${deceasedGender === 'male' ? 'text-emerald-700' : 'text-gray-500'}`} style={{ writingDirection }}>{t('mirath.male')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                setDeceasedGender('female');
                                setRelatives(prev => prev.filter(r => r.type !== 'wife'));
                            }}
                            className={`flex-1 p-3 rounded-lg items-center border-2 ${deceasedGender === 'female' ? 'bg-emerald-50 border-emerald-500' : 'bg-gray-100 border-transparent'}`}
                        >
                            <Text className={`font-semibold ${deceasedGender === 'female' ? 'text-emerald-700' : 'text-gray-500'}`} style={{ writingDirection }}>{t('mirath.female')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="mb-6 bg-white p-4 rounded-xl shadow-sm">
                    <Text className="text-lg font-bold mb-2 text-gray-800" style={{ textAlign, writingDirection }}>{t('mirath.total_assets')}</Text>
                    <TextInput
                        className="border border-gray-300 rounded-lg p-3 text-lg bg-white"
                        style={{ textAlign, writingDirection }}
                        placeholder="0.00"
                        keyboardType="numeric"
                        value={wealth}
                        onChangeText={setWealth}
                    />
                </View>

                <View className="mb-20">
                    <Text className="text-lg font-bold mb-4 text-gray-800" style={{ textAlign, writingDirection }}>{t('mirath.select_heirs')}</Text>

                    {['ancestors', 'spouse', 'descendants', 'siblings', 'other_heirs'].map(groupKey => (
                        <View key={groupKey} className="mb-4">
                            <Text className="text-emerald-600 font-bold mb-2 uppercase text-xs tracking-wider" style={{ textAlign, writingDirection }}>{t(`mirath.groups.${groupKey}`)}</Text>
                            <View className="bg-white rounded-xl shadow-sm overflow-hidden">
                                {RELATIVE_TYPES.filter(r => r.groupKey === groupKey).map((rel, index) => {
                                    if ((deceasedGender === 'male' && rel.type === 'husband') ||
                                        (deceasedGender === 'female' && rel.type === 'wife')) return null;

                                    const count = getCount(rel.type);
                                    const isSingleOnly = ['husband', 'wife', 'father', 'mother', 'grandfather'].includes(rel.type);

                                    return (
                                        <View key={rel.type} className={`flex-row items-center justify-between p-4 ${index !== 0 ? 'border-t border-gray-100' : ''}`}>
                                            <Text className="text-gray-700 font-medium flex-1" style={{ textAlign, writingDirection }}>{rel.label}</Text>
                                            <View className="flex-row items-center gap-3">
                                                {count > 0 && (
                                                    <TouchableOpacity
                                                        onPress={() => updateRelativeCount(rel.type, -1)}
                                                        className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center"
                                                    >
                                                        <Text className="text-xl font-bold text-gray-600">-</Text>
                                                    </TouchableOpacity>
                                                )}
                                                <Text className="text-lg font-bold w-4 text-center">{count}</Text>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        if (isSingleOnly && count >= 1) return;
                                                        if (rel.type === 'wife' && count >= 4) return;
                                                        updateRelativeCount(rel.type, 1);
                                                    }}
                                                    className={`w-8 h-8 rounded-full items-center justify-center ${(isSingleOnly && count >= 1) ? 'bg-gray-100' : 'bg-emerald-100'
                                                        }`}
                                                    disabled={isSingleOnly && count >= 1}
                                                >
                                                    <Text className={`text-xl font-bold ${(isSingleOnly && count >= 1) ? 'text-gray-300' : 'text-emerald-700'
                                                        }`}>+</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    ))}
                </View>
                <View className="w-full h-32" />
            </View>

            <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 items-center">
                <TouchableOpacity
                    onPress={handleCalculate}
                    className="bg-emerald-600 p-4 rounded-xl items-center shadow-lg w-full"
                    style={isTablet ? { maxWidth: 700 } : {}}
                >
                    <Text className="text-white font-bold text-xl" style={{ writingDirection }}>{t('mirath.calculate_dist')}</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default MirathInputScreen;
