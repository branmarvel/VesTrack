import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Delete } from 'lucide-react-native';

interface NumpadProps {
    value: string;
    onChange: (val: string) => void;
    isDarkMode?: boolean;
}

export const Numpad: React.FC<NumpadProps> = ({ value, onChange, isDarkMode = false }) => {
    const handlePress = (key: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (key === 'del') {
            onChange(value.length > 1 ? value.slice(0, -1) : '0');
        } else if (key === '.') {
            if (!value.includes('.')) {
                onChange(value + '.');
            }
        } else {
            onChange(value === '0' ? key : value + key);
        }
    };

    const t = (light: string, dark: string) => isDarkMode ? dark : light;

    const renderKey = (key: string, icon?: React.ReactNode) => (
        <TouchableOpacity 
            key={key} 
            style={[styles.key, isDarkMode && styles.keyDark]} 
            onPress={() => handlePress(key)}
            activeOpacity={0.7}
        >
            {icon ? icon : <Text style={[styles.keyText, isDarkMode && styles.textDark]}>{key}</Text>}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                {renderKey('1')}
                {renderKey('2')}
                {renderKey('3')}
            </View>
            <View style={styles.row}>
                {renderKey('4')}
                {renderKey('5')}
                {renderKey('6')}
            </View>
            <View style={styles.row}>
                {renderKey('7')}
                {renderKey('8')}
                {renderKey('9')}
            </View>
            <View style={styles.row}>
                {renderKey('.')}
                {renderKey('0')}
                {renderKey('del', <Delete color={t('#475569', '#cbd5e1')} size={28} />)}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingTop: 4,
        paddingBottom: 4,
        gap: 8,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    key: {
        flex: 1,
        backgroundColor: '#f1f5f9',
        height: 52,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 1,
    },
    keyDark: {
        backgroundColor: '#1e293b',
    },
    keyText: {
        fontSize: 28,
        fontWeight: '600',
        color: '#0f172a',
    },
    textDark: {
        color: '#f8fafc',
    },
});
