'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAegisStore } from '@/store/useStore';
import { 
  useAccount, 
  useDisconnect, 
  useSwitchChain, 
  useWriteContract,
  useChainId
} from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { ethers } from 'ethers';
import AegisABI from '@/config/AegisABI.json';

const TARGET_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '84532');
const CHAIN_NAME = process.env.NEXT_PUBLIC_CHAIN_NAME || 'Base Sepolia';
const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '') as string;

export function useMetamask() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const { switchChain } = useSwitchChain();
  const chainId = useChainId();
  const { writeContractAsync } = useWriteContract();

  const [isProcessing, setIsProcessing] = useState(false);
  const isCorrectChain = chainId === TARGET_CHAIN_ID;

  // 1. Connection logic is now handled by RainbowKit ConnectButton or openConnectModal
  const connect = useCallback(() => {
    openConnectModal?.();
  }, [openConnectModal]);

  // 2. Switch Chain
  const switchToTargetChain = useCallback(async () => {
    if (switchChain) {
      switchChain({ chainId: TARGET_CHAIN_ID });
    }
  }, [switchChain]);

  // 3. Execution using Wagmi writeContract (More robust)
  const executeStrategy = useCallback(async (params: {
    coinPair: string;
    entryPrice: number;
    stopLoss: number;
    takeProfit: number;
    aegisScore: number;
    isLong: boolean;
  }) => {
    if (!isConnected || !address) {
      toast.error("Vui lòng kết nối ví");
      return null;
    }

    setIsProcessing(true);
    try {
      // Safe BigInt handling using ethers utils
      const scale = (val: number) => BigInt(ethers.utils.parseUnits(val.toFixed(8), 8).toString());

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: AegisABI,
        functionName: 'savePrediction',
        args: [
          params.coinPair,
          scale(params.entryPrice),
          scale(params.stopLoss),
          scale(params.takeProfit),
          Math.round(params.aegisScore),
          params.isLong
        ],
      });

      toast.loading("Giao dịch đang được xử lý...", { id: 'blockchain-tx' });
      
      // Receipt handling can be done here or in the caller
      toast.success("Giao dịch đã được gửi!", { id: 'blockchain-tx' });
      return hash;
    } catch (error: any) {
      console.error("Execution failed:", error);
      toast.error("Giao dịch thất bại: " + (error.shortMessage || error.message));
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [isConnected, address, writeContractAsync]);

  return {
    address,
    isConnected,
    isCorrectChain,
    switchToTargetChain,
    executeStrategy,
    isProcessing,
    CHAIN_NAME,
    connect,
    disconnect,
    SYMBOL: 'ETH'
  };
}
