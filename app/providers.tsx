'use client';

import React from 'react';
import { WalletProvider } from '@/lib/hooks/useWallet';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <WalletProvider>
      {children}
    </WalletProvider>
  );
} 