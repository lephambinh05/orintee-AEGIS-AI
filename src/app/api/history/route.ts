import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Strategy from '@/models/Strategy';
import { apiResponse, errorResponse } from '@/lib/utils';
import { z } from 'zod';

// Validation Schema for POST
const CreateStrategySchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  txHash: z.string().startsWith('0x'),
  coinPair: z.enum(['BTC/USDT', 'ETH/USDT', 'SOL/USDT']),
  aegisScore: z.number().int().min(0).max(100),
  entryPrice: z.number().positive(),
  stopLoss: z.number().positive(),
  takeProfit: z.number().positive(),
  isLong: z.boolean()
}).refine(data => data.isLong ? data.takeProfit > data.entryPrice : data.takeProfit < data.entryPrice, {
  message: "Take profit must be higher than entry for Long, lower for Short",
  path: ['takeProfit']
}).refine(data => data.isLong ? data.stopLoss < data.entryPrice : data.stopLoss > data.entryPrice, {
  message: "Stop loss must be lower than entry for Long, higher for Short",
  path: ['stopLoss']
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  // 1. Validate wallet address
  if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
    return errorResponse('Invalid or missing wallet address', 'INVALID_WALLET', 400);
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

    // 1. Validate inputs
    const validated = CreateStrategySchema.safeParse(body);
    if (!validated.success) {
      const error = validated.error.issues[0];
      return Response.json({ 
        error: error.message, 
        code: 'VALIDATION_ERROR',
        field: error.path[0] 
      }, { 
        status: 400, 
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        } 
      });
    }

    const { 
      walletAddress, txHash, coinPair, aegisScore, 
      entryPrice, stopLoss, takeProfit, isLong 
    } = validated.data;

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
      position: isLong ? 'Long' : 'Short',
      status: Math.random() > 0.5 ? 'win' : 'loss'
    });

    // 3. Save with unique txHash handling
    try {
      const saved = await strategy.save();
      return apiResponse(saved, 201);
    } catch (dbError: unknown) {
      if (dbError && typeof dbError === 'object' && 'code' in dbError && dbError.code === 11000) {
        return errorResponse('Duplicate txHash', 'DUPLICATE_TX', 409);
      }
      throw dbError;
    }
  } catch (error) {
    console.error('[API History] POST Error:', error);
    return errorResponse('Failed to save strategy', 'INTERNAL_ERROR', 500);
  }
}
