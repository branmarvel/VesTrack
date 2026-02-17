import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { RateData } from '../services/api';
import { TrendingUp, TrendingDown, Clock, Info, Filter } from 'lucide-react-native';

interface RateDashboardProps {
    rates: RateData;
    loading: boolean;
    onRefresh: () => void;
    minAmount?: number;
    onFilterChange: (amount: number | undefined) => void;
    isDarkMode?: boolean;
}

export const RateDashboard: React.FC<RateDashboardProps> = ({
    rates,
    loading,
    onRefresh,
    minAmount,
    onFilterChange,
    isDarkMode = false
}) => {
    const t = (light: string, dark: string) => isDarkMode ? dark : light;

    return (
        <ScrollView
            style={[styles.container, isDarkMode && styles.containerDark]}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
        >
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>Tasas Oficiales (BCV)</Text>
                <View style={styles.lastUpdated}>
                    <Clock size={12} color={t("#64748b", "#94a3b8")} />
                    <Text style={[styles.updatedText, isDarkMode && styles.textSecondaryDark]}>{rates.last_updated}</Text>
                </View>
            </View>

            <View style={styles.grid}>
                <View style={[styles.card, styles.primaryCard, isDarkMode && styles.cardDark]}>
                    <Text style={[styles.cardLabel, isDarkMode && styles.textSecondaryDark]}>Dólar (USD)</Text>
                    <Text style={[styles.cardValue, isDarkMode && styles.textDark]}>{rates.bcv_usd.toFixed(2)} Bs</Text>
                    <View style={styles.badge}>
                        <TrendingUp size={14} color="#10b981" />
                        <Text style={styles.badgeText}>Oficial</Text>
                    </View>
                </View>
                <View style={[styles.card, isDarkMode && styles.cardDark]}>
                    <Text style={[styles.cardLabel, isDarkMode && styles.textSecondaryDark]}>Euro (EUR)</Text>
                    <Text style={[styles.cardValue, isDarkMode && styles.textDark]}>{rates.bcv_eur.toFixed(2)} Bs</Text>
                </View>
            </View>

            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>Mercado P2P (Binance)</Text>
                <TouchableOpacity onPress={() => onFilterChange(minAmount ? undefined : 100)}>
                    <Filter size={18} color={minAmount ? "#3b82f6" : (isDarkMode ? "#94a3b8" : "#64748b")} />
                </TouchableOpacity>
            </View>

            <View style={[styles.p2pCard, isDarkMode && styles.cardDark]}>
                <View style={styles.p2pRow}>
                    <View>
                        <Text style={[styles.cardLabel, isDarkMode && styles.textSecondaryDark]}>Venta (Recibes)</Text>
                        <Text style={[styles.p2pValue, isDarkMode && styles.textDark]}>{rates.binance_usdt_sell.toFixed(2)} Bs</Text>
                    </View>
                    <View style={styles.divider} />
                    <View>
                        <Text style={[styles.cardLabel, isDarkMode && styles.textSecondaryDark]}>Compra (Pagas)</Text>
                        <Text style={[styles.p2pValue, isDarkMode && styles.textDark]}>{rates.binance_usdt_buy.toFixed(2)} Bs</Text>
                    </View>
                </View>
            </View>

            <Text style={[styles.subTitle, isDarkMode && styles.textDark]}>Mejores Ofertas P2P</Text>
            {rates.binance_offers.map((offer, index) => (
                <View key={index} style={[styles.offerCard, isDarkMode && styles.cardDark]}>
                    <View style={styles.offerHeader}>
                        <Text style={[styles.advertiser, isDarkMode && styles.textDark]}>{offer.advertiser}</Text>
                        <Text style={styles.offerPrice}>{offer.price.toFixed(2)} Bs</Text>
                    </View>
                    <View style={styles.offerDetails}>
                        <Text style={[styles.limitText, isDarkMode && styles.textSecondaryDark]}>Límites: {offer.minAmount} - {offer.maxAmount} VES</Text>
                    </View>
                </View>
            ))}

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    containerDark: { backgroundColor: '#0f172a' },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, marginTop: 10 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
    lastUpdated: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    updatedText: { fontSize: 11, color: '#64748b', fontWeight: '500' },
    grid: { flexDirection: 'row', gap: 15, marginBottom: 25 },
    card: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 20,
        boxShadow: '0px 4px 6px rgba(0,0,0,0.02)', // RN handle this via shadowing usually, but we keep it for reference
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    cardDark: { backgroundColor: '#1e293b', borderColor: '#334155' },
    primaryCard: { borderColor: '#dbeafe', backgroundColor: '#f0f9ff' },
    cardLabel: { fontSize: 12, fontWeight: '600', color: '#64748b', marginBottom: 6 },
    cardValue: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
    badge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
    badgeText: { fontSize: 10, fontWeight: '700', color: '#059669', textTransform: 'uppercase' },
    p2pCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 20, marginBottom: 25, borderWidth: 1, borderColor: '#f1f5f9' },
    p2pRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
    divider: { width: 1, height: 40, backgroundColor: '#f1f5f9' },
    p2pValue: { fontSize: 22, fontWeight: '900', color: '#3b82f6' },
    subTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 12 },
    offerCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#f1f5f9' },
    offerHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    advertiser: { fontSize: 14, fontWeight: '600', color: '#334155' },
    offerPrice: { fontSize: 16, fontWeight: '800', color: '#10b981' },
    offerDetails: { flexDirection: 'row', justifyContent: 'space-between' },
    limitText: { fontSize: 11, color: '#94a3b8' },
    textDark: { color: '#f8fafc' },
    textSecondaryDark: { color: '#94a3b8' },
});
