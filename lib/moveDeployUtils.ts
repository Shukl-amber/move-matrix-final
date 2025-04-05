/**
 * Utility functions for compiling and deploying Move code
 */

/**
 * Compiles Move code by sending it to the server API
 * @param code The Move code to compile
 * @returns The compilation result containing metadata and module bytecode
 */
export async function compileMove(code: string) {
  const response = await fetch('/api/compile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Compilation failed: ${errorData.error || 'Unknown error'}`);
  }
  
  const compiledData = await response.json();
  
  if (!compiledData.success || !compiledData.metadataHex || !compiledData.moduleHexes || compiledData.moduleHexes.length === 0) {
    throw new Error('Compilation did not produce valid bytecode');
  }
  
  return compiledData;
}

/**
 * Extracts wallet address from input or checks if wallet is connected
 * @param walletAddress The wallet address provided by the user (optional)
 * @returns The wallet address to use for deployment
 */
export async function getWalletAddress(walletAddress?: string): Promise<string> {
  // If wallet address is provided, use it
  if (walletAddress && walletAddress.trim()) {
    // Basic validation - should start with 0x and be the right length
    if (!walletAddress.startsWith('0x') || walletAddress.length !== 66) {
      throw new Error('Invalid wallet address format. Address should start with 0x and be 64 characters long (including 0x).');
    }
    return walletAddress;
  }
  
  // If no wallet address provided, check if Petra wallet is available
  if (typeof window !== 'undefined' && (window as any).aptos) {
    try {
      const isConnected = await (window as any).aptos.isConnected();
      if (isConnected) {
        const account = await (window as any).aptos.account();
        return account.address;
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error);
    }
  }
  
  throw new Error('No wallet address provided. Please enter a wallet address or connect your Petra wallet.');
}

/**
 * Deploys Move code using the server-side CLI approach
 * @param code The Move code to deploy
 * @param walletAddress The wallet address to deploy from
 * @param compositionId The ID of the composition being deployed
 * @returns The transaction hash of the deployment
 */
export async function deployMoveCode(code: string, walletAddress: string, compositionId: string) {
  console.log(`Deploying code for composition ${compositionId} with wallet address ${walletAddress}`);
  
  const response = await fetch('/api/deploy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      code,
      walletAddress,
      compositionId 
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Deployment failed: ${errorData.error || 'Unknown error'} - ${errorData.details || ''}`);
  }
  
  const deploymentResult = await response.json();
  
  if (!deploymentResult.success || !deploymentResult.txHash) {
    throw new Error('Deployment did not return a transaction hash');
  }
  
  return deploymentResult.txHash;
}

/**
 * Utility function to convert an array of numbers to a hex string
 */
export function bytesToHex(bytes: number[]): string {
  return '0x' + bytes.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Interface for compiled Move module data
 */
export interface CompiledMoveModule {
  success: boolean;
  metadataHex: string;
  moduleHexes: string[];
  moduleName: string;
} 