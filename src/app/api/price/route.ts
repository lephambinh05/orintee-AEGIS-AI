import { NextRequest } from 'next/server';
import { apiResponse, errorResponse } from '@/lib/utils';
import { daaFetch, DaaAuthError, DaaRateLimitError, DaaServerError } from '@/lib/daaClient';
import { getMockTicker } from '@/constants/mockData';
import connectDB from '@/lib/mongodb';
import PriceCache from '@/models/PriceCache';
import { IDaaTicker } from '@/types';
import { toDaaSymbol, isValidSymbol } from '@/lib/symbolUtils';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawSymbol = searchParams.get('symbol') || '';
  const symbol = toDaaSymbol(rawSymbol);

  if (!isValidSymbol(symbol)) {
    return errorResponse('Invalid symbol. Use: btcusdt, ethusdt, or solusdt', 'INVALID_SYMBOL', 400);
  }

  try {
    await connectDB();

    try {
      // 1. Fetch from DAA
      const data = await daaFetch<IDaaTicker>(`/public/trade-spot/ticker/24h?symbol=${symbol}`);
      
      const result = {
        symbol: data.symbol.toLowerCase(),
        price: parseFloat(data.lastPrice),
        change24h: parseFloat(data.priceChangePercent),
        high: parseFloat(data.high24h),
        low: parseFloat(data.low24h),
        isMock: false
      };

      // 2. Cache result in MongoDB (upsert)
      await PriceCache.findOneAndUpdate(
        { symbol: symbol.toUpperCase() },
        { 
          price: result.price, 
          change24h: result.change24h,
          updatedAt: new Date() 
        },
        { upsert: true }
      );

      return apiResponse(result);

    } catch (apiError) {
      // 3. Handle specific DAA errors
      if (apiError instanceof DaaAuthError) {
        const mock = getMockTicker(symbol);
        return apiResponse({
          symbol: mock.symbol,
          price: parseFloat(mock.lastPrice),
          change24h: parseFloat(mock.priceChangePercent),
          high: parseFloat(mock.high24h),
          low: parseFloat(mock.low24h),
          isMock: true,
          reason: 'auth_error'
        });
      }

      if (apiError instanceof DaaRateLimitError || apiError instanceof DaaServerError) {
        // Try fallback to cache (Layer 2)
        const cached = await PriceCache.findOne({ symbol: symbol.toUpperCase() });
        if (cached) {
          return apiResponse({
            symbol,
            price: cached.price,
            change24h: cached.change24h,
            high: 0, 
            low: 0,
            isMock: false,
            isStale: true
          });
        }

        // Fallback to mock if no cache (Layer 3)
        const mock = getMockTicker(symbol);
        return apiResponse({
          symbol: mock.symbol,
          price: parseFloat(mock.lastPrice),
          change24h: parseFloat(mock.priceChangePercent),
          high: parseFloat(mock.high24h),
          low: parseFloat(mock.low24h),
          isMock: true,
          reason: 'rate_limit'
        });
      }

      throw apiError; 
    }
  } catch (error) {
    console.error('[API Ticker] Fatal Error:', error);
    const mock = getMockTicker(symbol);
    return apiResponse({
      symbol: mock.symbol,
      price: parseFloat(mock.lastPrice),
      change24h: parseFloat(mock.priceChangePercent),
      high: parseFloat(mock.high24h),
      low: parseFloat(mock.low24h),
      isMock: true,
      reason: 'rate_limit'
    });
  }
}
