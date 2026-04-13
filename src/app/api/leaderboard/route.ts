import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Strategy from '@/models/Strategy';
import { apiResponse, errorResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const leaderboard = await Strategy.aggregate([
      // 1. Group by walletAddress
      {
        $group: {
          _id: '$walletAddress',
          total: { $sum: 1 },
          wins: {
            $sum: { $cond: [{ $eq: ['$status', 'win'] }, 1, 0] }
          }
        }
      },
      // 2. Filter minimum 3 trades
      {
        $match: {
          total: { $gte: 3 }
        }
      },
      // 3. Calculate winRate and projection
      {
        $project: {
          _id: 0,
          walletAddress: '$_id',
          total: 1,
          wins: 1,
          winRate: {
            $multiply: [{ $divide: ['$wins', '$total'] }, 100]
          }
        }
      },
      // 4. Sort by winRate desc
      {
        $sort: { winRate: -1, total: -1 }
      },
      // 5. Limit top 10
      {
        $limit: 10
      }
    ]);

    // Add shortAddress to results
    const formattedLeaderboard = leaderboard.map(user => ({
      ...user,
      shortAddress: `${user.walletAddress.substring(0, 6)}...${user.walletAddress.substring(user.walletAddress.length - 4)}`,
      winRate: Math.round(user.winRate * 100) / 100 // Round to 2 decimal places
    }));

    return apiResponse(formattedLeaderboard);
  } catch (error) {
    console.error('[API Leaderboard] Aggregation Error:', error);
    return errorResponse('Failed to fetch leaderboard', 'DB_ERROR', 500);
  }
}
