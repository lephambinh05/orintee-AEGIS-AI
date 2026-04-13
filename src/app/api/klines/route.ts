import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/utils';
import axios from 'axios';

// In-memory cache
const klineCache = new Map<string, { data: any[]; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 60 seconds

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol')?.toUpperCase() || 'BTCUSDT';
  const interval = searchParams.get('interval') || '1h';
  const limit = parseInt(searchParams.get('limit') || '200');

  const cacheKey = `${symbol}_${interval}_${limit}`;
  const now = Date.now();

  // 1. Check in-memory cache
  const cached = klineCache.get(cacheKey);
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return apiResponse(cached.data);
  }

  try {
    // 2. Fetch from Binance
    const response = await axios.get(`https://api.binance.com/api/v3/klines`, {
      params: { symbol, interval, limit },
      timeout: 5000
    });

    // 3. Transform response: time must be in SECONDS
    const transformed = response.data.map((k: any) => ({
      time: Math.floor(k[0] / 1000), // ms to seconds
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
      volume: parseFloat(k[5])
    }));

    // 4. Update cache
    klineCache.set(cacheKey, { data: transformed, timestamp: now });

    return apiResponse(transformed);
  } catch (error) {
    console.error('[API Klines] Binance fetch failed:', (error as Error).message);

    // 5. Fallback: Generate mock OHLC data
    const mockData = Array.from({ length: 50 }).map((_, i) => {
      const time = Math.floor(now / 1000) - (50 - i) * 3600;
      const base = 65000 + Math.random() * 1000;
      return {
        time,
        open: base,
        high: base + 200,
        low: base - 200,
        close: base + 50,
        volume: 100 + Math.random() * 50
      };
    });

    return apiResponse(mockData);
  }
}
