import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';

const LanguageSelector = () => {
    const { t, i18n } = useTranslation();
    const [modalVisible, setModalVisible] = useState(false);

    const changeLanguage = async (lng: string) => {
        try {
            await AsyncStorage.setItem('user-language', lng);
            await i18n.changeLanguage(lng);

            const isRTL = lng === 'ar';

            if (I18nManager.isRTL !== isRTL) {
                I18nManager.allowRTL(isRTL);
                I18nManager.forceRTL(isRTL);
                // Force a reload to apply RTL changes
                await Updates.reloadAsync();
            } else {
                setModalVisible(false);
            }
        } catch (error) {
            console.log('Error changing language', error);
        }
    };

    return (
        <View>
            <TouchableOpacity
                onPress={() => setModalVisible(true)}
                className="w-10 h-10 items-center justify-center rounded-full bg-emerald-600 shadow-sm"
            >
                <Text className="text-xl">⚙️</Text>
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={[styles.modalTitle, { textAlign: 'auto', writingDirection: i18n.language === 'ar' ? 'rtl' : 'ltr' }]}>{t('settings.choose_language')}</Text>

                        <TouchableOpacity
                            style={[styles.button, i18n.language === 'en' && styles.buttonActive]}
                            onPress={() => changeLanguage('en')}
                        >
                            <Text style={[styles.textStyle, i18n.language === 'en' && styles.textStyleActive]}>
                                {t('settings.english')}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, i18n.language === 'ar' && styles.buttonActive]}
                            onPress={() => changeLanguage('ar')}
                        >
                            <Text style={[styles.textStyle, i18n.language === 'ar' && styles.textStyleActive]}>
                                {t('settings.arabic')}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.buttonClose}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.textStyleClose}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        marginBottom: 20,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    button: {
        borderRadius: 12,
        padding: 15,
        width: '100%',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    buttonActive: {
        backgroundColor: '#10B981',
        borderColor: '#10B981',
    },
    buttonClose: {
        marginTop: 15,
    },
    textStyle: {
        color: '#374151',
        fontWeight: '600',
        textAlign: 'center',
        fontSize: 16,
    },
    textStyleActive: {
        color: 'white',
    },
    textStyleClose: {
        color: '#9CA3AF',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default LanguageSelector;
