import { fetchBCVRates } from '../api';

describe('fetchBCVRates API resiliency and fallback logic', () => {
    let originalFetch: typeof global.fetch;

    beforeAll(() => {
        originalFetch = global.fetch;
    });

    afterAll(() => {
        global.fetch = originalFetch;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        // Set Platform.OS to 'ios' or 'android' mock behavior
        jest.mock('react-native', () => ({
            Platform: {
                OS: 'ios'
            }
        }));
    });

    test('should resolve rates from primary API (rafnixg) and bypass fallbacks', async () => {
        global.fetch = jest.fn().mockImplementation((url: string) => {
            if (url.includes('bcv-api.rafnixg.dev')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ usd: 36.50, eur: 39.20 })
                });
            }
            return Promise.reject(new Error('Should not call fallbacks'));
        }) as jest.Mock;

        const rates = await fetchBCVRates();
        expect(rates.usd).toBe(36.50);
        expect(rates.eur).toBe(39.20);
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    test('should fallback to DolarAPI (secondary) when primary API fails', async () => {
        global.fetch = jest.fn().mockImplementation((url: string) => {
            if (url.includes('bcv-api.rafnixg.dev')) {
                return Promise.reject(new Error('Primary API Offline'));
            }
            if (url.includes('dolares/oficial')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ promedio: 36.60 })
                });
            }
            if (url.includes('euros/oficial')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ promedio: 39.30 })
                });
            }
            return Promise.reject(new Error('Should not call scraper'));
        }) as jest.Mock;

        const rates = await fetchBCVRates();
        expect(rates.usd).toBe(36.60);
        expect(rates.eur).toBe(39.30);
    });

    test('should fallback to BCV HTML scraping (tertiary) when both primary and secondary APIs fail', async () => {
        const mockHTML = `
            <html>
                <body>
                    <div id="dolar">
                        <div class="centrado">
                            <strong>36.70</strong>
                        </div>
                    </div>
                    <div id="euro">
                        <div class="centrado">
                            <strong>39.40</strong>
                        </div>
                    </div>
                </body>
            </html>
        `;

        global.fetch = jest.fn().mockImplementation((url: string) => {
            if (url.includes('bcv-api.rafnixg.dev') || url.includes('dolarapi.com')) {
                return Promise.reject(new Error('API Offline'));
            }
            if (url.includes('bcv.org.ve')) {
                return Promise.resolve({
                    ok: true,
                    text: () => Promise.resolve(mockHTML)
                });
            }
            return Promise.reject(new Error('Unexpected fetch call'));
        }) as jest.Mock;

        const rates = await fetchBCVRates();
        expect(rates.usd).toBe(36.70);
        expect(rates.eur).toBe(39.40);
    });

    test('should correctly scrape and parse BCV HTML when rate includes currency symbols and whitespace', async () => {
        const mockHTML = `
            <html>
                <body>
                    <div id="dolar">
                        <div class="centrado">
                            <strong> USD 558,64360000 </strong>
                        </div>
                    </div>
                    <div id="euro">
                        <div class="centrado">
                            <strong> EUR 605,12000000 </strong>
                        </div>
                    </div>
                </body>
            </html>
        `;

        global.fetch = jest.fn().mockImplementation((url: string) => {
            if (url.includes('bcv-api.rafnixg.dev') || url.includes('dolarapi.com')) {
                return Promise.reject(new Error('API Offline'));
            }
            if (url.includes('bcv.org.ve')) {
                return Promise.resolve({
                    ok: true,
                    text: () => Promise.resolve(mockHTML)
                });
            }
            return Promise.reject(new Error('Unexpected fetch call'));
        }) as jest.Mock;

        const rates = await fetchBCVRates();
        expect(rates.usd).toBe(558.6436);
        expect(rates.eur).toBe(605.12);
    });

    test('should return 0,0 when all fetch sources fail', async () => {
        global.fetch = jest.fn().mockImplementation(() => {
            return Promise.reject(new Error('Complete Network Blackout'));
        }) as jest.Mock;

        const rates = await fetchBCVRates();
        expect(rates.usd).toBe(0);
        expect(rates.eur).toBe(0);
    });
});
