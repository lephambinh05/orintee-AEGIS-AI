'use client';

import { ReactNode } from 'react';

export function Web3Provider({ children }: { children: ReactNode }) {
  // RainbowKit and Wagmi have been removed in favor of direct window.ethereum interaction
  // to follow user's requirement for a lighter and more controlled implementation.
  return (
    <div className="contents">
      {children}
    </div>
  );
}
