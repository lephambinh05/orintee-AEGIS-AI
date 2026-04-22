import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Strategy from '@/models/Strategy';
import { apiResponse, errorResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  // 1. Validate wallet address
  if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
    return errorResponse('Invalid wallet address format (0x + 40 hex chars)', 'INVALID_WALLET', 400);
  }

  try {
    await connectDB();
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Strategy.find({ walletAddress: wallet.toLowerCase() })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Strategy.countDocuments({ walletAddress: wallet.toLowerCase() })
    ]);

    return apiResponse({
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('[API History] GET Error:', error);
    return errorResponse('Internal Server Error', 'DB_ERROR', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      walletAddress, txHash, coinPair, aegisScore: rawScore, 
      entryPrice, stopLoss, takeProfit, isLong 
    } = body;

    // 1. Validations
    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return errorResponse('Invalid wallet address', 'INVALID_WALLET', 400);
    }
    if (!txHash || !/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
      return errorResponse('Invalid txHash (0x + 64 hex chars)', 'INVALID_TX', 400);
    }
    if (!['BTC/USDT', 'ETH/USDT', 'SOL/USDT'].includes(coinPair)) {
      return errorResponse('Invalid coinPair', 'INVALID_COINPAIR', 400);
    }

    // Aegis Score: integer 0-100 (Math.round + clamp)
    const aegisScore = Math.min(Math.max(Math.round(rawScore || 0), 0), 100);

    // StopLoss and TakeProfit validation (dynamic based on isLong)
    if (isLong) {
      if (stopLoss >= entryPrice) {
        return errorResponse('Long: stopLoss must be less than entryPrice', 'INVALID_STOPLOSS', 400);
      }
      if (takeProfit <= entryPrice) {
        return errorResponse('Long: takeProfit must be greater than entryPrice', 'INVALID_TAKEPROFIT', 400);
      }
    } else {
      // Short position logic
      if (stopLoss <= entryPrice) {
        return errorResponse('Short: stopLoss must be greater than entryPrice', 'INVALID_STOPLOSS', 400);
      }
      if (takeProfit >= entryPrice) {
        return errorResponse('Short: takeProfit must be less than entryPrice', 'INVALID_TAKEPROFIT', 400);
      }
    }

    await connectDB();

    // 2. Prepare document
    const strategy = new Strategy({
      walletAddress,
      txHash,
      coinPair,
      aegisScore,
      entryPrice,
      stopLoss,
      takeProfit,
      isLong,
      status: 'pending'
    });

    // 3. Save with unique txHash handling
    try {
      const saved = await strategy.save();
      return apiResponse(saved, 201);
    } catch (dbError: any) {
      if (dbError && dbError.code === 11000) {
        return errorResponse('Duplicate txHash', 'DUPLICATE_TX', 409);
      }
      throw dbError;
    }
  } catch (error) {
    console.error('[API History] POST Error:', error);
    return errorResponse('Failed to save strategy', 'INTERNAL_ERROR', 500);
  }
}
