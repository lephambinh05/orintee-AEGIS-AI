import { IDaaTicker, IDaaCandle } from '../types';

/**
 * Realistic, static mock ticker data for simulation mode.
 */
export function getMockTicker(symbol: string): IDaaTicker {
  const s = symbol.toLowerCase();
  
  if (s.includes('btc')) {
    return {
      symbol: 'btcusdt',
      lastPrice: '65420.50',
      priceChange: '1420.50',
      priceChangePercent: '2.34',
      high24h: '66100.00',
      low24h: '64200.00',
      volume: '12450.5'
    };
  }
  
  if (s.includes('eth')) {
    return {
      symbol: 'ethusdt',
      lastPrice: '3521.80',
      priceChange: '-31.20',
      priceChangePercent: '-0.87',
      high24h: '3620.00',
      low24h: '3480.00',
      volume: '82400.1'
    };
  }
  
  // Default to SOL
  return {
    symbol: 'solusdt',
    lastPrice: '148.35',
    priceChange: '7.21',
    priceChangePercent: '5.12',
    high24h: '155.00',
    low24h: '142.00',
    volume: '215000.0'
  };
}

/**
 * Generates 50 realistic, sequential candles starting from 50 intervals ago.
 */
export function getMockCandles(symbol: string, interval: string): IDaaCandle[] {
  const s = symbol.toLowerCase();
  const intervalMs = interval === '1d' ? 86400000 : interval === '4h' ? 14400000 : 3600000;
  
  // Precise start: Date.now() - 50 intervals to avoid current time overlap issues
  const startTime = Date.now() - (50 * intervalMs);
  
  let basePrice = 148; // Default SOL
  if (s.includes('btc')) basePrice = 65000;
  else if (s.includes('eth')) basePrice = 3500;

  return Array.from({ length: 50 }).map((_, i) => {
    const openTime = startTime + (i * intervalMs);
    
    // Deterministic "realistic" movement (±0.5% max) using Sine
    const drift = Math.sin(i * 0.3) * (basePrice * 0.004);
    const volatility = Math.cos(i * 0.7) * (basePrice * 0.001);
    
    const open = basePrice + drift;
    const close = open + volatility;
    const high = Math.max(open, close) + (basePrice * 0.001);
    const low = Math.min(open, close) - (basePrice * 0.001);
    
    return {
      openTime,
      open: open.toFixed(2),
      high: high.toFixed(2),
      low: low.toFixed(2),
      close: close.toFixed(2),
      volume: (500 + Math.random() * 500).toFixed(2),
      closeTime: openTime + intervalMs - 1
    };
  });
}
