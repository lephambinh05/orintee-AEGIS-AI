'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// 1. Current Price Query
export function usePriceQuery(symbol: string) {
  return useQuery({
    queryKey: ['price', symbol],
    queryFn: async () => {
      const { data } = await axios.get(`/api/price?symbol=${symbol}`);
      return data;
    },
    refetchInterval: 5000, // 5s
    enabled: !!symbol
  });
}

// 2. Klines/Chart Data Query
export function useKlinesQuery(symbol: string, interval: string) {
  return useQuery({
    queryKey: ['klines', symbol, interval],
    queryFn: async () => {
      const { data } = await axios.get(`/api/klines?symbol=${symbol}&interval=${interval}&limit=100`);
      return data;
    },
    refetchInterval: 60000, // 60s
    enabled: !!symbol && !!interval
  });
}

// 3. Strategic Analysis Query
export function useAnalyzeQuery(symbol: string) {
  return useQuery({
    queryKey: ['analyze', symbol],
    queryFn: async () => {
      const { data } = await axios.post('/api/analyze', { symbol });
      return data;
    },
    refetchInterval: 30000, // 30s
    refetchOnWindowFocus: false, // Per requirement
    enabled: !!symbol,
    placeholderData: (previousData) => previousData // Keep stale data while refetching
  });
}
