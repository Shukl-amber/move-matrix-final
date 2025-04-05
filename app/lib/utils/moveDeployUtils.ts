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
 * Checks if Petra wallet is available and connected
 * @returns The wallet account address if connected
 */
export async function checkWalletConnection() {
  if (typeof window === 'undefined') {
    throw new Error('Wallet functions can only be used in the browser');
  }
  
  if (!(window as any).aptos) {
    throw new Error('Petra wallet extension not detected. Please install it and reload the page.');
  }
  
  const isConnected = await (window as any).aptos.isConnected();
  if (!isConnected) {
    await (window as any).aptos.connect();
    
    // Check again after connect attempt
    const connectedNow = await (window as any).aptos.isConnected();
    if (!connectedNow) {
      throw new Error('Failed to connect to wallet. Please connect manually and try again.');
    }
  }
  
  const account = await (window as any).aptos.account();
  return account.address;
}

/**
 * Deploys compiled Move bytecode using Petra wallet
 * @param metadataHex The compiled package metadata in hex format
 * @param moduleHexes Array of compiled module bytecodes in hex format
 * @returns The transaction hash of the deployment
 */
export async function deployCompiledMove(metadataHex: string, moduleHexes: string[]) {
  const walletAddress = await checkWalletConnection();
  
  console.log(`Deploying from wallet address: ${walletAddress}`);
  console.log(`With ${moduleHexes.length} module(s)`);
  
  // Create the transaction payload with the compiled bytecode
  const payload = {
    type: "entry_function_payload",
    function: "0x1::code::publish_package_txn",
    type_arguments: [],
    arguments: [
      metadataHex,
      moduleHexes
    ]
  };
  
  // Sign and submit the transaction
  const pendingTransaction = await (window as any).aptos.signAndSubmitTransaction({
    payload: payload
  });
  
  if (!pendingTransaction || !pendingTransaction.hash) {
    throw new Error("Transaction submission failed: No hash returned");
  }
  
  return pendingTransaction.hash;
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