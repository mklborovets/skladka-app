export type RateSource =
  | 'identity'
  | 'frankfurter'
  | 'open-er-api'
  | 'cache'
  | 'fallback';

export interface ExchangeRateResult {
  rate: number;
  source: RateSource;
  date?: string;
}

export interface ConversionResult {
  convertedAmountMinor: number;
  rate: number;
  source: RateSource;
}
