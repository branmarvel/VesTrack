import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput, Linking, Platform, LayoutAnimation } from 'react-native';
import * as Haptics from 'expo-haptics';
import { RateData } from '../services/api';
import { TrendingUp, TrendingDown, Clock, Info, Filter, Copy, ExternalLink, ArrowRight } from 'lucide-react-native';

interface RateDashboardProps {
    rates: RateData;
    loading: boolean;
    onRefresh: () => void;
    minAmount?: number;
    onFilterChange: (amount: number | undefined) => void;
    onSetOffersType: (type: 'BUY' | 'SELL') => void;
    onCopyToCalc: (rate: number) => void;
    isDarkMode?: boolean;
    isOffline?: boolean;
}

export const RateDashboard: React.FC<RateDashboardProps> = ({
    rates,
    loading,
    onRefresh,
    minAmount,
    onFilterChange,
    onSetOffersType,
    onCopyToCalc,
    isDarkMode = false,
    isOffline = false
}) => {
    const [localMinAmount, setLocalMinAmount] = useState(minAmount?.toString() || '');
    const t = (light: string, dark: string) => isDarkMode ? dark : light;

    const handleFilterSubmit = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const val = parseFloat(localMinAmount);
        onFilterChange(isNaN(val) ? undefined : val);
    };

    const handleToggle = (type: 'BUY' | 'SELL') => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        onSetOffersType(type);
    };

    const openBinance = (price: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const url = 'https://p2p.binance.com/es-LA/trade/' + (rates.binance_offers_type === 'BUY' ? 'sell' : 'buy') + '/USDT?fiat=VES&payment=ALL';
        Linking.openURL(url);
    };

    return (
        <ScrollView
            style={[styles.container, isDarkMode && styles.containerDark]}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
        >
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>Banco Central (Oficial)</Text>
                <View style={styles.lastUpdated}>
                    <Clock size={12} color={t("#64748b", "#94a3b8")} />
                    <Text style={[styles.updatedText, isDarkMode && styles.textSecondaryDark]}>{rates.last_updated}</Text>
                </View>
            </View>

            <View style={styles.grid}>
                <View style={[styles.card, styles.primaryCard, isDarkMode && styles.cardDark]}>
                    <Text style={[styles.cardLabel, isDarkMode && styles.textSecondaryDark]}>USD (Dólar)</Text>
                    <Text style={[styles.cardValue, isDarkMode && styles.textDark]}>{rates.bcv_usd > 0 ? rates.bcv_usd.toFixed(2) : '---'} Bs</Text>
                    <View style={styles.badge}>
                        <TrendingUp size={14} color="#10b981" />
                        <Text style={styles.badgeText}>BCV</Text>
                    </View>
                </View>
                <View style={[styles.card, isDarkMode && styles.cardDark]}>
                    <Text style={[styles.cardLabel, isDarkMode && styles.textSecondaryDark]}>EUR (Euro)</Text>
                    <Text style={[styles.cardValue, isDarkMode && styles.textDark]}>{rates.bcv_eur > 0 ? rates.bcv_eur.toFixed(2) : '---'} Bs</Text>
                    <View style={styles.badge}>
                        <TrendingUp size={14} color="#10b981" />
                        <Text style={styles.badgeText}>BCV</Text>
                    </View>
                </View>
            </View>

            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>Binance P2P</Text>
                <View style={styles.p2pToggle}>
                    <TouchableOpacity
                        onPress={() => handleToggle('BUY')}
                        style={[styles.toggleBtn, rates.binance_offers_type === 'BUY' && styles.toggleBtnActive]}
                    >
                        <Text style={[styles.toggleText, rates.binance_offers_type === 'BUY' && styles.toggleTextActive]}>Compra</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleToggle('SELL')}
                        style={[styles.toggleBtn, rates.binance_offers_type === 'SELL' && styles.toggleBtnActive]}
                    >
                        <Text style={[styles.toggleText, rates.binance_offers_type === 'SELL' && styles.toggleTextActive]}>Venta</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={[styles.filterContainer, isDarkMode && styles.filterContainerDark]}>
                <Text style={[styles.filterLabel, isDarkMode && styles.textSecondaryDark]}>Filtrar por monto mínimo (Bs):</Text>
                <View style={styles.filterRow}>
                    <TextInput
                        style={[styles.filterInput, isDarkMode && styles.filterInputDark, isDarkMode && styles.textDark]}
                        placeholder="Ej: 500"
                        placeholderTextColor={t("#94a3b8", "#475569")}
                        keyboardType="numeric"
                        value={localMinAmount}
                        onChangeText={setLocalMinAmount}
                        onBlur={handleFilterSubmit}
                    />
                    <TouchableOpacity style={styles.filterApply} onPress={handleFilterSubmit}>
                        <ArrowRight size={18} color="#ffffff" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={[styles.p2pSummary, isDarkMode && styles.cardDark]}>
                <View style={styles.p2pRow}>
                    <View style={styles.p2pCol}>
                        <Text style={[styles.cardLabel, isDarkMode && styles.textSecondaryDark]}>Pagas (Compra)</Text>
                        <Text style={[styles.p2pValue, { color: '#ef4444' }]}>{rates.binance_usdt_buy.toFixed(2)}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.p2pCol}>
                        <Text style={[styles.cardLabel, isDarkMode && styles.textSecondaryDark]}>Recibes (Venta)</Text>
                        <Text style={[styles.p2pValue, { color: '#10b981' }]}>{rates.binance_usdt_sell.toFixed(2)}</Text>
                    </View>
                </View>
            </View>

            <Text style={[styles.subTitle, isDarkMode && styles.textDark]}>
                Mejores Ofertas para {rates.binance_offers_type === 'BUY' ? 'Comprar' : 'Vender'}
            </Text>

            {rates.binance_offers.length === 0 && !loading && (
                <View style={styles.emptyState}>
                    <Info size={24} color={t("#94a3b8", "#475569")} />
                    <Text style={[styles.emptyText, isDarkMode && styles.textSecondaryDark]}>No hay ofertas para este monto.</Text>
                </View>
            )}

            {rates.binance_offers.map((offer, index) => (
                <View key={index} style={[styles.offerCard, isDarkMode && styles.cardDark]}>
                    <View style={styles.offerHeader}>
                        <View>
                            <Text style={[styles.advertiser, isDarkMode && styles.textDark]}>{offer.advertiser}</Text>
                            <Text style={[styles.limitText, isDarkMode && styles.textSecondaryDark]}>Lím: {offer.minAmount} - {offer.maxAmount} Bs</Text>
                        </View>
                        <Text style={[styles.offerPrice, { color: rates.binance_offers_type === 'BUY' ? '#ef4444' : '#10b981' }]}>
                            {offer.price.toFixed(2)}
                        </Text>
                    </View>
                    <View style={styles.offerActions}>
                        <TouchableOpacity
                            style={[styles.actionBtn, isDarkMode && styles.actionBtnDark]}
                            onPress={() => onCopyToCalc(offer.price)}
                        >
                            <Copy size={16} color="#3b82f6" />
                            <Text style={styles.actionText}>Usar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionBtn, isDarkMode && styles.actionBtnDark]}
                            onPress={() => openBinance(offer.price)}
                        >
                            <ExternalLink size={16} color={t("#64748b", "#94a3b8")} />
                            <Text style={[styles.actionText, { color: t("#64748b", "#94a3b8") }]}>Binance</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ))}

            <View style={{ height: 60 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    containerDark: { backgroundColor: '#0f172a' },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 8 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
    lastUpdated: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    updatedText: { fontSize: 11, color: '#64748b', fontWeight: '500' },
    grid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    card: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 14,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        elevation: 1
    },
    cardDark: { backgroundColor: '#1e293b', borderColor: '#334155' },
    primaryCard: { borderColor: '#dbeafe', backgroundColor: '#f0f9ff' },
    cardLabel: { fontSize: 11, fontWeight: '700', color: '#64748b', marginBottom: 4, textTransform: 'uppercase' },
    cardValue: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
    badge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
    badgeText: { fontSize: 10, fontWeight: '800', color: '#059669' },
    p2pToggle: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 12, padding: 4 },
    toggleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    toggleBtnActive: { backgroundColor: '#ffffff', elevation: 2 },
    toggleText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
    toggleTextActive: { color: '#3b82f6' },
    filterContainer: { marginBottom: 20, backgroundColor: '#ffffff', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#f1f5f9' },
    filterContainerDark: { backgroundColor: '#1e293b', borderColor: '#334155' },
    filterLabel: { fontSize: 12, fontWeight: '600', color: '#64748b', marginBottom: 10 },
    filterRow: { flexDirection: 'row', gap: 10 },
    filterInput: { flex: 1, backgroundColor: '#f8fafc', height: 44, borderRadius: 12, paddingHorizontal: 14, fontSize: 15, fontWeight: '600' },
    filterInputDark: { backgroundColor: '#0f172a' },
    filterApply: { width: 44, height: 44, backgroundColor: '#3b82f6', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    p2pSummary: { backgroundColor: '#ffffff', borderRadius: 24, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#f1f5f9' },
    p2pRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    p2pCol: { flex: 1, alignItems: 'center' },
    divider: { width: 1, height: 30, backgroundColor: '#f1f5f9' },
    p2pValue: { fontSize: 22, fontWeight: '900' },
    subTitle: { fontSize: 15, fontWeight: '800', color: '#1e293b', marginBottom: 12 },
    offerCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#f1f5f9' },
    offerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    advertiser: { fontSize: 14, fontWeight: '700', color: '#334155', marginBottom: 2 },
    offerPrice: { fontSize: 18, fontWeight: '900' },
    limitText: { fontSize: 11, color: '#94a3b8' },
    offerActions: { flexDirection: 'row', gap: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10 },
    actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#f8fafc', paddingVertical: 8, borderRadius: 10 },
    actionBtnDark: { backgroundColor: '#0f172a' },
    actionText: { fontSize: 12, fontWeight: '700', color: '#3b82f6' },
    textDark: { color: '#f8fafc' },
    textSecondaryDark: { color: '#94a3b8' },
    emptyState: { padding: 40, alignItems: 'center', gap: 10 },
    emptyText: { color: '#94a3b8', fontSize: 14, fontWeight: '500' }
});
