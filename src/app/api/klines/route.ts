import { NextRequest } from 'next/server';
import { apiResponse, errorResponse } from '@/lib/utils';
import { daaFetch, DaaAuthError } from '@/lib/daaClient';
import { getMockCandles } from '@/constants/mockData';
import { IDaaCandle } from '@/types';
import { toDaaSymbol, isValidSymbol } from '@/lib/symbolUtils';

// In-memory cache for candles
const klineCache = new Map<string, { data: any[]; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 60 seconds

const VALID_INTERVALS = ['1h', '4h', '1d'];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawSymbol = searchParams.get('symbol') || '';
  const interval = searchParams.get('interval') || '1h';
  const symbol = toDaaSymbol(rawSymbol);

  if (!isValidSymbol(symbol)) {
    return errorResponse('Invalid symbol', 'INVALID_SYMBOL', 400);
  }
  if (!VALID_INTERVALS.includes(interval)) {
    return errorResponse('Invalid interval. Use: 1h, 4h, or 1d', 'INVALID_INTERVAL', 400);
  }

  const cacheKey = `${symbol}-${interval}`;
  const now = Date.now();

  // Helper for consistent transformation
  const transformCandles = (candles: IDaaCandle[]) => {
    return candles.map((k: IDaaCandle) => ({
      time: Math.floor(k.openTime / 1000), // ms to seconds
      open: parseFloat(k.open),
      high: parseFloat(k.high),
      low: parseFloat(k.low),
      close: parseFloat(k.close)
    }));
  };

  try {
    // 1. Check in-memory cache
    const cached = klineCache.get(cacheKey);
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      return apiResponse({
        data: cached.data,
        isMock: false,
        isStale: false
      });
    }

    try {
      // 2. Fetch from DAA
      const data = await daaFetch<IDaaCandle[]>(`/public/trade-spot/candle?symbol=${symbol}&interval=${interval}`);
      
      // 3. Transform response: time must be in SECONDS
      const transformed = transformCandles(data);

      // 4. Update memory cache
      klineCache.set(cacheKey, { data: transformed, timestamp: now });

      return apiResponse({
        data: transformed,
        isMock: false,
        isStale: false
      });

    } catch (apiError) {
      if (apiError instanceof DaaAuthError) {
        return apiResponse({
          data: transformCandles(getMockCandles(symbol, interval)),
          isMock: true,
          isStale: false,
          reason: 'auth_error'
        });
      }

      // Fallback: Return in-memory cached candles if available (Layer 2)
      if (cached) {
        return apiResponse({
          data: cached.data,
          isMock: false,
          isStale: true
        });
      }

      // Fallback to mock (Layer 3)
      return apiResponse({
        data: transformCandles(getMockCandles(symbol, interval)),
        isMock: true,
        isStale: false,
        reason: 'rate_limit'
      });
    }
  } catch (error) {
    console.error('[API Klines] Error:', error);
    return apiResponse({
      data: transformCandles(getMockCandles(symbol, interval)),
      isMock: true,
      isStale: false,
      reason: 'internal_error'
    });
  }
}
