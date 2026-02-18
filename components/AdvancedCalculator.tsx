import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, LayoutAnimation, Platform } from 'react-native';
import { RateData } from '../services/api';
import { ArrowLeftRight, Share2, DollarSign, Euro, Landmark, RefreshCw, TrendingUp, Wallet, ArrowDownUp, Check, Info } from 'lucide-react-native';

interface AdvancedCalculatorProps {
    rates: RateData;
    onShare: () => void;
    customRateFromDashboard?: number;
    isDarkMode?: boolean;
}

export const AdvancedCalculator: React.FC<AdvancedCalculatorProps> = ({
    rates,
    onShare,
    customRateFromDashboard,
    isDarkMode = false
}) => {
    const [amount, setAmount] = useState('100');
    const [currency, setCurrency] = useState<'ves' | 'usd'>('ves');
    const [customRate, setCustomRate] = useState('');
    const [mode, setMode] = useState<'selling' | 'buying'>('selling');

    useEffect(() => {
        if (customRateFromDashboard) {
            setCustomRate(customRateFromDashboard.toString());
        }
    }, [customRateFromDashboard]);

    const activeCustomRate = parseFloat(customRate) || 0;

    // Choose appropriate Binance rate based on mode
    const binanceRate = mode === 'selling' ? rates.binance_usdt_sell : rates.binance_usdt_buy;

    const t = (light: string, dark: string) => isDarkMode ? dark : light;

    const calculate = (rate: number) => {
        const val = parseFloat(amount) || 0;
        if (currency === 'ves') {
            return rate > 0 ? (val / rate).toFixed(2) : '0.00';
        } else {
            return (val * rate).toFixed(2);
        }
    };

    return (
        <ScrollView style={[styles.container, isDarkMode && styles.containerDark]}>
            <View style={[styles.card, isDarkMode && styles.cardDark]}>
                <View style={styles.modeToggle}>
                    <TouchableOpacity
                        onPress={() => setMode('selling')}
                        style={[styles.modeBtn, mode === 'selling' && styles.modeBtnActiveSelling]}
                    >
                        <TrendingUp size={16} color={mode === 'selling' ? '#ffffff' : '#64748b'} />
                        <Text style={[styles.modeText, mode === 'selling' && styles.modeTextActive]}>Estoy Vendiendo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setMode('buying')}
                        style={[styles.modeBtn, mode === 'buying' && styles.modeBtnActiveBuying]}
                    >
                        <ArrowDownUp size={16} color={mode === 'buying' ? '#ffffff' : '#64748b'} />
                        <Text style={[styles.modeText, mode === 'buying' && styles.modeTextActive]}>Estoy Comprando</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.inputWrapper}>
                    <View style={styles.inputHeader}>
                        <Text style={[styles.label, isDarkMode && styles.textSecondaryDark]}>
                            Monto a convertir ({currency.toUpperCase()})
                        </Text>
                        <TouchableOpacity onPress={() => setCurrency(currency === 'ves' ? 'usd' : 'ves')}>
                            <Text style={styles.switchText}>Cambiar a {currency === 'ves' ? 'USD' : 'VES'}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.mainInput, isDarkMode && styles.inputDark]}>
                        {currency === 'ves' ? <Landmark size={24} color="#3b82f6" /> : <DollarSign size={24} color="#10b981" />}
                        <TextInput
                            style={[styles.inputText, isDarkMode && styles.textDark]}
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="0.00"
                            placeholderTextColor={t("#94a3b8", "#475569")}
                        />
                    </View>
                </View>

                <View style={styles.customRateSection}>
                    <Text style={[styles.label, isDarkMode && styles.textSecondaryDark]}>Tasa Personalizada (Bs)</Text>
                    <View style={[styles.smallInput, isDarkMode && styles.inputDark]}>
                        <TrendingUp size={18} color="#8b5cf6" />
                        <TextInput
                            style={[styles.smallInputText, isDarkMode && styles.textDark]}
                            keyboardType="numeric"
                            value={customRate}
                            onChangeText={setCustomRate}
                            placeholder="Ej: 65.50"
                            placeholderTextColor={t("#94a3b8", "#475569")}
                        />
                    </View>
                </View>
            </View>

            <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>Resultados Comparativos</Text>

            <View style={styles.resultsGrid}>
                {/* BCV USD */}
                <View style={[styles.resultCard, isDarkMode && styles.cardDark]}>
                    <View style={styles.resultHeader}>
                        <Text style={[styles.resultLabel, isDarkMode && styles.textSecondaryDark]}>BCV Dólar</Text>
                        <Text style={styles.miniRate}>{rates.bcv_usd.toFixed(2)}</Text>
                    </View>
                    <Text style={[styles.resultValue, isDarkMode && styles.textDark]}>
                        {calculate(rates.bcv_usd)} <Text style={styles.curr}>{currency === 'ves' ? 'USD' : 'Bs'}</Text>
                    </Text>
                </View>

                {/* BCV EUR */}
                <View style={[styles.resultCard, isDarkMode && styles.cardDark]}>
                    <View style={styles.resultHeader}>
                        <Text style={[styles.resultLabel, isDarkMode && styles.textSecondaryDark]}>BCV Euro</Text>
                        <Text style={styles.miniRate}>{rates.bcv_eur.toFixed(2)}</Text>
                    </View>
                    <Text style={[styles.resultValue, isDarkMode && styles.textDark]}>
                        {calculate(rates.bcv_eur)} <Text style={styles.curr}>{currency === 'ves' ? 'EUR' : 'Bs'}</Text>
                    </Text>
                </View>

                {/* BINANCE */}
                <View style={[styles.resultCard, styles.highlightCard, isDarkMode && styles.highlightCardDark]}>
                    <View style={styles.resultHeader}>
                        <Text style={[styles.resultLabel, { color: '#ffffff' }]}>Binance P2P</Text>
                        <Text style={[styles.miniRate, { color: '#ffffff', opacity: 0.8 }]}>{binanceRate.toFixed(2)}</Text>
                    </View>
                    <Text style={[styles.resultValue, { color: '#ffffff' }]}>
                        {calculate(binanceRate)} <Text style={[styles.curr, { color: '#ffffff', opacity: 0.8 }]}>{currency === 'ves' ? 'USDT' : 'Bs'}</Text>
                    </Text>
                </View>

                {/* CUSTOM */}
                <View style={[styles.resultCard, isDarkMode && styles.cardDark, activeCustomRate > 0 && styles.activeCustomCard]}>
                    <View style={styles.resultHeader}>
                        <Text style={[styles.resultLabel, isDarkMode && styles.textSecondaryDark]}>Tu Tasa</Text>
                        <Text style={styles.miniRate}>{activeCustomRate.toFixed(2)}</Text>
                    </View>
                    <Text style={[styles.resultValue, isDarkMode && styles.textDark]}>
                        {calculate(activeCustomRate)} <Text style={styles.curr}>{currency === 'ves' ? 'USD' : 'Bs'}</Text>
                    </Text>
                </View>
            </View>

            <View style={[styles.summaryBox, isDarkMode && styles.cardDark]}>
                <View style={styles.summaryRow}>
                    <Info size={16} color="#3b82f6" />
                    <Text style={[styles.summaryText, isDarkMode && styles.textSecondaryDark]}>
                        {currency === 'ves'
                            ? `Con ${amount} Bs obtienes ${calculate(binanceRate)} USDT en Binance.`
                            : `Al vender ${amount} USD recibes ${(parseFloat(amount) * binanceRate).toFixed(2)} Bs.`}
                    </Text>
                </View>
            </View>

            <TouchableOpacity style={styles.shareButton} onPress={onShare}>
                <Share2 color="#ffffff" size={20} />
                <Text style={styles.shareButtonText}>Compartir Todo el Análisis</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 16 },
    containerDark: { backgroundColor: '#0f172a' },
    card: {
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 24,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    cardDark: { backgroundColor: '#1e293b', borderColor: '#334155' },
    modeToggle: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 16, padding: 4, marginBottom: 20 },
    modeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12 },
    modeBtnActiveSelling: { backgroundColor: '#ef4444', elevation: 2 },
    modeBtnActiveBuying: { backgroundColor: '#3b82f6', elevation: 2 },
    modeText: { fontSize: 13, fontWeight: '700', color: '#64748b' },
    modeTextActive: { color: '#ffffff' },
    inputWrapper: { marginBottom: 20 },
    inputHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    label: { fontSize: 13, fontWeight: '700', color: '#64748b' },
    switchText: { fontSize: 12, fontWeight: '700', color: '#3b82f6' },
    mainInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', paddingHorizontal: 16, height: 64, borderRadius: 18, borderWidth: 2, borderColor: '#f1f5f9' },
    inputDark: { backgroundColor: '#0f172a', borderColor: '#334155' },
    inputText: { flex: 1, fontSize: 24, fontWeight: '900', color: '#0f172a', marginLeft: 12 },
    customRateSection: { borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 16 },
    smallInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', paddingHorizontal: 12, height: 48, borderRadius: 12, marginTop: 8 },
    smallInputText: { flex: 1, fontSize: 16, fontWeight: '700', color: '#0f172a', marginLeft: 10 },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b', marginTop: 24, marginBottom: 12, marginLeft: 4 },
    resultsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    resultCard: { width: '48%', backgroundColor: '#ffffff', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#f1f5f9' },
    highlightCard: { backgroundColor: '#3b82f6', borderColor: '#2563eb' },
    highlightCardDark: { backgroundColor: '#2563eb', borderColor: '#1d4ed8' },
    activeCustomCard: { borderColor: '#8b5cf6', backgroundColor: '#f5f3ff' },
    resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    resultLabel: { fontSize: 11, fontWeight: '700', color: '#64748b' },
    miniRate: { fontSize: 10, fontWeight: '800', color: '#94a3b8' },
    resultValue: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
    curr: { fontSize: 12, fontWeight: '700', opacity: 0.6 },
    summaryBox: { marginTop: 16, backgroundColor: '#ffffff', padding: 16, borderRadius: 18, borderWidth: 1, borderColor: '#f1f5f9' },
    summaryRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
    summaryText: { fontSize: 13, color: '#64748b', fontWeight: '500', lineHeight: 18 },
    shareButton: { backgroundColor: '#1e40af', padding: 18, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 20 },
    shareButtonText: { color: '#ffffff', fontWeight: '800', fontSize: 16 },
    textDark: { color: '#f8fafc' },
    textSecondaryDark: { color: '#94a3b8' }
});
