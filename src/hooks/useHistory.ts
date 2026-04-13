'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';

// 1. Fetch Paginated History
export function useHistoryQuery(walletAddress: string | null, page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ['history', walletAddress, page],
    queryFn: async () => {
      const { data } = await axios.get(`/api/history?wallet=${walletAddress}&page=${page}&limit=${limit}`);
      return data;
    },
    enabled: !!walletAddress && /^0x[a-fA-F0-9]{40}$/.test(walletAddress)
  });
}

// 2. Save Strategic Trade Mutation
export function useSaveStrategy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (strategyData: any) => {
      const { data } = await axios.post('/api/history', strategyData);
      return data;
    },
    onSuccess: (data) => {
      // Invalidate both history and leaderboard to show fresh data
      queryClient.invalidateQueries({ queryKey: ['history'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      
      toast.success("Chiến lược đã được ghi lại", {
        description: `Giao dịch đã được lưu lên Base Sepolia: ${data.txHash.substring(0, 10)}...`
      });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || "Không thể lưu chiến lược. Vui lòng thử lại.";
      toast.error("Lỗi lưu trữ", { description: message });
    }
  });
}

// 3. Leaderboard Query
export function useLeaderboardQuery() {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data } = await axios.get('/api/leaderboard');
      return data;
    },
    refetchInterval: 300000 // 5m
  });
}
