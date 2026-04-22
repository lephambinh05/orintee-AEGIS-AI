import { NextRequest } from 'next/server';
import { apiResponse, errorResponse } from '@/lib/utils';
import { daaFetch, DaaAuthError } from '@/lib/daaClient';
import { getMockCandles } from '@/constants/mockData';
import { IDaaCandle } from '@/types';
import { toDaaSymbol, isValidSymbol } from '@/lib/symbolUtils';

// Memory leak fix: Removed in-memory Map cache. Using Next.js Data Cache via fetch({ next: { revalidate: 60 } })
const VALID_INTERVALS = ['1h', '4h', '1d'];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawSymbol = searchParams.get('symbol') || 'BTCUSDT';
  const interval = searchParams.get('interval') || '1h';
  
  // Normalize symbol for Binance (e.g. BTC/USDT or btcusdt -> BTCUSDT)
  const binanceSymbol = rawSymbol.toUpperCase().replace('/', '');

  if (!VALID_INTERVALS.includes(interval)) {
    return errorResponse('Invalid interval. Use: 1h, 4h, or 1d', 'INVALID_INTERVAL', 400);
  }

  // Helper for consistent transformation (Binance returns [time, open, high, low, close, ...])
  const transformBinanceData = (data: any[]) => {
    return data.map((k: any) => ({
      time: Math.floor(k[0] / 1000), // ms to seconds
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4])
    }));
  };

  try {
    // 1. Fetch from Binance with Next.js Data Cache (revalidate every 60s)
    const response = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${interval}&limit=200`,
      { 
        next: { revalidate: 60 },
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (!response.ok) {
      throw new Error(`Binance API responded with status: ${response.status}`);
    }

    const data = await response.json();
    const transformed = transformBinanceData(data);

    return apiResponse({
      data: transformed,
      isMock: false,
      source: 'binance'
    });

  } catch (error: any) {
    console.error('[API Klines] Binance Fetch Error, falling back to mock:', error.message);
    
    // Fallback to mock data if Binance is down
    return apiResponse({
      data: transformBinanceData(getMockCandles(binanceSymbol, interval)),
      isMock: true,
      reason: 'api_fallback'
    });
  }
}
