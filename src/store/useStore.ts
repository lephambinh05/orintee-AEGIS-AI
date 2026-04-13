'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TradeRecord {
  id: string;
  timestamp: number;
  coinPair: string;
  position: 'Long' | 'Short';
  aegisScore: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  status: 'Win' | 'Loss';
  txHash: string;
}

interface AegisState {
  selectedAsset: string;
  setSelectedAsset: (asset: string) => void;
  
  priceData: {
    price: number;
    change24h: number;
  } | null;
  setPriceData: (data: { price: number; change24h: number } | null) => void;
  
  history: TradeRecord[];
  addTradeRecord: (record: TradeRecord) => void;
}

export const useAegisStore = create<AegisState>()(
  persist(
    (set) => ({
      selectedAsset: 'BTCUSDT',
      setSelectedAsset: (asset) => set({ selectedAsset: asset }),
      
      priceData: null,
      setPriceData: (data) => set({ priceData: data }),
      
      history: [],
      addTradeRecord: (record) => set((state) => ({ 
        history: [record, ...state.history] 
      })),
    }),
    {
      name: 'aegis-storage',
      partialize: (state) => ({ history: state.history }), // Only persist history
      storage: {
        getItem: (name) => {
          try {
            const val = localStorage.getItem(name);
            return val ? JSON.parse(val) : null;
          } catch (e) {
            console.error("Local storage read error", e);
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, JSON.stringify(value));
          } catch (e) {
            console.error("Local storage write error", e);
          }
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name);
          } catch (e) {
            console.error("Local storage remove error", e);
          }
        },
      }
    }
  )
);
