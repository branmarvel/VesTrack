import { RateData } from '../services/api';

export type CurrencyType = 'ves' | 'usd' | 'eur';
export type RateSourceType = 'binance' | 'bcv_usd' | 'bcv_eur' | 'custom';

/**
 * Pure function to convert amounts between VES, USD, and EUR.
 * 
 * @param val The numerical value to convert.
 * @param base The base currency.
 * @param target The target currency.
 * @param via The conversion source rate path (e.g. BCV, Binance, or Custom).
 * @param rates The current RateData structure containing official/market rates.
 * @param customRate The custom rate inputted by the user.
 * @param binanceRate The specific buying or selling Binance rate.
 */
export function convertCurrency(
    val: number,
    base: CurrencyType,
    target: CurrencyType,
    via: RateSourceType,
    rates: RateData,
    customRate: number,
    binanceRate: number
): number {
    if (val <= 0) return 0;
    
    let inVes = 0;
    
    // 1. Convert to VES first (the common base)
    if (base === 'ves') {
        inVes = val;
    } else if (base === 'usd') {
        if (via === 'binance') {
            inVes = val * binanceRate;
        } else if (via === 'custom') {
            inVes = val * customRate;
        } else {
            inVes = val * rates.bcv_usd;
        }
    } else if (base === 'eur') {
        inVes = val * rates.bcv_eur;
    }

    // 2. Convert from VES to target currency
    if (target === 'ves') {
        return inVes;
    }
    if (target === 'usd') {
        if (via === 'binance') {
            return binanceRate > 0 ? inVes / binanceRate : 0;
        }
        if (via === 'custom') {
            return customRate > 0 ? inVes / customRate : 0;
        }
        return rates.bcv_usd > 0 ? inVes / rates.bcv_usd : 0;
    }
    if (target === 'eur') {
        return rates.bcv_eur > 0 ? inVes / rates.bcv_eur : 0;
    }
    return 0;
}
