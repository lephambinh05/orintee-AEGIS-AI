'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAegisStore } from '@/store/useStore';
import { ethers } from 'ethers';

const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID || '0x14a34';
const CHAIN_NAME = process.env.NEXT_PUBLIC_CHAIN_NAME || 'Base Sepolia';
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia.base.org';
const EXPLORER_URL = process.env.NEXT_PUBLIC_BLOCK_EXPLORER || 'https://sepolia.basescan.org';
const SYMBOL = process.env.NEXT_PUBLIC_SYMBOL || 'ETH';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';

const STRATEGY_ABI = [
  "function savePrediction(string _coinPair, uint256 _entryPrice, uint256 _stopLoss, uint256 _takeProfit, uint8 _aegisScore, bool _isLong) public returns (uint256)"
];

export function useMetamask() {
  const { address, chainId, setWallet, clearWallet } = useAegisStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const isConnected = !!address;
  const isCorrectChain = chainId === CHAIN_ID;

  // 1. Switch Network Logic
  const switchToTargetChain = useCallback(async () => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) return;

    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CHAIN_ID }],
      });
    } catch (switchError: unknown) {
      const error = switchError as { code: number };
      if (error.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: CHAIN_ID,
                chainName: CHAIN_NAME,
                nativeCurrency: { name: SYMBOL, symbol: SYMBOL, decimals: 18 },
                rpcUrls: [RPC_URL],
                blockExplorerUrls: [EXPLORER_URL],
              },
            ],
          });
        } catch (addError) {
          console.error('Failed to add network', addError);
          toast.error(`Không thể thêm mạng ${CHAIN_NAME}`);
        }
      } else if (error.code === 4001) {
        toast.error("Bạn đã từ chối chuyển mạng");
      } else {
        toast.error("Vui lòng chuyển mạng để tiếp tục");
      }
    }
  }, []);

  // 2. Disconnect Logic (T3.4)
  const disconnect = useCallback(() => {
    clearWallet();
    toast.info("Wallet disconnected");
    router.push('/');
  }, [clearWallet, router]);

  // 3. Connect Logic (T3.1, T3.3)
  const connect = useCallback(async () => {
    const ethereum = (window as any).ethereum;

    if (typeof ethereum === 'undefined') {
      toast.error("Vui lòng cài Metamask", {
        description: "Metamask extension is required to use Aegis AI.",
        action: {
          label: "Cài đặt",
          onClick: () => window.open('https://metamask.io/download/', '_blank')
        }
      });
      return;
    }

    if (!ethereum.isMetaMask) {
      toast.error("Vui lòng dùng Metamask", { description: "Please use the official Metamask wallet." });
      return;
    }

    setIsProcessing(true);
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' }) as string[];
      const currentChainId = await ethereum.request({ method: 'eth_chainId' }) as string;
      
      const userAddress = accounts[0].toLowerCase();
      setWallet(userAddress, currentChainId);

      if (currentChainId !== CHAIN_ID) {
        await switchToTargetChain();
      }

      toast.success("Kết nối thành công!");
      router.push('/dashboard'); // T3.3 auto redirect
    } catch (error: unknown) {
      const err = error as { code: number; message: string };
      if (err.code === 4001) {
        toast.error("Từ chối kết nối", { description: "Bạn đã từ chối yêu cầu kết nối ví." });
      } else if (err.code === -32002) {
        toast.warning("Yêu cầu đang chờ", { description: "Vui lòng mở ví Metamask để hoàn tất kết nối." });
      } else {
        toast.error("Lỗi kết nối", { description: err.message });
      }
    } finally {
      setIsProcessing(false);
    }
  }, [setWallet, switchToBaseSepolia, router]);

  // 4. Smart Contract Execution (T3.6) - Real Implementation with Demo Fallback
  const executeStrategy = useCallback(async (params: {
    coinPair: string;
    entryPrice: number;
    stopLoss: number;
    takeProfit: number;
    aegisScore: number;
    isLong: boolean;
  }) => {
    const ethereum = (window as any).ethereum;
    if (!ethereum || !address) return null;

    // Check for Demo Mode (if no contract address is set)
    const isDemoMode = !CONTRACT_ADDRESS || CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000';

    setIsProcessing(true);
    try {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();

      if (isDemoMode) {
        toast.warning(`Chế độ Demo: Đang giả lập giao dịch trên ${CHAIN_NAME}...`, {
          description: "Vui lòng ký xác nhận (không tốn phí Gas)."
        });
        
        // Request a simple signature to make the demo feel real
        await signer.signMessage(`Aegis AI Strategy: ${params.coinPair} @ ${params.entryPrice}`);
        
        toast.loading("Đang mô phỏng ghi dữ liệu...", { id: 'demo-loading' });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const mockHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
        
        toast.success("Giả lập thành công!", { 
          id: 'demo-loading',
          description: "Dữ liệu đã được lưu vào lịch sử." 
        });
        
        return mockHash;
      }
      
      const contract = new ethers.Contract(CONTRACT_ADDRESS, STRATEGY_ABI, signer);

      // Scaling prices by 10^8 per PRD (uint256)
      const scale = (val: number) => ethers.BigNumber.from(Math.round(val * 1e8));

      toast.info("Vui lòng xác nhận giao dịch trên ví Metamask...");

      const tx = await contract.savePrediction(
        params.coinPair,
        scale(params.entryPrice),
        scale(params.stopLoss),
        scale(params.takeProfit),
        Math.round(params.aegisScore),
        params.isLong
      );

      toast.loading(`Đang ghi dữ liệu lên ${CHAIN_NAME}...`, {
        description: "Vui lòng chờ giao dịch được xác nhận (Mined)."
      });

      const receipt = await tx.wait();
      
      toast.success("Giao dịch thành công!", {
        description: `Tx Hash: ${receipt.transactionHash.slice(0, 10)}...`
      });

      return receipt.transactionHash as string;
    } catch (error: unknown) {
      const err = error as { code: number; message: string };
      console.error("Execution failed:", err);
      
      if (err.code === 4001) {
        toast.error("Bạn đã từ chối giao dịch", { description: "Lệnh ký đã bị hủy trên ví." });
      } else if (err.message?.includes("insufficient funds")) {
        toast.error("Không đủ Gas", { 
          description: `Vui lòng nhận thêm ${SYMBOL} trên ${CHAIN_NAME} Faucet.`,
          action: {
            label: "Faucet",
            onClick: () => window.open(EXPLORER_URL, '_blank')
          }
        });
      } else {
        toast.error("Giao dịch thất bại", { description: err.message || "Vui lòng thử lại sau." });
      }
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [address]);

  // 5. Listeners
  useEffect(() => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setWallet(accounts[0].toLowerCase(), chainId);
      }
    };

    const handleChainChanged = (newChainId: string) => {
      setWallet(address, newChainId);
      if (newChainId !== CHAIN_ID) {
        toast.warning("Sai mạng kết nối", { description: `Vui lòng chuyển sang ${CHAIN_NAME} để tiếp tục.` });
      }
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [address, chainId, setWallet, disconnect]);

    connect,
    disconnect,
    switchToTargetChain,
    executeStrategy,
    CHAIN_NAME,
    SYMBOL
  };
}
