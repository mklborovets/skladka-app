import { ConversionResult, ExchangeRateResult, RateSource } from './types';

const STATIC_FALLBACK_RATES: Record<string, Record<string, number>> = {
  USD: { USD: 1.0, EUR: 0.92, UAH: 41.5, PLN: 4.0 },
  EUR: { EUR: 1.0, USD: 1.09, UAH: 45.0, PLN: 4.35 },
  UAH: { UAH: 1.0, USD: 0.024, EUR: 0.022, PLN: 0.096 },
  PLN: { PLN: 1.0, USD: 0.25, EUR: 0.23, UAH: 10.4 },
};

const rateCache: Record<string, { rate: number; timestamp: number }> = {};
const CACHE_TTL_MS = 1000 * 60 * 60 * 12;

async function fetchWithTimeout(
  url: string,
  timeoutMs: number = 3000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } finally {
    clearTimeout(id);
  }
}

async function fetchFromFrankfurter(
  from: string,
  to: string
): Promise<number | null> {
  try {
    const url = `https://api.frankfurter.app/latest?from=${encodeURIComponent(
      from
    )}&to=${encodeURIComponent(to)}`;
    const res = await fetchWithTimeout(url, 3000);
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    const rate = data?.rates?.[to];
    if (typeof rate === 'number' && rate > 0) {
      return rate;
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchFromOpenErApi(
  from: string,
  to: string
): Promise<number | null> {
  try {
    const url = `https://open.er-api.com/v6/latest/${encodeURIComponent(from)}`;
    const res = await fetchWithTimeout(url, 3000);
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    const rate = data?.rates?.[to];
    if (typeof rate === 'number' && rate > 0) {
      return rate;
    }
    return null;
  } catch {
    return null;
  }
}

export const exchangeRateService = {
  getCachedRate(from: string, to: string): number | null {
    const key = `${from.toUpperCase()}_${to.toUpperCase()}`;
    const cached = rateCache[key];
    if (!cached) {
      return null;
    }
    if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
      return null;
    }
    return cached.rate;
  },

  setCachedRate(from: string, to: string, rate: number): void {
    const key = `${from.toUpperCase()}_${to.toUpperCase()}`;
    rateCache[key] = {
      rate,
      timestamp: Date.now(),
    };
  },

  async getExchangeRate(
    fromCurrency: string,
    toCurrency: string
  ): Promise<ExchangeRateResult> {
    const from = fromCurrency.toUpperCase();
    const to = toCurrency.toUpperCase();

    if (from === to) {
      return {
        rate: 1.0,
        source: 'identity',
      };
    }

    const frankfurterRate = await fetchFromFrankfurter(from, to);
    if (frankfurterRate !== null) {
      this.setCachedRate(from, to, frankfurterRate);
      return {
        rate: frankfurterRate,
        source: 'frankfurter',
      };
    }

    const openErRate = await fetchFromOpenErApi(from, to);
    if (openErRate !== null) {
      this.setCachedRate(from, to, openErRate);
      return {
        rate: openErRate,
        source: 'open-er-api',
      };
    }

    const cachedRate = this.getCachedRate(from, to);
    if (cachedRate !== null) {
      return {
        rate: cachedRate,
        source: 'cache',
      };
    }

    const fallbackRate = STATIC_FALLBACK_RATES[from]?.[to];
    if (typeof fallbackRate === 'number') {
      return {
        rate: fallbackRate,
        source: 'fallback',
      };
    }

    return {
      rate: 1.0,
      source: 'fallback',
    };
  },

  async convertAmount(
    amountMinor: number,
    fromCurrency: string,
    toCurrency: string,
    presetRate?: number
  ): Promise<ConversionResult> {
    if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) {
      return {
        convertedAmountMinor: amountMinor,
        rate: 1.0,
        source: 'identity',
      };
    }

    let rate: number;
    let source: RateSource;

    if (typeof presetRate === 'number' && presetRate > 0) {
      rate = presetRate;
      source = 'cache';
    } else {
      const result = await this.getExchangeRate(fromCurrency, toCurrency);
      rate = result.rate;
      source = result.source;
    }

    const convertedAmountMinor = Math.round(amountMinor * rate);

    return {
      convertedAmountMinor,
      rate,
      source,
    };
  },
};
