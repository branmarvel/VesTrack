import { convertCurrency, CurrencyType, RateSourceType } from '../currency';
import { RateData } from '../../services/api';

const mockRates: RateData = {
    bcv_usd: 36.50,
    bcv_eur: 39.20,
    binance_usdt_buy: 38.00,
    binance_usdt_sell: 37.80,
    last_updated: '10:00:00 AM',
    binance_offers: [],
    binance_offers_type: 'BUY'
};

describe('convertCurrency utility', () => {
    test('should return 0 if amount is 0 or negative', () => {
        expect(convertCurrency(0, 'usd', 'ves', 'bcv_usd', mockRates, 0, 0)).toBe(0);
        expect(convertCurrency(-100, 'usd', 'ves', 'bcv_usd', mockRates, 0, 0)).toBe(0);
    });

    test('should convert from USD to VES using different rate sources', () => {
        // BCV Dólar
        expect(convertCurrency(100, 'usd', 'ves', 'bcv_usd', mockRates, 0, 0)).toBe(3650);
        
        // Binance P2P (via specific binanceRate parameter)
        expect(convertCurrency(100, 'usd', 'ves', 'binance', mockRates, 0, 38.00)).toBe(3800);
        
        // Custom rate
        expect(convertCurrency(100, 'usd', 'ves', 'custom', mockRates, 40.00, 0)).toBe(4000);
    });

    test('should convert from VES to USD using different rate sources', () => {
        // BCV Dólar
        expect(convertCurrency(3650, 'ves', 'usd', 'bcv_usd', mockRates, 0, 0)).toBe(100);
        
        // Binance P2P
        expect(convertCurrency(3800, 'ves', 'usd', 'binance', mockRates, 0, 38.00)).toBe(100);
        
        // Custom rate
        expect(convertCurrency(4000, 'ves', 'usd', 'custom', mockRates, 40.00, 0)).toBe(100);
    });

    test('should convert between EUR and VES using BCV rates', () => {
        // EUR to VES
        expect(convertCurrency(100, 'eur', 'ves', 'bcv_eur', mockRates, 0, 0)).toBeCloseTo(3920, 2);
        
        // VES to EUR
        expect(convertCurrency(3920, 'ves', 'eur', 'bcv_eur', mockRates, 0, 0)).toBeCloseTo(100, 2);
    });

    test('should perform cross-currency conversions correctly', () => {
        // USD to EUR via BCV (100 USD = 3650 VES, then 3650 VES / 39.20 = 93.1122 EUR)
        const usdToEur = convertCurrency(100, 'usd', 'eur', 'bcv_usd', mockRates, 0, 0);
        expect(usdToEur).toBeCloseTo(93.11, 2);

        // EUR to USD via BCV (100 EUR = 3920 VES, then 3920 VES / 36.50 = 107.397 USD)
        const eurToUsd = convertCurrency(100, 'eur', 'usd', 'bcv_eur', mockRates, 0, 0);
        expect(eurToUsd).toBeCloseTo(107.40, 2);
    });

    test('should return 0 when dividing by 0 or invalid rate values', () => {
        const brokenRates = { ...mockRates, bcv_usd: 0, bcv_eur: 0 };
        expect(convertCurrency(100, 'ves', 'usd', 'bcv_usd', brokenRates, 0, 0)).toBe(0);
        expect(convertCurrency(100, 'ves', 'eur', 'bcv_eur', brokenRates, 0, 0)).toBe(0);
        expect(convertCurrency(100, 'ves', 'usd', 'binance', mockRates, 0, 0)).toBe(0);
        expect(convertCurrency(100, 'ves', 'usd', 'custom', mockRates, 0, 0)).toBe(0);
    });
});
