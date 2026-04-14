'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAegisStore } from '@/store/useStore';
import { 
  useAccount, 
  useConnect, 
  useDisconnect, 
  useSwitchChain, 
  useWriteContract,
  useSignMessage
} from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { useConnectModal } from '@rainbow-me/rainbowkit';

const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '84532');
const CHAIN_NAME = process.env.NEXT_PUBLIC_CHAIN_NAME || 'Base Sepolia';
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia.base.org';
const EXPLORER_URL = process.env.NEXT_PUBLIC_BLOCK_EXPLORER || 'https://sepolia.basescan.org';
const SYMBOL = process.env.NEXT_PUBLIC_SYMBOL || 'ETH';

const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '') as `0x${string}`;

const STRATEGY_ABI = [
  {
    "name": "savePrediction",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "_coinPair", "type": "string" },
      { "name": "_entryPrice", "type": "uint256" },
      { "name": "_stopLoss", "type": "uint256" },
      { "name": "_takeProfit", "type": "uint256" },
      { "name": "_aegisScore", "type": "uint8" },
      { "name": "_isLong", "type": "bool" }
    ],
    "outputs": [{ "type": "uint256" }]
  }
] as const;

export function useMetamask() {
  const { address: wagmiAddress, isConnected, chainId } = useAccount();
  const { connect: connectWallet, connectors } = useConnect();
  const { disconnect: disconnectWallet } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const { signMessageAsync } = useSignMessage();
  const { openConnectModal } = useConnectModal();
  
  const { address, setWallet, clearWallet } = useAegisStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const isCorrectChain = chainId === CHAIN_ID;

  // Sync Wagmi state to AegisStore
  useEffect(() => {
    if (isConnected && wagmiAddress) {
      setWallet(wagmiAddress.toLowerCase(), chainId?.toString() || null);
    } else {
      clearWallet();
    }
  }, [isConnected, wagmiAddress, chainId, setWallet, clearWallet]);

  // 1. Switch Network Logic
  const switchToTargetChain = useCallback(async () => {
    try {
      await switchChain({ chainId: CHAIN_ID });
    } catch (error: any) {
      console.error('Failed to switch network', error);
      toast.error(`Vui lòng chuyển mạng sang ${CHAIN_NAME}`);
    }
  }, [switchChain]);

  // 2. Disconnect Logic
  const disconnect = useCallback(() => {
    disconnectWallet();
    toast.info("Wallet disconnected");
    router.push('/');
  }, [disconnectWallet, router]);

  // 3. Connect Logic
  const connect = useCallback(async () => {
    if (openConnectModal) {
      openConnectModal();
    } else {
      // Fallback if modal isn't ready
      const metamaskConnector = connectors.find(c => c.name.toLowerCase().includes('metamask'));
      if (metamaskConnector) {
        connectWallet({ connector: metamaskConnector });
      }
    }
  }, [openConnectModal, connectors, connectWallet]);

  // 4. Smart Contract Execution
  const executeStrategy = useCallback(async (params: {
    coinPair: string;
    entryPrice: number;
    stopLoss: number;
    takeProfit: number;
    aegisScore: number;
    isLong: boolean;
  }) => {
    if (!isConnected || !wagmiAddress) return null;

    const isDemoMode = !CONTRACT_ADDRESS || CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000';

    setIsProcessing(true);
    try {
      if (isDemoMode) {
        toast.warning(`Chế độ Demo: Đang giả lập giao dịch trên ${CHAIN_NAME}...`, {
          description: "Vui lòng ký xác nhận (không tốn phí Gas)."
        });
        
        await signMessageAsync({ 
          message: `Aegis AI Strategy: ${params.coinPair} @ ${params.entryPrice}` 
        });
        
        toast.loading("Đang mô phỏng ghi dữ liệu...", { id: 'demo-loading' });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const mockHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
        
        toast.success("Giả lập thành công!", { 
          id: 'demo-loading',
          description: "Dữ liệu đã được lưu vào lịch sử." 
        });
        
        return mockHash;
      }
      
      const scale = (val: number) => BigInt(Math.round(val * 1e8));

      toast.info("Vui lòng xác nhận giao dịch trên ví...");

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: STRATEGY_ABI,
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

      toast.success("Giao dịch đã gửi!", {
        description: `Tx Hash: ${hash.slice(0, 10)}... Đang chờ xác nhận.`
      });

      return hash;
    } catch (error: any) {
      console.error("Execution failed:", error);
      
      if (error.message?.includes("User rejected")) {
        toast.error("Bạn đã từ chối giao dịch");
      } else if (error.message?.includes("insufficient funds")) {
        toast.error("Không đủ Gas", { 
          description: `Vui lòng nhận thêm ${SYMBOL} trên ${CHAIN_NAME} Faucet.`,
        });
      } else {
        toast.error("Giao dịch thất bại", { description: error.shortMessage || error.message });
      }
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [isConnected, wagmiAddress, writeContractAsync, signMessageAsync]);

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
    SYMBOL
  };
}

