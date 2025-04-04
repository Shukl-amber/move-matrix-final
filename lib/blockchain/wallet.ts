import { AptosClient, Types } from 'aptos';

// Add type definition for window.aptos
declare global {
  interface Window {
    aptos?: {
      connect: () => Promise<{ address: string; publicKey: string }>;
      isConnected: () => Promise<boolean>;
      account: () => Promise<{ address: string; publicKey: string }>;
      disconnect: () => Promise<void>;
      signAndSubmitTransaction: (transaction: any) => Promise<{ hash: string }>;
      signTransaction: (transaction: any) => Promise<any>;
      signMessage: (message: { message: string }) => Promise<{ signature: string; fullMessage: string }>;
      network: () => Promise<{ name: string; chainId: string; url: string }>;
    };
  }
}

export const checkIfWalletConnected = async (): Promise<boolean> => {
  if (!window.aptos) {
    return false;
  }
  
  try {
    return await window.aptos.isConnected();
  } catch (error) {
    console.error('Error checking wallet connection:', error);
    return false;
  }
};

export const connectWallet = async () => {
  if (!window.aptos) {
    throw new Error('Petra wallet not found. Please install the Petra extension.');
  }
  
  try {
    const response = await window.aptos.connect();
    return {
      address: response.address,
      publicKey: response.publicKey,
      connected: true
    };
  } catch (error) {
    console.error('Error connecting to wallet:', error);
    throw error;
  }
};

export const disconnectWallet = async () => {
  if (!window.aptos) {
    return;
  }
  
  try {
    await window.aptos.disconnect();
  } catch (error) {
    console.error('Error disconnecting wallet:', error);
    throw error;
  }
};

export const getWalletAccount = async () => {
  if (!window.aptos) {
    throw new Error('Wallet not connected');
  }
  
  try {
    return await window.aptos.account();
  } catch (error) {
    console.error('Error getting wallet account:', error);
    throw error;
  }
};

export const executeTransaction = async (
  moduleAddress: string, 
  moduleName: string, 
  functionName: string, 
  typeArgs: string[], 
  args: any[]
) => {
  if (!window.aptos) {
    throw new Error('Wallet not connected');
  }
  
  const transaction = {
    type: 'entry_function_payload',
    function: `${moduleAddress}::${moduleName}::${functionName}`,
    type_arguments: typeArgs,
    arguments: args
  };
  
  try {
    const pendingTransaction = await window.aptos.signAndSubmitTransaction(transaction);
    return pendingTransaction.hash;
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
};

export const getNetworkInfo = async () => {
  if (!window.aptos) {
    throw new Error('Wallet not connected');
  }
  
  try {
    return await window.aptos.network();
  } catch (error) {
    console.error('Error getting network info:', error);
    throw error;
  }
}; 