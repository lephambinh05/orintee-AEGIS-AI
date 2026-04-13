'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAegisStore } from '@/store/useStore';
import { ethers } from 'ethers';

const BASE_SEPOLIA_CHAIN_ID = '0x14a34'; // 84532 decimal

export function useMetamask() {
  const { address, chainId, setWallet, clearWallet } = useAegisStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const isConnected = !!address;
  const isCorrectChain = chainId === BASE_SEPOLIA_CHAIN_ID;

  // 1. Switch Network Logic
  const switchToBaseSepolia = useCallback(async () => {
    const ethereum = (window as any).ethereum; // Using any here as standard practice for window.ethereum cast
    if (!ethereum) return;

    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BASE_SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError: unknown) {
      const error = switchError as { code: number };
      if (error.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: BASE_SEPOLIA_CHAIN_ID,
                chainName: 'Base Sepolia',
                nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://sepolia.base.org'],
                blockExplorerUrls: ['https://sepolia.basescan.org'],
              },
            ],
          });
        } catch (addError) {
          console.error('Failed to add network', addError);
          toast.error("Không thể thêm mạng Base Sepolia");
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

      if (currentChainId !== BASE_SEPOLIA_CHAIN_ID) {
        await switchToBaseSepolia();
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

  // 4. Smart Contract Execution (T3.6)
  const executeStrategy = useCallback(async () => {
    const ethereum = (window as any).ethereum;
    if (!ethereum || !address) return null;

    setIsProcessing(true);
    try {
      const provider = new ethers.providers.Web3Provider(ethereum);
      // Remove unused signer variable
      await provider.getSigner();

      // Simulated transaction logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const txHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
      return txHash;
    } catch (error: unknown) {
      const err = error as { code: number; message: string };
      if (err.code === 4001) {
        // T3.6 Exact Phrase
        toast.error("Bạn đã từ chối giao dịch", { description: "Lệnh ký đã bị hủy trên ví." });
      } else {
        toast.error("Giao dịch thất bại", { description: err.message });
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
      if (newChainId !== BASE_SEPOLIA_CHAIN_ID) {
        toast.warning("Sai mạng kết nối", { description: "Vui lòng chuyển sang Base Sepolia để tiếp tục." });
      }
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [address, chainId, setWallet, disconnect]);

  return {
    address,
    chainId,
    isConnected,
    isCorrectChain,
    isProcessing,
    connect,
    disconnect,
    switchToBaseSepolia,
    executeStrategy
  };
}
