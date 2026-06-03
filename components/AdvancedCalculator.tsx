import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, LayoutAnimation, Modal } from 'react-native';
import { RateData } from '../services/api';
import { ArrowLeftRight, Share2, DollarSign, Euro, Landmark, TrendingUp, ArrowDownUp, Info, X } from 'lucide-react-native';
import { Numpad } from './Numpad';
import * as Haptics from 'expo-haptics';
import { convertCurrency, CurrencyType, RateSourceType } from '../utils/currency';

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
    const [amount, setAmount] = useState('0');
    const [currency, setCurrency] = useState<CurrencyType>('ves');
    const [customRate, setCustomRate] = useState('');
    const [mode, setMode] = useState<'selling' | 'buying'>('selling');
    const [activeInput, setActiveInput] = useState<'amount' | 'rate'>('amount');
    
    // Modal State
    const [selectedRate, setSelectedRate] = useState<{ 
        id: 'binance' | 'bcv_usd' | 'bcv_eur' | 'custom';
        label: string;
        primaryRate: number;
    } | null>(null);

    useEffect(() => {
        if (customRateFromDashboard) {
            setCustomRate(customRateFromDashboard.toString());
        }
    }, [customRateFromDashboard]);

    const activeCustomRate = parseFloat(customRate) || 0;
    const binanceRate = mode === 'selling' ? rates.binance_usdt_sell : rates.binance_usdt_buy;
    const numericalAmount = parseFloat(amount) || 0;

    const t = (light: string, dark: string) => isDarkMode ? dark : light;

    // Core conversion function using the pure modular utility
    const convert = (val: number, base: CurrencyType, target: CurrencyType, via: RateSourceType) => {
        return convertCurrency(val, base, target, via, rates, activeCustomRate, binanceRate);
    };

    const handleModeSwitch = (newMode: 'selling' | 'buying') => {
        Haptics.selectionAsync();
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setMode(newMode);
    };

    const handleCurrencySwitch = (c: CurrencyType) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setCurrency(c);
    };

    const handleNumpadChange = (val: string) => {
        if (activeInput === 'amount') {
            setAmount(val);
        } else {
            setCustomRate(val);
        }
    };

    const getPrimaryTarget = (id: 'binance'|'bcv_usd'|'bcv_eur'|'custom'): CurrencyType => {
        if (currency === 'ves') return id === 'bcv_eur' ? 'eur' : 'usd';
        if (currency === 'usd') return id === 'bcv_eur' ? 'eur' : 'ves';
        if (currency === 'eur') return id === 'bcv_eur' ? 'ves' : 'usd'; // from EUR
        return 'ves';
    };

    // Card Renderer
    const renderCard = (id: 'binance'|'bcv_usd'|'bcv_eur'|'custom', label: string, rateVal: number, highlight: boolean = false) => {
        if (id === 'custom' && rateVal <= 0) return null;
        if ((id === 'binance' || id === 'bcv_usd' || id === 'bcv_eur') && rateVal <= 0) return null; // Safe guard

        const targetCur = getPrimaryTarget(id);
        const resultVal = convert(numericalAmount, currency, targetCur, id);

        return (
            <TouchableOpacity 
                style={[
                    styles.resultCard, 
                    highlight && styles.highlightCard, 
                    isDarkMode && !highlight && styles.cardDark,
                    isDarkMode && highlight && styles.highlightCardDark,
                    id === 'custom' && activeCustomRate > 0 && styles.activeCustomCard
                ]}
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedRate({ id, label, primaryRate: rateVal });
                }}
                activeOpacity={0.7}
                key={id}
            >
                <View style={styles.resultHeader}>
                    <Text style={[styles.resultLabel, highlight && { color: '#ffffff' }, isDarkMode && !highlight && styles.textSecondaryDark]}>{label}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        {id !== 'bcv_usd' && id !== 'bcv_eur' && rateVal > rates.bcv_usd && rates.bcv_usd > 0 && (
                            <Text style={{ fontSize: 9, fontWeight: '800', color: highlight ? '#bae6fd' : '#ef4444' }}>
                                +{(((rateVal - rates.bcv_usd) / rates.bcv_usd) * 100).toFixed(2)}%
                            </Text>
                        )}
                        <Text style={[styles.miniRate, highlight && { color: '#ffffff', opacity: 0.8 }]}>{rateVal.toFixed(2)}</Text>
                    </View>
                </View>
                <Text style={[styles.resultValue, highlight && { color: '#ffffff' }, isDarkMode && !highlight && styles.textDark]} numberOfLines={1}>
                    {resultVal.toFixed(2)} <Text style={[styles.curr, highlight && { color: '#ffffff', opacity: 0.8 }]}>{targetCur === 'ves' ? 'Bs' : targetCur.toUpperCase()}</Text>
                </Text>
            </TouchableOpacity>
        );
    };

    const renderModalCrossRates = () => {
        if (!selectedRate) return null;
        const id = selectedRate.id;
        const targetCur = getPrimaryTarget(id);
        const resultVal = convert(numericalAmount, currency, targetCur, id);

        const curSymbol = (c: CurrencyType) => c === 'ves' ? 'Bs' : (c === 'usd' ? (selectedRate.id === 'binance' ? 'USDT' : 'USD') : 'EUR');

        return (
            <View style={styles.modalBody}>
                <View style={styles.modalRateRow}>
                    <View>
                        <Text style={[styles.modalLabel, isDarkMode && styles.textSecondaryDark]}>Has seleccionado:</Text>
                        <Text style={[styles.modalSource, isDarkMode && styles.textDark]}>{selectedRate.label}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end'}}>
                        <View style={styles.modalRateBadge}>
                            <Text style={styles.modalRateVal}>{selectedRate.primaryRate.toFixed(2)} Bs</Text>
                        </View>
                        {selectedRate.id !== 'bcv_usd' && selectedRate.id !== 'bcv_eur' && selectedRate.primaryRate > rates.bcv_usd && rates.bcv_usd > 0 && (
                            <Text style={{ fontSize: 11, fontWeight: '700', color: '#ef4444', marginTop: 4 }}>
                                Brecha BCV: +{(((selectedRate.primaryRate - rates.bcv_usd) / rates.bcv_usd) * 100).toFixed(2)}%
                            </Text>
                        )}
                    </View>
                </View>

                <View style={styles.modalMathBox}>
                    <Text style={styles.modalMathText}>
                        Transformación Principal:
                    </Text>
                    <Text style={[styles.modalConclusion, { marginBottom: 16 }]}>
                        <Text style={styles.boldText}>{numericalAmount} {currency.toUpperCase()}</Text> equivalen a <Text style={styles.boldText}>{resultVal.toFixed(2)} {curSymbol(targetCur)}</Text>
                    </Text>

                    {/* Cross Rates */}
                    <Text style={styles.modalMathText}>
                        ¿Qué más significa esto? Los <Text style={{fontWeight: '900', color: '#0f172a'}}>{resultVal.toFixed(2)} {curSymbol(targetCur)}</Text> equivalen a:
                    </Text>

                    {/* Show what the target currency converts to in other scopes */}
                    <View style={styles.crossRatesList}>
                        {(['binance', 'bcv_usd', 'bcv_eur', 'custom'] as const).map(rateId => {
                            if (id === rateId) return null;
                            if (rateId === 'binance' && binanceRate <= 0) return null;
                            if (rateId === 'bcv_usd' && rates.bcv_usd <= 0) return null;
                            if (rateId === 'bcv_eur' && rates.bcv_eur <= 0) return null;
                            if (rateId === 'custom' && activeCustomRate <= 0) return null;

                            const nativeCur = rateId === 'bcv_eur' ? 'eur' : 'usd';
                            const crossTargetCur = targetCur === nativeCur ? 'ves' : nativeCur;
                            const crossVal = convert(resultVal, targetCur, crossTargetCur, rateId);

                            const getLabel = (rId: string) => {
                                if (rId === 'binance') return 'en Binance P2P';
                                if (rId === 'bcv_usd') return 'a tasa oficial BCV Dólar';
                                if (rId === 'bcv_eur') return 'a tasa oficial BCV Euro';
                                return 'a Tu Tasa';
                            };

                            return (
                                <Text key={rateId} style={styles.crossRateItem}>
                                    • <Text style={styles.boldText}>{crossVal.toFixed(2)} {curSymbol(crossTargetCur)}</Text> {getLabel(rateId)}.
                                </Text>
                            );
                        })}
                    </View>
                </View>
                
                {id === 'binance' && (
                    <Text style={[styles.modalHint, isDarkMode && styles.textSecondaryDark]}>
                        Nota: La tasa Binance reflejada corresponde a tu modo seleccionado ({mode === 'selling' ? 'Vender USD' : 'Comprar USD'}).
                    </Text>
                )}
            </View>
        );
    };

    return (
        <View style={[styles.container, isDarkMode && styles.containerDark]}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={[styles.card, isDarkMode && styles.cardDark]}>
                    <Text style={[styles.modeTitle, isDarkMode && styles.textSecondaryDark]}>¿Cuál moneda tienes a la mano?</Text>
                    <View style={styles.segmentControl}>
                        {(['ves', 'usd', 'eur'] as CurrencyType[]).map((c) => (
                            <TouchableOpacity
                                key={c}
                                onPress={() => handleCurrencySwitch(c)}
                                style={[styles.segmentBtn, currency === c && styles.segmentBtnActive]}
                            >
                                <Text style={[styles.segmentText, currency === c && styles.segmentTextActive]}>
                                    {c === 'ves' ? '🇻🇪 VES' : (c === 'usd' ? '🇺🇸 USD' : '🇪🇺 EUR')}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={[styles.modeTitle, isDarkMode && styles.textSecondaryDark, { marginTop: 8 }]}>Rol en el mercado callejero</Text>
                    <View style={styles.modeToggle}>
                        <TouchableOpacity
                            onPress={() => handleModeSwitch('selling')}
                            style={[styles.modeBtn, mode === 'selling' && styles.modeBtnActiveSelling]}
                        >
                            <TrendingUp size={16} color={mode === 'selling' ? '#ffffff' : '#64748b'} />
                            <Text style={[styles.modeText, mode === 'selling' && styles.modeTextActive]}>Tasa Venta</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleModeSwitch('buying')}
                            style={[styles.modeBtn, mode === 'buying' && styles.modeBtnActiveBuying]}
                        >
                            <ArrowDownUp size={16} color={mode === 'buying' ? '#ffffff' : '#64748b'} />
                            <Text style={[styles.modeText, mode === 'buying' && styles.modeTextActive]}>Tasa Compra</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Display Screens */}
                    <View style={styles.displayArea}>
                        <TouchableOpacity 
                            style={[styles.inputScreen, activeInput === 'amount' && styles.activeScreen, isDarkMode && styles.inputDark]} 
                            onPress={() => setActiveInput('amount')}
                            activeOpacity={0.8}
                        >
                            <View style={styles.inputHeader}>
                                <Text style={[styles.label, isDarkMode && styles.textSecondaryDark]}>
                                    Monto a ingresar ({currency.toUpperCase()})
                                </Text>
                            </View>
                            <Text style={[styles.amountText, isDarkMode && styles.textDark]}>
                                {amount === '0' || amount === '' ? '0.00' : amount}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.inputScreen, styles.smallScreen, activeInput === 'rate' && styles.activeScreen, isDarkMode && styles.inputDark]} 
                            onPress={() => setActiveInput('rate')}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.label, isDarkMode && styles.textSecondaryDark]}>Tasa Custom</Text>
                            <Text style={[styles.rateText, isDarkMode && styles.textDark]}>
                                {customRate || '0.00'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Results Grid */}
                <View style={styles.resultsGrid}>
                    {renderCard('binance', 'Binance P2P', binanceRate, true)}
                    {renderCard('bcv_usd', 'BCV Dólar', rates.bcv_usd)}
                    {renderCard('bcv_eur', 'BCV Euro', rates.bcv_eur)}
                    {renderCard('custom', 'Tu Tasa', activeCustomRate)}

                </View>
            </ScrollView>

            {/* Numpad fixed at the bottom OUTSIDE the ScrollView */}
            <View style={styles.numpadWrapper}>
                <Numpad 
                    value={activeInput === 'amount' ? amount : customRate} 
                    onChange={handleNumpadChange} 
                    isDarkMode={isDarkMode} 
                />
            </View>

            {/* Interactive Details Modal */}
            <Modal
                visible={selectedRate !== null}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setSelectedRate(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, isDarkMode && styles.modalContentDark]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, isDarkMode && styles.textDark]}>Análisis de Conversión</Text>
                            <TouchableOpacity onPress={() => setSelectedRate(null)} style={styles.closeBtn}>
                                <X size={24} color={t("#64748b", "#94a3b8")} />
                            </TouchableOpacity>
                        </View>
                        
                        {renderModalCrossRates()}

                        <TouchableOpacity style={styles.modalActionBtn} onPress={() => setSelectedRate(null)}>
                            <Text style={styles.modalActionText}>Entendido</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    containerDark: { backgroundColor: '#0f172a' },
    scrollContent: { padding: 12, paddingBottom: 16, flexGrow: 1, justifyContent: 'flex-start' },
    card: {
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 24,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        marginBottom: 16,
    },
    cardDark: { backgroundColor: '#1e293b', borderColor: '#334155' },
    modeTitle: { fontSize: 11, fontWeight: '700', color: '#64748b', marginBottom: 8, paddingLeft: 4, textTransform: 'uppercase' },
    
    segmentControl: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 16, padding: 4, marginBottom: 12 },
    segmentBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
    segmentBtnActive: { backgroundColor: '#ffffff', elevation: 2, shadowColor: '#000', shadowOffset: { width:0, height:1 }, shadowOpacity: 0.1, shadowRadius: 2 },
    segmentText: { fontSize: 14, fontWeight: '700', color: '#64748b' },
    segmentTextActive: { color: '#0f172a' },

    modeToggle: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 16, padding: 4, marginBottom: 16 },
    modeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12 },
    modeBtnActiveSelling: { backgroundColor: '#ef4444', elevation: 2 },
    modeBtnActiveBuying: { backgroundColor: '#3b82f6', elevation: 2 },
    modeText: { fontSize: 13, fontWeight: '700', color: '#64748b' },
    modeTextActive: { color: '#ffffff' },
    
    displayArea: { flexDirection: 'row', marginTop: 12, gap: 8 },
    inputScreen: { 
        flex: 2, 
        backgroundColor: '#f8fafc', 
        borderRadius: 16, 
        padding: 12, 
        borderWidth: 2, 
        borderColor: 'transparent' 
    },
    smallScreen: { flex: 1 },
    activeScreen: { borderColor: '#3b82f6', backgroundColor: '#eff6ff' },
    inputDark: { backgroundColor: '#0f172a' },
    inputHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    label: { fontSize: 11, fontWeight: '700', color: '#64748b' },
    amountText: { fontSize: 26, fontWeight: '900', color: '#0f172a' },
    rateText: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginTop: 8 },
    
    resultsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    resultCard: { width: '48%', backgroundColor: '#ffffff', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9' },
    highlightCard: { backgroundColor: '#3b82f6', borderColor: '#2563eb' },
    highlightCardDark: { backgroundColor: '#2563eb', borderColor: '#1d4ed8' },
    activeCustomCard: { borderColor: '#8b5cf6', backgroundColor: '#f5f3ff' },
    resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    resultLabel: { fontSize: 11, fontWeight: '700', color: '#64748b' },
    miniRate: { fontSize: 10, fontWeight: '800', color: '#94a3b8' },
    resultValue: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
    curr: { fontSize: 12, fontWeight: '700', opacity: 0.6 },
    
    shareBtn: { width: '100%', flexDirection: 'row', backgroundColor: '#dbeafe', padding: 14, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 4 },
    shareBtnDark: { backgroundColor: '#1e3a8a' },

    numpadWrapper: { paddingHorizontal: 16, paddingBottom: 16, backgroundColor: 'transparent' },
    
    /* Modal Styles */
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { width: '100%', backgroundColor: '#ffffff', borderRadius: 24, padding: 24, elevation: 5 },
    modalContentDark: { backgroundColor: '#1e293b' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
    closeBtn: { padding: 4 },
    modalBody: { marginBottom: 24 },
    modalRateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalLabel: { fontSize: 12, fontWeight: '600', color: '#64748b', marginBottom: 4 },
    modalSource: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
    modalRateBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#bbf7d0' },
    modalRateVal: { color: '#166534', fontWeight: '800', fontSize: 16 },
    modalMathBox: { backgroundColor: '#f8fafc', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0' },
    modalMathText: { color: '#475569', fontSize: 13, marginBottom: 8, fontWeight: '500' },
    modalConclusion: { fontSize: 16, color: '#0f172a', lineHeight: 24 },
    crossRatesList: { marginTop: 8, gap: 4 },
    crossRateItem: { fontSize: 14, color: '#475569', lineHeight: 22 },
    boldText: { fontWeight: '900', color: '#3b82f6' },
    modalHint: { marginTop: 16, fontSize: 11, color: '#94a3b8', fontStyle: 'italic', lineHeight: 16 },
    modalActionBtn: { backgroundColor: '#3b82f6', width: '100%', paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
    modalActionText: { color: '#ffffff', fontWeight: '800', fontSize: 16 },

    textDark: { color: '#f8fafc' },
    textSecondaryDark: { color: '#94a3b8' }
});
