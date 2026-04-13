'use client';

import { useState, useEffect } from 'react';
import { TopBar } from '@/components/dashboard/TopBar';
import { AegisChart } from '@/components/dashboard/AegisChart';
import { ScoreGauge } from '@/components/dashboard/ScoreGauge';
import { Intelligence } from '@/components/dashboard/Intelligence';
import { RiskGuard } from '@/components/dashboard/RiskGuard';
import { useAegisPrice } from '@/hooks/useAegisPrice';
import { useAegisLogic } from '@/hooks/useAegisLogic';
import { useMetamask } from '@/hooks/useMetamask';
import { useAegisStore } from '@/store/useStore';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

import { GlobalNav } from '@/components/shared/GlobalNav';
import { DashboardSkeleton } from '@/components/shared/Skeleton';

export default function Dashboard() {
  const { account, isConnected, isCorrectNetwork, switchChain } = useMetamask();
  const { selectedAsset, setPriceData, addTradeRecord } = useAegisStore();
  const [timeframe, setTimeframe] = useState('1h');
  const { data: liveData, klines } = useAegisPrice(selectedAsset, timeframe);
  const calculations = useAegisLogic(liveData?.price, klines);

  const [isExecuting, setIsExecuting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initial loading state
  useEffect(() => {
    if (liveData && calculations) {
      const timer = setTimeout(() => setIsLoading(false), 800);
      return () => clearTimeout(timer);
    }
  }, [liveData, calculations]);

  // Sync live price to store
  useEffect(() => {
    if (liveData) {
      setPriceData({ price: liveData.price, change24h: liveData.change24h });
    }
  }, [liveData, setPriceData]);

  // Layer 3: 5-Check Conditions for Execute
  const canExecute = 
    isConnected && 
    isCorrectNetwork && 
    calculations && 
    !isExecuting && 
    liveData?.price;

  const handleExecute = async () => {
    if (!isConnected) {
      toast.error("Kết nối yêu cầu", { description: "Vui lòng kết nối ví Metamask." });
      return;
    }
    
    if (!isCorrectNetwork) {
      toast.warning("Sai mạng", { description: "Đang yêu cầu chuyển mạng..." });
      await switchChain();
      return;
    }

    if (!calculations) {
      toast.error("Dữ liệu chưa sẵn sàng", { description: "Vui lòng chờ AI phân tích dữ liệu thị trường." });
      return;
    }
    
    // Lock button immediately
    setIsExecuting(true);
    
    try {
      // Layer 3: Metamask Smart Contract Interaction (Simulated as per prompt instructions)
      // In a real app, this would be: await contract.savePrediction(...)
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(resolve, 2000);
        // Simulate potential user rejection or failure
        // if (Math.random() > 0.9) reject({ code: 4001 }); 
      });
      
      const newRecord = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        coinPair: selectedAsset,
        position: (calculations.isLong ? 'Long' : 'Short') as 'Long' | 'Short',
        aegisScore: calculations.aegisScore,
        entryPrice: calculations.entryPrice,
        stopLoss: calculations.stopLoss,
        takeProfit: calculations.takeProfit,
        status: (Math.random() > 0.5 ? 'Win' : 'Loss') as 'Win' | 'Loss',
        txHash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')
      };
      
      // Layer 4: Wrapped in internal store logic which handles try/catch
      addTradeRecord(newRecord);
      
      toast.success("Chiến lược đã được ghi nhận", {
        description: `Giao dịch ${selectedAsset} đã được lưu lên Base Sepolia.`
      });
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err: any) {
      // Layer 3: Handle Metamask error codes
      if (err.code === 4001) {
        toast.error("Từ chối giao dịch", { description: "Bạn đã từ chối ký giao dịch trên Metamask." });
      } else if (err.code === -32000 || err.message?.includes('insufficient funds')) {
        toast.error("Không đủ Gas", { 
          description: "Vui lòng nạp thêm ETH vào mạng Base Sepolia để tiếp tục.",
          action: {
            label: "Lấy Faucet ETH",
            onClick: () => window.open('https://sepolia-faucet.pk910.de/', '_blank')
          }
        });
      } else {
        toast.error("Giao dịch thất bại", { description: err.message || "Đã có lỗi xảy ra khi gọi Smart Contract." });
      }
    } finally {
      setIsExecuting(false);
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
          <ScoreGauge score={calculations?.aegisScore || 0} />
          
          <Intelligence />
          
          <RiskGuard 
            entry={calculations?.entryPrice}
            stopLoss={calculations?.stopLoss}
            takeProfit={calculations?.takeProfit}
          />

          <div className="flex flex-col gap-2">
            <button 
              className="btn-execute disabled:opacity-70 disabled:grayscale disabled:cursor-not-allowed group"
              onClick={handleExecute}
              disabled={!canExecute && !isSuccess}
            >
              {isExecuting ? (
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
              {!isConnected ? "Vui lòng kết nối ví" : !isCorrectNetwork ? "Chuyển sang Base Sepolia" : "Giao dịch sẽ được ghi lên Base Sepolia"}
            </p>
          </div>
        </div>
      </motion.div>
      )}
    </main>
  );
}
