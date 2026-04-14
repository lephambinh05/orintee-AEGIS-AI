'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  chainId: string | null;
  selectedAsset: string;
  setWallet: (address: string | null, chainId: string | null) => void;
  clearWallet: () => void;
  setSelectedAsset: (asset: string) => void;
}

export const useAegisStore = create<WalletState>()(
  persist(
    (set) => ({
      address: null,
      isConnected: false,
      chainId: null,
      selectedAsset: 'BTCUSDT',

      setWallet: (address, chainId) => set({ 
        address: address ? address.toLowerCase() : null, 
        chainId, 
        isConnected: !!address 
      }),
      
      clearWallet: () => set({ 
        address: null, 
        chainId: null, 
        isConnected: false 
      }),

      setSelectedAsset: (asset) => set({ selectedAsset: asset }),
    }),
    {
      name: 'aegis-app-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
