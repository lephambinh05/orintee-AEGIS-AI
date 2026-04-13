import { Types } from 'mongoose';

// --- Database Models ---

export interface IStrategy {
  _id?: Types.ObjectId;
  walletAddress: string;
  txHash: string;
  coinPair: 'BTC/USDT' | 'ETH/USDT' | 'SOL/USDT';
  aegisScore: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  isLong: boolean;
  position: 'Long' | 'Short';
  status: 'win' | 'loss' | 'pending';
  createdAt: Date;
  // Virtuals
  shortTxHash?: string;
}

export interface IPriceCache {
  _id?: Types.ObjectId;
  symbol: string;
  price: number;
  change24h: number;
  updatedAt: Date;
}

// --- DTOs (Data Transfer Objects) ---

/**
 * Input for POST /api/history
 */
export interface CreateStrategyDTO {
  walletAddress: string;
  txHash: string;
  coinPair: 'BTC/USDT' | 'ETH/USDT' | 'SOL/USDT';
  aegisScore: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  isLong: boolean;
}

/**
 * Output for /api/analyze
 */
export interface AnalyzeResponse {
  symbol: string;
  aegisScore: number;
  isLong: boolean;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  reasoning: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
  timestamp: number;
}
