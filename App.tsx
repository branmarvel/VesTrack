import "./global.css";
import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, TouchableOpacity, Text, Alert, Platform } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { RateDashboard } from './components/RateDashboard';
import { AdvancedCalculator } from './components/AdvancedCalculator';
import { getAllRates, RateData } from './services/api';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Moon, Sun, Calculator, TrendingUp, Share2 } from 'lucide-react-native';

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
const RATES_CACHE_KEY = '@vestrack_rates_cache';

function MainApp() {
    const [rates, setRates] = useState<RateData>(INITIAL_RATES);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'rates' | 'calc'>('calc');
    const [minAmount, setMinAmount] = useState<number | undefined>(undefined);
    const [offersType, setOffersType] = useState<'BUY' | 'SELL'>('BUY');
    const [customRateFromDashboard, setCustomRateFromDashboard] = useState<number | undefined>(undefined);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isOffline, setIsOffline] = useState(false);
    
    const viewRef = useRef(null);
    const insets = useSafeAreaInsets();

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
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const newMode = !isDarkMode;
            setIsDarkMode(newMode);
            await AsyncStorage.setItem(THEME_KEY, newMode ? 'dark' : 'light');
        } catch (e) {
            console.error('Error saving theme', e);
        }
    };

    const loadRates = async (amountFilter?: number, type: 'BUY' | 'SELL' = 'BUY') => {
        setLoading(true);
        setIsOffline(false);
        try {
            // First try to load from cache
            const cached = await AsyncStorage.getItem(RATES_CACHE_KEY);
            if (cached) {
                setRates(JSON.parse(cached));
            }
        } catch (e) {
            console.error('Error reading cache', e);
        }

        try {
            const data = await getAllRates(amountFilter, type);
            setRates(data);
            await AsyncStorage.setItem(RATES_CACHE_KEY, JSON.stringify(data));
            setIsOffline(false);
        } catch (error) {
            console.error('Error loading rates:', error);
            setIsOffline(true);
            // Don't alert if we have cached data, just let the user see it
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRates(minAmount, offersType);
    }, [minAmount, offersType]);

    const handleCopyToCalc = (price: number) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setCustomRateFromDashboard(price);
        setActiveTab('calc');
    };

    const handleShare = async () => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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

    const switchTab = (tab: 'rates' | 'calc') => {
        if (activeTab !== tab) Haptics.selectionAsync();
        setActiveTab(tab);
    };

    return (
        <View style={[styles.container, isDarkMode && styles.containerDark]}>
            <StatusBar style={isDarkMode ? 'light' : 'dark'} />
            
            {/* Header with dynamic Safe Area padding */}
            <View style={[styles.appHeader, { paddingTop: insets.top + (Platform.OS === 'android' ? 10 : 0) }]}>
                <View>
                    <View style={styles.titleRow}>
                        <Text style={[styles.brandName, isDarkMode && styles.textDark]}>VesTrack</Text>
                        {isOffline && <View style={styles.offlineBadge}><Text style={styles.offlineText}>OFFLINE</Text></View>}
                    </View>
                    <Text style={[styles.tagline, isDarkMode && styles.textSecondaryDark]}>Tu dinero, tu control</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity style={[styles.themeToggle, isDarkMode && styles.themeToggleDark]} onPress={handleShare}>
                        <Share2 color={isDarkMode ? "#94a3b8" : "#4b5563"} size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.themeToggle, isDarkMode && styles.themeToggleDark]} onPress={toggleTheme}>
                        {isDarkMode ? <Sun color="#fcd34d" size={20} /> : <Moon color="#4b5563" size={20} />}
                    </TouchableOpacity>
                </View>
            </View>

            <ViewShot ref={viewRef} style={styles.captureContainer} options={{ format: 'png', quality: 0.9 }}>
                <View style={styles.content}>
                    {activeTab === 'rates' ? (
                        <RateDashboard
                            rates={rates}
                            loading={loading}
                            onRefresh={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                loadRates(minAmount, offersType);
                            }}
                            minAmount={minAmount}
                            onFilterChange={(amt) => setMinAmount(amt)}
                            onSetOffersType={(type) => {
                                Haptics.selectionAsync();
                                setOffersType(type);
                            }}
                            onCopyToCalc={handleCopyToCalc}
                            isDarkMode={isDarkMode}
                            isOffline={isOffline}
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

            <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 15) }, isDarkMode && styles.tabBarDark]}>
                <TouchableOpacity
                    style={styles.tabItem}
                    onPress={() => switchTab('calc')}
                >
                    <Calculator size={24} color={activeTab === 'calc' ? '#3b82f6' : (isDarkMode ? '#6b7280' : '#9ca3af')} />
                    <Text style={[
                        styles.tabLabel,
                        activeTab === 'calc' && styles.tabLabelActive,
                        isDarkMode && activeTab !== 'calc' && styles.textSecondaryDark
                    ]}>Calculadora</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.tabItem}
                    onPress={() => switchTab('rates')}
                >
                    <TrendingUp size={24} color={activeTab === 'rates' ? '#3b82f6' : (isDarkMode ? '#6b7280' : '#9ca3af')} />
                    <Text style={[
                        styles.tabLabel,
                        activeTab === 'rates' && styles.tabLabelActive,
                        isDarkMode && activeTab !== 'rates' && styles.textSecondaryDark
                    ]}>Tasas</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default function App() {
    return (
        <SafeAreaProvider>
            <MainApp />
        </SafeAreaProvider>
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
        paddingBottom: 15, // increased bottom padding
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    brandName: {
        fontSize: 26, // Slightly larger
        fontWeight: '900',
        color: '#1e40af',
    },
    offlineBadge: {
        backgroundColor: '#fef08a',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    offlineText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#b45309',
    },
    tagline: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '500',
        marginTop: 2,
    },
    themeToggle: {
        width: 44, // Larger tap target
        height: 44,
        borderRadius: 22,
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
