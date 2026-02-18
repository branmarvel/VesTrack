import "./global.css";
import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, SafeAreaView, TouchableOpacity, Text, ActivityIndicator, Alert, Platform } from 'react-native';
import { RateDashboard } from './components/RateDashboard';
import { AdvancedCalculator } from './components/AdvancedCalculator';
import { getAllRates, RateData } from './services/api';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Moon, Sun, Calculator, TrendingUp } from 'lucide-react-native';

const INITIAL_RATES: RateData = {
    bcv_usd: 0,
    bcv_eur: 0,
    binance_usdt_buy: 0,
    binance_usdt_sell: 0,
    last_updated: 'Nunca',
    binance_offers: [],
    binance_offers_type: 'BUY',
};

const THEME_KEY = '@vestrack_theme';

export default function App() {
    const [rates, setRates] = useState<RateData>(INITIAL_RATES);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'rates' | 'calc'>('rates');
    const [minAmount, setMinAmount] = useState<number | undefined>(undefined);
    const [offersType, setOffersType] = useState<'BUY' | 'SELL'>('BUY');
    const [customRateFromDashboard, setCustomRateFromDashboard] = useState<number | undefined>(undefined);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const viewRef = useRef(null);

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem(THEME_KEY);
            if (savedTheme !== null) {
                setIsDarkMode(savedTheme === 'dark');
            }
        } catch (e) {
            console.error('Error loading theme', e);
        }
    };

    const toggleTheme = async () => {
        try {
            const newMode = !isDarkMode;
            setIsDarkMode(newMode);
            await AsyncStorage.setItem(THEME_KEY, newMode ? 'dark' : 'light');
        } catch (e) {
            console.error('Error saving theme', e);
        }
    };

    const loadRates = async (amountFilter?: number, type: 'BUY' | 'SELL' = 'BUY') => {
        setLoading(true);
        try {
            const data = await getAllRates(amountFilter, type);
            setRates(data);
        } catch (error) {
            console.error('Error loading rates:', error);
            Alert.alert('Error', 'No se pudieron cargar las tasas. Verifica tu conexión.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRates(minAmount, offersType);
    }, [minAmount, offersType]);

    const handleCopyToCalc = (price: number) => {
        setCustomRateFromDashboard(price);
        setActiveTab('calc');
        // Minimal delay to ensure tab switched before setting custom rate if needed
        // or just rely on state props
    };

    const handleShare = async () => {
        try {
            if (viewRef.current) {
                const uri = await captureRef(viewRef.current, {
                    format: 'png',
                    quality: 0.9,
                });
                await Sharing.shareAsync(uri);
            }
        } catch (error) {
            console.error('Error sharing:', error);
            Alert.alert('Error', 'No se pudo compartir la imagen.');
        }
    };

    return (
        <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
            <StatusBar style={isDarkMode ? 'light' : 'dark'} />
            <View style={styles.appHeader}>
                <View>
                    <Text style={[styles.brandName, isDarkMode && styles.textDark]}>VesTrack</Text>
                    <Text style={[styles.tagline, isDarkMode && styles.textSecondaryDark]}>Tu dinero, tu control</Text>
                </View>
                <TouchableOpacity style={[styles.themeToggle, isDarkMode && styles.themeToggleDark]} onPress={toggleTheme}>
                    {isDarkMode ? <Sun color="#fcd34d" size={20} /> : <Moon color="#4b5563" size={20} />}
                </TouchableOpacity>
            </View>

            <ViewShot ref={viewRef} style={styles.captureContainer} options={{ format: 'png', quality: 0.9 }}>
                <View style={styles.content}>
                    {activeTab === 'rates' ? (
                        <RateDashboard
                            rates={rates}
                            loading={loading}
                            onRefresh={() => loadRates(minAmount, offersType)}
                            minAmount={minAmount}
                            onFilterChange={(amt) => setMinAmount(amt)}
                            onSetOffersType={(type) => setOffersType(type)}
                            onCopyToCalc={handleCopyToCalc}
                            isDarkMode={isDarkMode}
                        />
                    ) : (
                        <AdvancedCalculator
                            rates={rates}
                            onShare={handleShare}
                            isDarkMode={isDarkMode}
                            customRateFromDashboard={customRateFromDashboard}
                        />
                    )}
                </View>
            </ViewShot>

            <View style={[styles.tabBar, isDarkMode && styles.tabBarDark]}>
                <TouchableOpacity
                    style={styles.tabItem}
                    onPress={() => setActiveTab('rates')}
                >
                    <TrendingUp size={24} color={activeTab === 'rates' ? '#3b82f6' : (isDarkMode ? '#6b7280' : '#9ca3af')} />
                    <Text style={[
                        styles.tabLabel,
                        activeTab === 'rates' && styles.tabLabelActive,
                        isDarkMode && activeTab !== 'rates' && styles.textSecondaryDark
                    ]}>Tasas</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.tabItem}
                    onPress={() => setActiveTab('calc')}
                >
                    <Calculator size={24} color={activeTab === 'calc' ? '#3b82f6' : (isDarkMode ? '#6b7280' : '#9ca3af')} />
                    <Text style={[
                        styles.tabLabel,
                        activeTab === 'calc' && styles.tabLabelActive,
                        isDarkMode && activeTab !== 'calc' && styles.textSecondaryDark
                    ]}>Calculadora</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    containerDark: {
        backgroundColor: '#0f172a',
    },
    appHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 5,
    },
    brandName: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1e40af',
    },
    tagline: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '500',
    },
    themeToggle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    themeToggleDark: {
        backgroundColor: '#1e293b',
    },
    textDark: {
        color: '#f8fafc',
    },
    textSecondaryDark: {
        color: '#94a3b8',
    },
    captureContainer: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        paddingBottom: Platform.OS === 'ios' ? 30 : 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    tabBarDark: {
        backgroundColor: '#1e293b',
        borderTopColor: '#334155',
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
    },
    tabLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#9ca3af',
        marginTop: 4,
    },
    tabLabelActive: {
        color: '#3b82f6',
    },
});
