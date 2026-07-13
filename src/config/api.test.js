import { describe, it, expect } from 'vitest';
import { CoinList, SingleCoin, HistoricalChart, TrendingCoins } from './api';

describe('api URL builders', () => {
  it('CoinList interpolates currency', () => {
    expect(CoinList('usd')).toBe(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false'
    );
  });

  it('SingleCoin interpolates id', () => {
    expect(SingleCoin('bitcoin')).toBe(
      'https://api.coingecko.com/api/v3/coins/bitcoin'
    );
  });

  it('HistoricalChart interpolates id, days, and currency', () => {
    expect(HistoricalChart('bitcoin', 30, 'usd')).toBe(
      'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30'
    );
  });

  it('HistoricalChart defaults days to 365', () => {
    expect(HistoricalChart('bitcoin', undefined, 'usd')).toContain('days=365');
  });

  it('TrendingCoins interpolates currency', () => {
    expect(TrendingCoins('inr')).toBe(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=inr&order=gecko_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h'
    );
  });
});
