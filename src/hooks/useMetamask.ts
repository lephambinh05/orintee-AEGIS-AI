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

const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '') as string;

import { ethers } from 'ethers';
import AegisABI from '@/config/AegisABI.json';

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
    // 1. Resolve multi-wallet conflict (e.g., MetaMask vs TronLink)
    let ethereum = (window as any).ethereum;
    if (ethereum?.providers?.length) {
      ethereum = ethereum.providers.find((p: any) => p.isMetaMask) || ethereum.providers[0];
    }

    if (!ethereum || !wagmiAddress) {
      console.error("[Web3] Ethereum provider or address missing");
      return null;
    }

    console.log("[Web3] Step 1: Found Provider. Contract:", CONTRACT_ADDRESS);
    if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === '') {
      alert("LỖI: Chưa cấu hình NEXT_PUBLIC_CONTRACT_ADDRESS");
      setIsProcessing(false);
      return null;
    }

    setIsProcessing(true);
    try {
      console.log("[Web3] Step 2: Initializing Web3Provider");
      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      
      console.log("[Web3] Step 3: Getting Signer");
      const signer = provider.getSigner();

      console.log("[Web3] Step 4: Validating Network");
      const network = await provider.getNetwork();
      console.log("[Web3] Current Chain ID:", network.chainId);

      if (network.chainId !== CHAIN_ID) {
        console.log("[Web3] Wrong network. Expected:", CHAIN_ID);
        toast.warning(`Đang chuyển mạng sang ${CHAIN_NAME}...`);
        await switchToTargetChain();
        setIsProcessing(false);
        return null;
      }

      console.log("[Web3] Step 5: Initializing ContractInstance");
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        AegisABI,
        signer
      );

      // Scaling logic: Contract expects 10^8 for prices
      const scale = (val: number) => ethers.utils.parseUnits(val.toFixed(8), 8);

      toast.info("Vui lòng xác nhận giao dịch trên ví...");

      const tx = await contract.savePrediction(
        params.coinPair,
        scale(params.entryPrice),
        scale(params.stopLoss),
        scale(params.takeProfit),
        Math.round(params.aegisScore),
        params.isLong
      );

      toast.loading("Giao dịch đã gửi. Đang chờ xác nhận trên Base Sepolia...", { id: 'blockchain-tx' });

      const receipt = await tx.wait();

      toast.success("Minh bạch On-chain thành công!", {
        id: 'blockchain-tx',
        description: `Giao dịch đã được confirm. Hash: ${receipt.transactionHash.slice(0, 10)}...`
      });

      return receipt.transactionHash;
    } catch (error: any) {
      console.error("Execution failed:", error);
      alert("GIAO DỊCH LỖI: " + (error.message || "Không xác định"));
      
      const errorMessage = error.message?.toLowerCase() || "";
      
      if (errorMessage.includes("user rejected")) {
        toast.error("Giao dịch bị từ chối", { description: "Người dùng đã hủy yêu cầu ký trên ví." });
      } else if (errorMessage.includes("insufficient funds")) {
        toast.error("Không đủ số dư", { 
          description: `Tài khoản không đủ ${SYMBOL} để trả phí gas trên ${CHAIN_NAME}.`,
          duration: 6000
        });
      } else {
        toast.error("Giao dịch thất bại", { 
          description: error.reason || "Đã xảy ra lỗi khi tương tác với Smart Contract." 
        });
      }
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [wagmiAddress, CHAIN_ID, CHAIN_NAME, CONTRACT_ADDRESS, SYMBOL, switchToTargetChain]);

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

