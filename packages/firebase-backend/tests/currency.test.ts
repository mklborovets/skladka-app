import assert from 'node:assert';
import { describe, it } from 'node:test';

type RateSource =
  | 'identity'
  | 'frankfurter'
  | 'open-er-api'
  | 'cache'
  | 'fallback';

interface ExchangeRateResult {
  rate: number;
  source: RateSource;
}

interface ConversionResult {
  convertedAmountMinor: number;
  rate: number;
  source: RateSource;
}

const STATIC_FALLBACK_RATES: Record<string, Record<string, number>> = {
  USD: { USD: 1.0, EUR: 0.92, UAH: 41.5, PLN: 4.0 },
  EUR: { EUR: 1.0, USD: 1.09, UAH: 45.0, PLN: 4.35 },
  UAH: { UAH: 1.0, USD: 0.024, EUR: 0.022, PLN: 0.096 },
  PLN: { PLN: 1.0, USD: 0.25, EUR: 0.23, UAH: 10.4 },
};

function convertAmountPure(
  amountMinor: number,
  fromCurrency: string,
  toCurrency: string,
  rateProvider?: (from: string, to: string) => number | null
): ConversionResult {
  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();

  if (from === to) {
    return {
      convertedAmountMinor: amountMinor,
      rate: 1.0,
      source: 'identity',
    };
  }

  if (rateProvider) {
    const customRate = rateProvider(from, to);
    if (customRate !== null && customRate > 0) {
      return {
        convertedAmountMinor: Math.round(amountMinor * customRate),
        rate: customRate,
        source: 'cache',
      };
    }
  }

  const fallbackRate = STATIC_FALLBACK_RATES[from]?.[to];
  if (typeof fallbackRate === 'number') {
    return {
      convertedAmountMinor: Math.round(amountMinor * fallbackRate),
      rate: fallbackRate,
      source: 'fallback',
    };
  }

  return {
    convertedAmountMinor: amountMinor,
    rate: 1.0,
    source: 'fallback',
  };
}

describe('Currency Conversion and Offline Cache', () => {
  it('returns identity result when currencies are identical', () => {
    const result = convertAmountPure(10050, 'USD', 'USD');
    assert.strictEqual(result.convertedAmountMinor, 10050);
    assert.strictEqual(result.rate, 1.0);
    assert.strictEqual(result.source, 'identity');
  });

  it('uses static fallback table when no remote or cache rate is available', () => {
    const result = convertAmountPure(1000, 'USD', 'EUR');
    assert.strictEqual(result.rate, 0.92);
    assert.strictEqual(result.convertedAmountMinor, 920);
    assert.strictEqual(result.source, 'fallback');
  });

  it('correctly rounds minor units on fractional calculations', () => {
    const result = convertAmountPure(10055, 'USD', 'UAH');
    assert.strictEqual(result.rate, 41.5);
    assert.strictEqual(result.convertedAmountMinor, Math.round(10055 * 41.5));
  });

  it('prioritizes cached rate over fallback rates', () => {
    const mockCache = () => 0.95;
    const result = convertAmountPure(1000, 'USD', 'EUR', mockCache);
    assert.strictEqual(result.rate, 0.95);
    assert.strictEqual(result.convertedAmountMinor, 950);
    assert.strictEqual(result.source, 'cache');
  });

  it('defaults to 1.0 when currency pair is unknown in fallback dictionary', () => {
    const result = convertAmountPure(5000, 'GBP', 'JPY');
    assert.strictEqual(result.rate, 1.0);
    assert.strictEqual(result.convertedAmountMinor, 5000);
    assert.strictEqual(result.source, 'fallback');
  });
});
