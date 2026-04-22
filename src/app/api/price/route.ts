import { NextRequest } from 'next/server';
import { apiResponse, errorResponse } from '@/lib/utils';
import connectDB from '@/lib/mongodb';
import PriceCache from '@/models/PriceCache';
import { getMockTicker } from '@/constants/mockData';
import { getPriceData } from '@/lib/binance';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawSymbol = searchParams.get('symbol') || 'BTCUSDT';
  const symbol = rawSymbol.toUpperCase().replace('/', '');

  try {
    await connectDB();

    try {
      // 1. Fetch from Binance Directly
      const data = await getPriceData(symbol);
      
      const result = {
        symbol: data.symbol.toLowerCase(),
        price: parseFloat(data.lastPrice),
        change24h: parseFloat(data.priceChangePercent),
        high: parseFloat(data.highPrice),
        low: parseFloat(data.lowPrice),
        isMock: false,
        source: 'binance'
      };

      // 2. Cache result in MongoDB (upsert) for other systems
      await PriceCache.findOneAndUpdate(
        { symbol: symbol },
        { 
          price: result.price, 
          change24h: result.change24h,
          updatedAt: new Date() 
        },
        { upsert: true }
      );

      return apiResponse(result);

    } catch (apiError) {
      const message = apiError instanceof Error ? apiError.message : 'Unknown error';
      console.error(`[API Price] Binance Error for ${symbol}:`, message);
      
      // 3. Fallback to Cache (Layer 2)
      const cached = await PriceCache.findOne({ symbol: symbol });
      if (cached) {
        return apiResponse({
          symbol: symbol.toLowerCase(),
          price: cached.price,
          change24h: cached.change24h,
          high: 0, 
          low: 0,
          isMock: false,
          isStale: true
        });
      }

      // 4. Fallback to Mock if everything fails (Layer 3)
      const mock = getMockTicker(symbol);
      return apiResponse({
        symbol: mock.symbol.toLowerCase(),
        price: parseFloat(mock.lastPrice),
        change24h: parseFloat(mock.priceChangePercent),
        high: parseFloat(mock.high24h),
        low: parseFloat(mock.low24h),
        isMock: true,
        reason: 'api_failure'
      });
    }
  } catch (error) {
    console.error('[API Price] Fatal Error:', error);
    return errorResponse('Failed to fetch price data', 'SERVER_ERROR', 500);
  }
}
