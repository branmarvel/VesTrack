import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { RateData } from '../services/api';
import { ArrowLeftRight, Share2, DollarSign, Euro, Landmark, RefreshCw } from 'lucide-react-native';

interface AdvancedCalculatorProps {
    rates: RateData;
    onShare: () => void;
    isDarkMode?: boolean;
}

export const AdvancedCalculator: React.FC<AdvancedCalculatorProps> = ({ rates, onShare, isDarkMode = false }) => {
    const [bsAmount, setBsAmount] = useState('100');
    const [usdAmount, setUsdAmount] = useState('');
    const [eurAmount, setEurAmount] = useState('');
    const [customRate, setCustomRate] = useState('');
    const [activeInput, setActiveInput] = useState<'ves' | 'usd' | 'eur'>('ves');

    const bcvUsd = parseFloat(customRate) || rates.bcv_usd;
    const bcvEur = rates.bcv_eur;
    const p2pBuy = rates.binance_usdt_buy;

    const t = (light: string, dark: string) => isDarkMode ? dark : light;

    useEffect(() => {
        if (activeInput === 'ves' && bsAmount) {
            const val = parseFloat(bsAmount);
            if (!isNaN(val)) {
                setUsdAmount((val / bcvUsd).toFixed(2));
                setEurAmount((val / bcvEur).toFixed(2));
            }
        }
    }, [bsAmount, bcvUsd, bcvEur]);

    const handleBsChange = (val: string) => {
        setActiveInput('ves');
        setBsAmount(val);
        const num = parseFloat(val);
        if (!isNaN(num)) {
            setUsdAmount((num / bcvUsd).toFixed(2));
            setEurAmount((num / bcvEur).toFixed(2));
        } else {
            setUsdAmount('');
            setEurAmount('');
        }
    };

    const handleUsdChange = (val: string) => {
        setActiveInput('usd');
        setUsdAmount(val);
        const num = parseFloat(val);
        if (!isNaN(num)) {
            setBsAmount((num * bcvUsd).toFixed(2));
            setEurAmount(((num * bcvUsd) / bcvEur).toFixed(2));
        } else {
            setBsAmount('');
            setEurAmount('');
        }
    };

    return (
        <ScrollView style={[styles.container, isDarkMode && styles.containerDark]}>
            <View style={[styles.card, isDarkMode && styles.cardDark]}>
                <View style={styles.header}>
                    <Text style={[styles.title, isDarkMode && styles.textDark]}>Convertidor Inteligente</Text>
                    <TouchableOpacity style={[styles.iconButton, isDarkMode && styles.iconButtonDark]} onPress={() => { setBsAmount('100'); setCustomRate(''); }}>
                        <RefreshCw size={18} color={t("#64748b", "#94a3b8")} />
                    </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={[styles.label, isDarkMode && styles.textSecondaryDark]}>Bolívares (VES)</Text>
                    <View style={[styles.inputWrapper, activeInput === 'ves' && styles.inputActive, isDarkMode && styles.inputDark]}>
                        <Landmark size={20} color={t("#64748b", "#94a3b8")} />
                        <TextInput
                            style={[styles.input, isDarkMode && styles.textDark]}
                            keyboardType="numeric"
                            value={bsAmount}
                            onChangeText={handleBsChange}
                            placeholder="0.00"
                            placeholderTextColor={t("#94a3b8", "#475569")}
                        />
                    </View>
                </View>

                <View style={styles.divider}>
                    <View style={[styles.line, isDarkMode && styles.lineDark]} />
                    <View style={[styles.swapIcon, isDarkMode && styles.cardDark]}>
                        <ArrowLeftRight size={16} color="#3b82f6" />
                    </View>
                    <View style={[styles.line, isDarkMode && styles.lineDark]} />
                </View>

                <View style={styles.row}>
                    <View style={styles.column}>
                        <Text style={[styles.label, isDarkMode && styles.textSecondaryDark]}>Dólares (USD)</Text>
                        <View style={[styles.inputWrapper, activeInput === 'usd' && styles.inputActive, isDarkMode && styles.inputDark]}>
                            <DollarSign size={20} color={t("#64748b", "#94a3b8")} />
                            <TextInput
                                style={[styles.input, isDarkMode && styles.textDark]}
                                keyboardType="numeric"
                                value={usdAmount}
                                onChangeText={handleUsdChange}
                                placeholder="0.00"
                                placeholderTextColor={t("#94a3b8", "#475569")}
                            />
                        </View>
                    </View>
                    <View style={styles.column}>
                        <Text style={[styles.label, isDarkMode && styles.textSecondaryDark]}>Euros (EUR)</Text>
                        <View style={[styles.inputWrapper, isDarkMode && styles.inputDark]}>
                            <Euro size={20} color={t("#64748b", "#94a3b8")} />
                            <TextInput
                                style={[styles.input, isDarkMode && styles.textDark]}
                                keyboardType="numeric"
                                value={eurAmount}
                                editable={false}
                                placeholder="0.00"
                                placeholderTextColor={t("#94a3b8", "#475569")}
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.customRateGroup}>
                    <Text style={[styles.label, isDarkMode && styles.textSecondaryDark]}>Tasa de Referencia (Opcional)</Text>
                    <TextInput
                        style={[styles.smallInput, isDarkMode && styles.inputDark, isDarkMode && styles.textDark]}
                        placeholder={`Actual: ${rates.bcv_usd.toFixed(2)} Bs`}
                        placeholderTextColor={t("#94a3b8", "#475569")}
                        keyboardType="numeric"
                        value={customRate}
                        onChangeText={setCustomRate}
                    />
                </View>
            </View>

            <View style={[styles.summaryCard, isDarkMode && styles.cardDark]}>
                <Text style={[styles.summaryTitle, isDarkMode && styles.textDark]}>Análisis de Cambio</Text>
                <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, isDarkMode && styles.textSecondaryDark]}>Si vendes esos USD en P2P:</Text>
                    <Text style={styles.summaryValue}>{(parseFloat(usdAmount || '0') * p2pBuy).toFixed(2)} Bs</Text>
                </View>
                <Text style={styles.summaryNote}>* Usando precio de compra P2P: {p2pBuy.toFixed(2)} Bs</Text>
            </View>

            <TouchableOpacity style={styles.shareButton} onPress={onShare}>
                <Share2 color="#ffffff" size={20} />
                <Text style={styles.shareButtonText}>Compartir Cálculo</Text>
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
    cardDark: {
        backgroundColor: '#1e293b',
        borderColor: '#334155',
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
    iconButton: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center' },
    iconButtonDark: { backgroundColor: '#0f172a' },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 13, fontWeight: '600', color: '#64748b', marginBottom: 8 },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        paddingHorizontal: 14,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'transparent'
    },
    inputDark: { backgroundColor: '#0f172a', borderColor: '#334155' },
    inputActive: { borderColor: '#3b82f6', backgroundColor: '#ffffff' },
    input: { flex: 1, height: 50, fontSize: 18, fontWeight: '700', color: '#0f172a', marginLeft: 10 },
    divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
    line: { flex: 1, height: 1.5, backgroundColor: '#f1f5f9' },
    lineDark: { backgroundColor: '#334155' },
    swapIcon: { padding: 8, backgroundColor: '#ffffff', borderRadius: 10, borderWidth: 1, borderColor: '#f1f5f9' },
    row: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    column: { flex: 1 },
    customRateGroup: { marginTop: 8, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    smallInput: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, fontSize: 14, fontWeight: '600', color: '#0f172a' },
    summaryCard: { backgroundColor: '#eff6ff', marginTop: 16, padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#dbeafe' },
    summaryTitle: { fontSize: 16, fontWeight: '700', color: '#1e40af', marginBottom: 12 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    summaryLabel: { fontSize: 14, color: '#1e40af' },
    summaryValue: { fontSize: 18, fontWeight: '800', color: '#1e40af' },
    summaryNote: { fontSize: 11, color: '#60a5fa', fontStyle: 'italic' },
    shareButton: { backgroundColor: '#1e40af', padding: 18, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 16 },
    shareButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 16 },
    textDark: { color: '#f8fafc' },
    textSecondaryDark: { color: '#94a3b8' },
});
