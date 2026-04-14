import { NextRequest } from 'next/server';
import { apiResponse, errorResponse } from '@/lib/utils';
import { calcRSI, calcATR, calcSentiment, calcScore } from '@/lib/indicators';

export async function POST(request: NextRequest) {
  try {
    const { symbol } = await request.json();

    if (!symbol) {
      return errorResponse('Symbol is required', 'MISSING_SYMBOL', 400);
    }

    const baseUrl = new URL(request.url).origin;

    // 1. Fetch Market Data (Klines and Price)
    // We use internal API calls for consistency
    const [klinesRes, priceRes] = await Promise.all([
      fetch(`${baseUrl}/api/klines?symbol=${symbol}&interval=1h`),
      fetch(`${baseUrl}/api/price?symbol=${symbol}`)
    ]);

    const klinesData = await klinesRes.json();
    const priceData = await priceRes.json();

    const klines = klinesData.data;

    if (!Array.isArray(klines) || klines.length < 50) {
      return errorResponse('Insufficient data for analysis', 'INSUFFICIENT_DATA', 422);
    }

    const currentPrice = priceData.price;

    // 2. Extract Data for Indicators
    const closes = klines.map((k: any) => k.close);
    const candles = klines.map((k: any) => ({
      high: k.high,
      low: k.low,
      close: k.close
    }));

    // 3. Quantitative Analysis
    const rsi = calcRSI(closes, 14);
    const atr = calcATR(candles, 14);
    const sentiment = calcSentiment(symbol);
    
    // Mock on-chain: (RSI > 50 ? RSI * 0.8 : RSI * 1.2) clamped 0-100
    const onChainRaw = rsi > 50 ? rsi * 0.8 : rsi * 1.2;
    const onChain = Math.min(Math.max(onChainRaw, 0), 100);

    const aegisScore = calcScore(rsi, onChain, sentiment);
    const isLong = aegisScore >= 50;

    // 4. Determine Trend Label 
    // score 0-39="BEARISH", 40-59="NEUTRAL", 60-100="BULLISH"
    let trend = 'NEUTRAL';
    if (aegisScore < 40) trend = 'BEARISH';
    else if (aegisScore >= 60) trend = 'BULLISH';

    // 5. Calculate Risk Guard
    // SL = entry - (atr * 2), TP = entry + (atr * 3) (mirrored for Short)
    const entryPrice = currentPrice;
    let stopLoss: number;
    let takeProfit: number;

    if (isLong) {
      stopLoss = entryPrice - (atr * 2);
      takeProfit = entryPrice + (atr * 3);
    } else {
      stopLoss = entryPrice + (atr * 2);
      takeProfit = entryPrice - (atr * 3);
    }

    // 6. Generate Insights
    const getInsightValue = (val: number) => {
      if (val > 60) return 'positive';
      if (val < 40) return 'negative';
      return 'neutral';
    };

    const response = {
      symbol,
      aegisScore,
      trend,
      isLong,
      riskGuard: {
        entryPrice: Number(entryPrice.toFixed(2)),
        stopLoss: Number(stopLoss.toFixed(2)),
        takeProfit: Number(takeProfit.toFixed(2))
      },
      insights: {
        cashflow: { label: 'On-chain Flow', value: getInsightValue(onChain) },
        sentiment: { label: 'Market Sentiment', value: getInsightValue(sentiment) },
        technical: { label: 'RSI Strength', value: getInsightValue(rsi) }
      },
      components: {
        rsi: Math.round(rsi),
        onChain: Math.round(onChain),
        sentiment: Math.round(sentiment)
      },
      calculatedAt: new Date().toISOString()
    };

    return apiResponse(response);
  } catch (error) {
    console.error('[API Analyze] Analysis failed:', error);
    return errorResponse('Strategic analysis failed', 'ANALYSIS_ERROR', 500);
  }
}
