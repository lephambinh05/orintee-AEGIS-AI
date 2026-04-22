/**
 * Binance Shared Library
 * Used to fetch market data directly on the server without internal HTTP calls.
 */

export interface BinanceKline {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface BinanceTicker {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  highPrice: string;
  lowPrice: string;
  quoteVolume: string;
}

// 1. Get Klines (Candlesticks) Data directly with caching
export async function getKlinesData(symbol: string, interval = '1h', limit = 200): Promise<BinanceKline[]> {
  const binanceSymbol = symbol.toUpperCase().replace('/', '');
  
  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${interval}&limit=${limit}`,
      { 
        next: { revalidate: 60 },
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (!response.ok) throw new Error(`Binance API Error: ${response.status}`);
    const data = await response.json() as (string | number)[][];

    return data.map((k) => ({
      time: Math.floor((k[0] as number) / 1000),
      open: parseFloat(k[1] as string),
      high: parseFloat(k[2] as string),
      low: parseFloat(k[3] as string),
      close: parseFloat(k[4] as string),
      volume: parseFloat(k[5] as string)
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Binance Lib] Klines Error:`, message);
    throw error;
  }
}

// 2. Get Price (Ticker 24h) Data directly with caching
export async function getPriceData(symbol: string): Promise<BinanceTicker> {
  const binanceSymbol = symbol.toUpperCase().replace('/', '');
  
  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/24hr?symbol=${binanceSymbol}`,
      { 
        next: { revalidate: 30 },
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (!response.ok) throw new Error(`Binance API Error: ${response.status}`);
    return await response.json() as BinanceTicker;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Binance Lib] Price Error:`, message);
    throw error;
  }
}
