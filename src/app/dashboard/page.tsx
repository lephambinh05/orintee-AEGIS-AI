'use client';

import { useState, useEffect } from 'react';
import { TopBar } from '@/components/dashboard/TopBar';
import { AegisChart } from '@/components/dashboard/AegisChart';
import { ScoreGauge } from '@/components/dashboard/ScoreGauge';
import { Intelligence } from '@/components/dashboard/Intelligence';
import { RiskGuard } from '@/components/dashboard/RiskGuard';
import { useMetamask } from '@/hooks/useMetamask';
import { usePriceQuery, useKlinesQuery, useAnalyzeQuery } from '@/hooks/useMarketData';
import { useSaveStrategy } from '@/hooks/useHistory';
import { useAegisStore } from '@/store/useStore';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

import { GlobalNav } from '@/components/shared/GlobalNav';
import { DashboardSkeleton } from '@/components/shared/Skeleton';

export default function Dashboard() {
  const { address, isConnected, isCorrectChain, switchToTargetChain, executeStrategy, isProcessing, CHAIN_NAME } = useMetamask();
  const { selectedAsset } = useAegisStore();
  const [timeframe, setTimeframe] = useState('1h');
  const [isSuccess, setIsSuccess] = useState(false);

  // 1. Data Layer - TanStack Query
  const { data: priceData, isLoading: isPriceLoading } = usePriceQuery(selectedAsset);
  const { data: klines, isLoading: isKlinesLoading } = useKlinesQuery(selectedAsset, timeframe);
  const { data: analysis, isLoading: isAnalyzeLoading } = useAnalyzeQuery(selectedAsset);
  
  // 2. Persistence Layer - Mutation
  const saveStrategyMutation = useSaveStrategy();

  const isLoading = isPriceLoading || isKlinesLoading || isAnalyzeLoading;

  // Layer 3: Validation Logic
  const canExecute = 
    isConnected && 
    isCorrectChain && 
    analysis && 
    !isProcessing && 
    !saveStrategyMutation.isPending;

  const handleExecute = async () => {
    if (!isConnected) {
      toast.error("Kết nối yêu cầu", { description: "Vui lòng kết nối ví Metamask." });
      return;
    }
    
    if (!isCorrectChain) {
      toast.warning("Sai mạng", { description: "Đang yêu cầu chuyển mạng..." });
      await switchToTargetChain();
      return;
    }

    if (!analysis) {
      toast.error("Dữ liệu chưa sẵn sàng", { description: "Vui lòng chờ AI phân tích dữ liệu thị trường." });
      return;
    }
    
    try {
      const coinPair = selectedAsset.replace('USDT', '/USDT');

      // 1. Execute on Smart Contract
      const txHash = await executeStrategy({
        coinPair,
        entryPrice: analysis.riskGuard.entryPrice,
        stopLoss: analysis.riskGuard.stopLoss,
        takeProfit: analysis.riskGuard.takeProfit,
        aegisScore: analysis.aegisScore,
        isLong: analysis.isLong
      });
      
      if (!txHash) return; // Error already handled in useMetamask
      
      // 2. Save to Backend
      saveStrategyMutation.mutate({
        walletAddress: address,
        txHash,
        coinPair,
        aegisScore: analysis.aegisScore,
        entryPrice: analysis.riskGuard.entryPrice,
        stopLoss: analysis.riskGuard.stopLoss,
        takeProfit: analysis.riskGuard.takeProfit,
        isLong: analysis.isLong
      });

      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err: unknown) {
      console.error("Execution loop failed:", err);
    }
  };

  return (
    <main className="min-h-screen bg-bg-secondary flex flex-col">
      <GlobalNav />
      <TopBar />

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <motion.div 
          className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4 overflow-hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
        {/* Left Column - Chart */}
        <motion.div 
          className="card !p-0 overflow-hidden flex flex-col"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <AegisChart 
            data={klines} 
            symbol={selectedAsset} 
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
          />
        </motion.div>

        {/* Right Column - Controls */}
        <div className="flex flex-col gap-3 overflow-y-auto no-scrollbar">
          <ScoreGauge score={analysis?.aegisScore || 0} />
          
          <Intelligence insights={analysis?.insights} />
          
          <RiskGuard 
            entry={analysis?.riskGuard.entryPrice}
            stopLoss={analysis?.riskGuard.stopLoss}
            takeProfit={analysis?.riskGuard.takeProfit}
          />

          <div className="flex flex-col gap-2">
            <button 
              className="btn-execute disabled:opacity-70 disabled:grayscale disabled:cursor-not-allowed group"
              onClick={handleExecute}
              disabled={!canExecute && !isSuccess}
            >
              {isProcessing || saveStrategyMutation.isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : isSuccess ? (
                "✓ Strategy Saved!"
              ) : (
                "⚡ Execute Strategy"
              )}
            </button>
            <p className="text-[12px] text-text-muted text-center">
              {!isConnected ? "Vui lòng kết nối ví" : !isCorrectChain ? `Chuyển sang ${CHAIN_NAME}` : `Giao dịch sẽ được ghi lên ${CHAIN_NAME}`}
            </p>
          </div>
        </div>
      </motion.div>
      )}
    </main>
  );
}
