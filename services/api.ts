import { Platform } from 'react-native';

export interface BinanceOffer {
    price: number;
    minAmount: string;
    maxAmount: string;
    advertiser: string;
}

export interface RateData {
    bcv_usd: number;
    bcv_eur: number;
    binance_usdt_buy: number;  // Price to PAY (Buy USDT)
    binance_usdt_sell: number; // Price to RECEIVE (Sell USDT)
    last_updated: string;
    binance_offers: BinanceOffer[];
    binance_offers_type: 'BUY' | 'SELL';
}

const BINANCE_P2P_URL = 'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search';
const BCV_API_URL = 'https://bcv-api.rafnixg.dev/rates/';
const BCV_URL = 'https://www.bcv.org.ve/';

// Reliable proxies for web version
const PROXIES = [
    'https://thingproxy.freeboard.io/fetch/',
    'https://api.allorigins.win/raw?url=',
    'https://cors-anywhere.herokuapp.com/'
];

const isWeb = Platform.OS === 'web';

const fetchWithProxy = async (url: string, options: any = {}) => {
    if (!isWeb) return fetch(url, options);

    const proxy = options.method === 'POST' ? PROXIES[0] : PROXIES[1];
    try {
        const response = await fetch(`${proxy}${encodeURIComponent(url)}`, options);
        if (!response.ok) throw new Error('Proxy failed');
        return response;
    } catch (e) {
        console.warn('Primary proxy failed, trying fallback...');
        const secondProxy = PROXIES[1];
        return fetch(`${secondProxy}${encodeURIComponent(url)}`, options);
    }
};

export const fetchBinanceRate = async (type: 'BUY' | 'SELL', minAmount?: number): Promise<number> => {
    try {
        const response = await fetchWithProxy(BINANCE_P2P_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fiat: 'VES',
                tradeType: type,
                asset: 'USDT',
                page: 1,
                rows: 5,
                transAmount: minAmount || null,
                payTypes: [],
            }),
        });
        const json = await response.json();
        if (json.data && json.data.length > 0) {
            return parseFloat(json.data[0].adv.price);
        }
        return 0;
    } catch (error) {
        console.error(`Error fetching Binance ${type}:`, error);
        return 0;
    }
};

export const fetchBinanceOffers = async (type: 'BUY' | 'SELL', minAmount?: number): Promise<BinanceOffer[]> => {
    try {
        const response = await fetchWithProxy(BINANCE_P2P_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fiat: 'VES',
                tradeType: type,
                asset: 'USDT',
                page: 1,
                rows: 10,
                transAmount: minAmount || null,
                payTypes: [],
            }),
        });
        const json = await response.json();
        if (json.data && json.data.length > 0) {
            return json.data.map((item: any) => ({
                price: parseFloat(item.adv.price),
                minAmount: item.adv.minSingleTransAmount,
                maxAmount: item.adv.maxSingleTransAmount,
                advertiser: item.advertiser.nickName,
            }));
        }
        return [];
    } catch (error) {
        console.error('Error fetching Binance offers:', error);
        return [];
    }
};

export const fetchHistoricalBCV = async (date: string): Promise<number> => {
    try {
        const response = await fetchWithProxy(`${BCV_API_URL}${date}`);
        const data = await response.json();
        return data.dollar || 0;
    } catch (error) {
        console.error('Error fetching historical BCV:', error);
        return 0;
    }
};

export const fetchBCVRates = async (): Promise<{ usd: number; eur: number }> => {
    let usd = 0;
    let eur = 0;

    // Try rafniXg API first (Primary source)
    try {
        const apiResponse = await fetchWithProxy(BCV_API_URL);
        const apiData = await apiResponse.json();

        // The API returns an object with rates directly or nested
        // Adjusting based on standard response pattern for bcv-api
        usd = apiData.usd || apiData.USD || apiData.dollar || 0;
        eur = apiData.eur || apiData.EUR || apiData.euro || 0;

        console.log('BCV API Success:', { usd, eur });
    } catch (e) {
        console.warn('BCV API primary failed, trying secondary scraping...');
    }

    // Secondary: Scraping as fallback
    if (usd === 0 || eur === 0) {
        try {
            const response = await fetchWithProxy(BCV_URL);
            const html = await response.text();

            const usdMatch = html.match(/<div id="dolar"[^>]*>[\s\S]*?<strong>\s*([\d,.]+)\s*<\/strong>/i);
            const eurMatch = html.match(/<div id="euro"[^>]*>[\s\S]*?<strong>\s*([\d,.]+)\s*<\/strong>/i);

            if (usdMatch) usd = parseFloat(usdMatch[1].replace(',', '.'));
            if (eurMatch) eur = parseFloat(eurMatch[1].replace(',', '.'));

            console.log('BCV Scraping Fallback Success:', { usd, eur });
        } catch (error) {
            console.error('All BCV sources failed:', error);
        }
    }

    return { usd, eur };
};

function scrapedIsNewer(val: string): boolean {
    // Simple logic: if we have a value, we can use it
    return !!val;
}

export const getAllRates = async (minAmount?: number, offersType: 'BUY' | 'SELL' = 'BUY'): Promise<RateData> => {
    const [binanceBuy, binanceSell, bcv, offers] = await Promise.all([
        fetchBinanceRate('BUY', minAmount),
        fetchBinanceRate('SELL', minAmount),
        fetchBCVRates(),
        fetchBinanceOffers(offersType, minAmount),
    ]);

    return {
        bcv_usd: bcv.usd,
        bcv_eur: bcv.eur,
        binance_usdt_buy: binanceBuy,
        binance_usdt_sell: binanceSell,
        last_updated: new Date().toLocaleTimeString(),
        binance_offers: offers,
        binance_offers_type: offersType
    };
};
