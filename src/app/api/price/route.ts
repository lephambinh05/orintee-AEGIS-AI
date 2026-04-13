import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import PriceCache from '@/models/PriceCache';
import { apiResponse, errorResponse } from '@/lib/utils';
import axios from 'axios';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol')?.toUpperCase() || 'BTCUSDT';

  try {
    await connectDB();

    // 1. Try fetching from Binance
    try {
      const response = await axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`, {
        timeout: 5000 
      });
      const data = response.data;

      const result = {
        symbol: data.symbol,
        price: parseFloat(data.lastPrice),
        change24h: parseFloat(data.priceChangePercent),
        high: parseFloat(data.highPrice),
        low: parseFloat(data.lowPrice),
        isMock: false
      };

      // 2. Cache result in MongoDB (upsert)
      await PriceCache.findOneAndUpdate(
        { symbol },
        { 
          price: result.price, 
          change24h: result.change24h,
          updatedAt: new Date() 
        },
        { upsert: true }
      );

      return apiResponse(result);
    } catch (binanceError) {
      console.error('[API Price] Binance fetch failed:', (binanceError as Error).message);

      // 3. Fallback: Try last cached price from MongoDB
      const cached = await PriceCache.findOne({ symbol });
      if (cached) {
        return apiResponse({
          symbol,
          price: cached.price,
          change24h: cached.change24h,
          high: 0, 
          low: 0,
          isMock: false,
          isCached: true
        });
      }

      // 4. Fallback: Return mock data if no cache exists
      return apiResponse({
        symbol,
        price: 65000.00,
        change24h: 2.5,
        high: 66000.00,
        low: 64000.00,
        isMock: true
      });
    }
  } catch (error) {
    console.error('[API Price] Critical failure:', error);
    // Never return 500, always return mock data or meaningful error
    return apiResponse({
      symbol,
      price: 0,
      change24h: 0,
      isMock: true,
      error: 'Service temporarily unavailable'
    });
  }
}
