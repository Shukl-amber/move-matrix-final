import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  connectWallet,
  disconnectWallet,
  checkIfWalletConnected,
  getWalletAccount,
  getNetworkInfo
} from '@/lib/blockchain/wallet';

interface WalletContextType {
  account: { address: string; publicKey: string } | null;
  connecting: boolean;
  connected: boolean;
  network: { name: string; chainId: string; url: string } | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  error: string | null;
}

const WalletContext = createContext<WalletContextType>({
  account: null,
  connecting: false,
  connected: false,
  network: null,
  connect: async () => {},
  disconnect: async () => {},
  error: null,
});

export const useWallet = () => useContext(WalletContext);

interface WalletProviderProps {
  children: React.ReactNode;
}

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const [account, setAccount] = useState<{ address: string; publicKey: string } | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [network, setNetwork] = useState<{ name: string; chainId: string; url: string } | null>(null);

  // Check if wallet is already connected on mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        const isConnected = await checkIfWalletConnected();
        
        if (isConnected) {
          const accountInfo = await getWalletAccount();
          const networkInfo = await getNetworkInfo();
          
          setAccount(accountInfo);
          setNetwork(networkInfo);
          setConnected(true);
        }
      } catch (error) {
        console.error('Failed to initialize wallet connection:', error);
      }
    };
    
    if (typeof window !== 'undefined' && window.aptos) {
      checkWalletConnection();
    }
  }, []);

  const connect = async () => {
    setConnecting(true);
    setError(null);
    
    try {
      if (!window.aptos) {
        throw new Error('Petra wallet not found. Please install the Petra extension.');
      }
      
      const response = await connectWallet();
      const networkInfo = await getNetworkInfo();
      
      setAccount({
        address: response.address,
        publicKey: response.publicKey,
      });
      setNetwork(networkInfo);
      setConnected(true);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError(error instanceof Error ? error.message : 'Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      await disconnectWallet();
      setAccount(null);
      setNetwork(null);
      setConnected(false);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      setError(error instanceof Error ? error.message : 'Failed to disconnect wallet');
    }
  };

  return (
    <WalletContext.Provider
      value={{
        account,
        connecting,
        connected,
        network,
        connect,
        disconnect,
        error,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}; 