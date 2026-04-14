'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';

export interface MarketTickerResponse {
  symbol: string;
  price: number;
  change24h: number;
  high: number;
  low: number;
  isMock: boolean;
  isStale?: boolean;
  reason?: string;
}

export interface MarketKlinesResponse {
  data: any[];
  isMock: boolean;
  isStale: boolean;
  reason?: string;
}

// 1. Current Price Query
export function usePriceQuery(symbol: string): UseQueryResult<MarketTickerResponse, Error> {
  const [pollingInterval, setPollingInterval] = useState<number | null>(5000);
  const toastIdRef = useRef<string | number | null>(null);

  const query = useQuery<MarketTickerResponse, Error>({
    queryKey: ['price', symbol],
    queryFn: async (): Promise<MarketTickerResponse> => {
      const { data } = await axios.get(`/api/price?symbol=${symbol}`);
      return data;
    },
    refetchInterval: pollingInterval ?? undefined,
    enabled: !!symbol
  });

  const { data } = query;

  useEffect(() => {
    if (!data) return;

    if (data.isMock) {
      if (data.reason === 'auth_error') {
        toast.error('⚠ Đang dùng Mock Data (Lỗi Xác thực DAA)', {
          id: 'daa-auth-error',
          description: 'Vui lòng kiểm tra DAA_API_KEY. Dừng polling.'
        });
        setPollingInterval(null); // Pause Polling (clearInterval)
      } else if (data.reason === 'rate_limit') {
        toast.warning('Đang gián đoạn mạng, thử kết nối lại...', {
          id: 'daa-rate-limit'
        });
        setPollingInterval(null); // Tạm ngưng Polling (theo spec)
      }
    } else if (data.isStale) {
      toast.info('Dữ liệu có thể chưa cập nhật', {
        id: 'daa-stale-data',
        style: { opacity: 0.8, fontSize: '12px' }
      });
    }
  }, [data?.isMock, data?.isStale, data?.reason]);

  return query;
}

// 2. Klines/Chart Data Query
export function useKlinesQuery(symbol: string, interval: string) {
  const query = useQuery<MarketKlinesResponse, Error>({
    queryKey: ['klines', symbol, interval],
    queryFn: async (): Promise<MarketKlinesResponse> => {
      const { data } = await axios.get(`/api/klines?symbol=${symbol}&interval=${interval}`);
      return data;
    },
    refetchInterval: 60000, // 60s
    enabled: !!symbol && !!interval
  });

  // Extract the actual klines array for the chart
  return {
    ...query,
    data: query.data?.data || []
  };
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
