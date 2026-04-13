'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const BASE_SEPOLIA_CHAIN_ID = '0x14a34'; // 84532 decimal

export type MetaMaskError = {
  code: number;
  message: string;
};

export function useMetamask() {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const router = useRouter();

  // Initialize
  useEffect(() => {
    const ethereum = (window as any).ethereum;
    if (ethereum) {
      setIsInstalled(true);
      
      // Get initial state
      ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) setAccount(accounts[0]);
        });
        
      ethereum.request({ method: 'eth_chainId' })
        .then((id: string) => setChainId(id));
      
      // Layer 2: Realtime Listeners
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // Disconnected
          setAccount(null);
          toast.warning("Ví đã ngắt kết nối", { description: "Đang chuyển về trang chủ..." });
          router.push('/');
        } else if (accounts[0] !== account) {
          // Account changed
          setAccount(accounts[0]);
          toast.info("Đã đổi tài khoản ví", { description: "Đang chuyển về trang chủ để đảm bảo an toàn..." });
          router.push('/');
        }
      };

      const handleChainChanged = (id: string) => {
        setChainId(id);
        if (id !== BASE_SEPOLIA_CHAIN_ID) {
          toast.warning("Sai mạng kết nối", { description: "Vui lòng chuyển sang Base Sepolia để tiếp tục." });
        }
      };

      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);

      return () => {
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
        ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [router, account]);

  const switchChain = useCallback(async () => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) return;

    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BASE_SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: BASE_SEPOLIA_CHAIN_ID,
                chainName: 'Base Sepolia',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://sepolia.base.org'],
                blockExplorerUrls: ['https://sepolia.basescan.org'],
              },
            ],
          });
        } catch (addError) {
          console.error('Failed to add network', addError);
        }
      }
    }
  }, []);

  const connect = useCallback(async () => {
    const ethereum = (window as any).ethereum;
    
    // Layer 1: Check installation and isMetaMask
    if (!ethereum) {
      toast.error("Chưa cài đặt Metamask", { description: "Vui lòng cài đặt Metamask để sử dụng AEGIS AI." });
      return;
    }

    if (!ethereum.isMetaMask) {
      toast.error("Không phải ví Metamask", { description: "Hệ thống chỉ hỗ trợ ví Metamask chính thức." });
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      
      const currentChainId = await ethereum.request({ method: 'eth_chainId' });
      setChainId(currentChainId);

      if (currentChainId !== BASE_SEPOLIA_CHAIN_ID) {
        await switchChain();
      }

      toast.success("Kết nối thành công!");
    } catch (error: any) {
      if (error.code === 4001) {
        toast.error("Từ chối kết nối", { description: "Bạn đã từ chối yêu cầu kết nối ví." });
      } else {
        toast.error("Lỗi kết nối", { description: error.message });
      }
    } finally {
      setIsConnecting(false);
    }
  }, [switchChain]);

  return {
    account,
    chainId,
    isInstalled,
    isConnecting,
    isConnected: !!account,
    isCorrectNetwork: chainId === BASE_SEPOLIA_CHAIN_ID,
    connect,
    switchChain,
  };
}
