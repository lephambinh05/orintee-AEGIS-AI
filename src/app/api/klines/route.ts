import { NextRequest } from 'next/server';
import { apiResponse, errorResponse } from '@/lib/utils';
import { getMockCandles } from '@/constants/mockData';
import { getKlinesData } from '@/lib/binance';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawSymbol = searchParams.get('symbol') || 'BTCUSDT';
  const interval = searchParams.get('interval') || '1h';
  
  const VALID_INTERVALS = ['1h', '4h', '1d'];
  if (!VALID_INTERVALS.includes(interval)) {
    return errorResponse('Invalid interval', 'INVALID_INTERVAL', 400);
  }

  try {
    const transformed = await getKlinesData(rawSymbol, interval, 200);

    return apiResponse({
      data: transformed,
      isMock: false,
      source: 'binance'
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API Klines] Error, falling back to mock:', message);
    
    // Fallback to mock
    return apiResponse({
      data: getMockCandles(rawSymbol, interval).map((k) => ({
        time: Math.floor(k.openTime / 1000),
        open: parseFloat(k.open),
        high: parseFloat(k.high),
        low: parseFloat(k.low),
        close: parseFloat(k.close)
      })),
      isMock: true,
      reason: 'api_fallback'
    });
  }
}
