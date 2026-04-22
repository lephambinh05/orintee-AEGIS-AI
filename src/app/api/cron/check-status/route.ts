import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Strategy from '@/models/Strategy';
import axios from 'axios';

/**
 * PnL Engine (Automated Win/Loss Checker)
 * This endpoint should be called every 5 minutes by a CRON job.
 * Security: Requires Bearer Token from CRON_SECRET_KEY
 */
export async function GET(request: NextRequest) {
  // 1. Security Check (Temporarily Public for testing as requested)
  /*
  const authHeader = request.headers.get('authorization');
  const secretKey = process.env.CRON_SECRET_KEY;
  
  if (!secretKey || authHeader !== `Bearer ${secretKey}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  */

  try {
    await connectDB();

    // 2. Fetch all pending strategies
    const pendingStrategies = await Strategy.find({ status: 'pending' });
    
    if (pendingStrategies.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No pending strategies to check',
        timestamp: new Date().toISOString()
      });
    }

    // 3. Fetch current prices from Binance (Stable source)
    const pairsToFetch = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];
    const prices: Record<string, number> = {};
    
    await Promise.all(pairsToFetch.map(async (symbol) => {
      try {
        const res = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`, { timeout: 5000 });
        prices[symbol] = parseFloat(res.data.price);
      } catch (err) {
        console.error(`[CRON] Failed to fetch price for ${symbol}`);
      }
    }));

    const results = {
      processed: pendingStrategies.length,
      wins: 0,
      losses: 0,
      stillPending: 0
    };

    // 4. Logic to determine Win/Loss
    for (const strat of pendingStrategies) {
      const dbPair = strat.coinPair; // e.g. "BTC/USDT"
      const binanceSymbol = dbPair.replace('/', ''); // e.g. "BTCUSDT"
      const currentPrice = prices[binanceSymbol];

      if (!currentPrice) {
        results.stillPending++;
        continue;
      }

      let finalStatus: 'win' | 'loss' | null = null;

      if (strat.isLong) {
        // LONG: TP is higher, SL is lower
        if (currentPrice >= strat.takeProfit) {
          finalStatus = 'win';
        } else if (currentPrice <= strat.stopLoss) {
          finalStatus = 'loss';
        }
      } else {
        // SHORT: TP is lower, SL is higher
        if (currentPrice <= strat.takeProfit) {
          finalStatus = 'win';
        } else if (currentPrice >= strat.stopLoss) {
          finalStatus = 'loss';
        }
      }

      if (finalStatus) {
        strat.status = finalStatus;
        await strat.save();
        if (finalStatus === 'win') results.wins++;
        else results.losses++;
        console.log(`[CRON] Strategy ${strat._id} updated to ${finalStatus}. Price: ${currentPrice}`);
      } else {
        results.stillPending++;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'PnL check completed',
      results,
      prices,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[CRON Engine Error]:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
