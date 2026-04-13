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
    const ethereum = (window as any).ethereum;
    if (!ethereum) return;

    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BASE_SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError: any) {
      // 4902: Chain not added to MetaMask
      if (switchError.code === 4902) {
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
      } else {
        toast.error("Vui lòng chuyển sang mạng Base Sepolia");
      }
    }
  }, []);

  // 2. Disconnect Logic
  const disconnect = useCallback(() => {
    clearWallet();
    toast.info("Đã ngắt kết nối ví");
    router.push('/');
  }, [clearWallet, router]);

  // 3. Connect Logic
  const connect = useCallback(async () => {
    const ethereum = (window as any).ethereum;

    if (typeof ethereum === 'undefined') {
      toast.error("Chưa cài đặt Metamask", {
        description: "Vui lòng cài đặt Metamask để sử dụng AEGIS AI.",
        action: {
          label: "Cài đặt",
          onClick: () => window.open('https://metamask.io/download/', '_blank')
        }
      });
      return;
    }

    if (!ethereum.isMetaMask) {
      toast.error("Vui lòng dùng Metamask", { description: "Hệ thống chuyên dùng cho ví Metamask chính thức." });
      return;
    }

    setIsProcessing(true);
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const currentChainId = await ethereum.request({ method: 'eth_chainId' });
      
      const userAddress = accounts[0].toLowerCase();
      setWallet(userAddress, currentChainId);

      if (currentChainId !== BASE_SEPOLIA_CHAIN_ID) {
        await switchToBaseSepolia();
      }

      toast.success("Kết nối thành công!");
    } catch (error: any) {
      // Handle known error codes
      if (error.code === 4001) {
        toast.error("Từ chối kết nối", { description: "Bạn đã từ chối yêu cầu kết nối ví." });
      } else if (error.code === -32002) {
        toast.warning("Yêu cầu đang chờ", { description: "Vui lòng mở ví Metamask để hoàn tất kết nối." });
      } else {
        toast.error("Lỗi kết nối", { description: error.message });
      }
    } finally {
      setIsProcessing(false);
    }
  }, [setWallet, switchToBaseSepolia]);

  // 4. Smart Contract Execution
  const executeStrategy = useCallback(async (params: any) => {
    const ethereum = (window as any).ethereum;
    if (!ethereum || !address) return null;

    setIsProcessing(true);
    try {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();

      // Simulated Contract Interaction (Layer 3)
      // In production: const contract = new ethers.Contract(ADDR, ABI, signer);
      // const tx = await contract.savePrediction(...);

      // Simulate network latency and gas signature
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a mock txHash for demonstration if not calling real contract
      const txHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
      
      return txHash;
    } catch (error: any) {
      if (error.code === 4001) {
        toast.error("Giao dịch bị từ chối", { description: "Bạn đã hủy lệnh ký trên Metamask." });
      } else if (error.code === -32603) {
        toast.error("Lỗi nội bộ", { description: "Vui lòng kiểm tra số dư Gas hoặc thử lại sau." });
      } else {
        toast.error("Giao dịch thất bại", { description: error.message });
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
