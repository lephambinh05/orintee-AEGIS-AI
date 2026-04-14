'use client';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function Web3Provider({ children }: { children: ReactNode }) {
  // Initialize QueryClient inside the component to ensure it's client-side and stable
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <div className="contents">
        {children}
      </div>
    </QueryClientProvider>
  );
}
