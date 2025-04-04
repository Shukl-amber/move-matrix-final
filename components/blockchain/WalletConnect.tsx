'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/lib/hooks/useWallet';
import { Wallet, Loader } from 'lucide-react';

export function WalletConnect() {
  const { connect, disconnect, connecting, connected, account, error } = useWallet();

  const handleConnect = async () => {
    await connect();
  };

  const handleDisconnect = async () => {
    await disconnect();
  };

  // Format the wallet address for display
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="flex items-center gap-2">
      {error && (
        <div className="text-xs text-destructive mr-2">
          {error.includes('Petra') ? 'Petra wallet not installed' : 'Connection error'}
        </div>
      )}

      {connected && account ? (
        <div className="flex items-center gap-2">
          <div className="hidden md:block rounded-md bg-primary/10 px-2 py-1 text-xs font-medium">
            {formatAddress(account.address)}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDisconnect}
            className="gap-2"
          >
            <Wallet className="h-4 w-4" />
            <span className="hidden md:inline">Disconnect</span>
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={handleConnect}
          disabled={connecting}
          className="gap-2"
        >
          {connecting ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <Wallet className="h-4 w-4" />
          )}
          <span className="hidden md:inline">Connect Wallet</span>
        </Button>
      )}
    </div>
  );
} 