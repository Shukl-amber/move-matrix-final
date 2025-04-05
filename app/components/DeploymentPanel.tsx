import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Rocket, Check, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { IDeploymentResult } from '@/lib/services/codeGenerationService';

interface DeploymentPanelProps {
  onDeploy: (network: 'testnet' | 'mainnet', address: string) => Promise<IDeploymentResult>;
  isValidated: boolean;
}

export default function DeploymentPanel({ onDeploy, isValidated }: DeploymentPanelProps) {
  const [network, setNetwork] = useState<'testnet' | 'mainnet'>('testnet');
  const [address, setAddress] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<IDeploymentResult | null>(null);
  
  const handleDeploy = async () => {
    if (!isValidated) {
      alert('Please validate your composition before deploying');
      return;
    }
    
    if (!address) {
      alert('Please enter a wallet address');
      return;
    }
    
    setIsDeploying(true);
    try {
      const result = await onDeploy(network, address);
      setDeploymentResult(result);
    } catch (error) {
      console.error('Deployment failed:', error);
      setDeploymentResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsDeploying(false);
    }
  };
  
  const explorerUrl = network === 'testnet'
    ? 'https://explorer.aptoslabs.com/txn/'
    : 'https://explorer.aptoslabs.com/txn/';
  
  return (
    <Card className="p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Rocket className="h-5 w-5 text-blue-500" />
        <h2 className="text-xl font-bold">Deploy Your Composition</h2>
      </div>
      
      {!deploymentResult ? (
        <>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">1. Select Network</h3>
              <div className="flex flex-col space-y-3">
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="testnet" 
                    name="network" 
                    value="testnet"
                    checked={network === 'testnet'}
                    onChange={() => setNetwork('testnet')}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="testnet" className="font-medium">
                    Testnet
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Deploy to testnet for testing purposes (recommended)
                    </p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="mainnet" 
                    name="network" 
                    value="mainnet"
                    checked={network === 'mainnet'}
                    onChange={() => setNetwork('mainnet')}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="mainnet" className="font-medium">
                    Mainnet
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Deploy to mainnet for production use (requires real funds)
                    </p>
                  </Label>
                </div>
              </div>
            </div>
            
            <hr className="border-t border-gray-200 dark:border-gray-700 my-4" />
            
            <div>
              <h3 className="text-lg font-medium mb-3">2. Connect Wallet</h3>
              <div className="space-y-3">
                <div className="grid gap-2">
                  <Label htmlFor="address">Wallet Address</Label>
                  <Input 
                    id="address" 
                    placeholder="0x..." 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                  <p className="text-sm text-gray-500">
                    The wallet that will sign the deployment transaction
                  </p>
                </div>
              </div>
            </div>
            
            <hr className="border-t border-gray-200 dark:border-gray-700 my-4" />
            
            <div>
              <h3 className="text-lg font-medium mb-3">3. Deployment Details</h3>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Network</p>
                  <p className="font-medium">{network === 'testnet' ? 'Testnet' : 'Mainnet'}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Gas Budget</p>
                  <p className="font-medium">1000 APTOS</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Estimated Fees</p>
                  <p className="font-medium">~0.01 APTOS</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Status</p>
                  <p className={`font-medium ${isValidated ? 'text-green-500' : 'text-amber-500'}`}>
                    {isValidated ? 'Ready to Deploy' : 'Not Validated'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isDeploying || !isValidated}
                onClick={handleDeploy}
              >
                {isDeploying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Rocket className="mr-2 h-4 w-4" />
                    Deploy Composition
                  </>
                )}
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          {deploymentResult.success ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-md p-4 flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium text-green-800 dark:text-green-300">Deployment Successful!</h3>
                <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                  Your composition has been successfully deployed to the blockchain.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-md p-4 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800 dark:text-red-300">Deployment Failed</h3>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                  {deploymentResult.error || 'An unknown error occurred during deployment.'}
                </p>
              </div>
            </div>
          )}
          
          {deploymentResult.success && (
            <div className="space-y-4">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                <h3 className="font-medium mb-2">Deployment Details</h3>
                <div className="grid gap-y-3">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <p className="text-gray-500 dark:text-gray-400">Network</p>
                    <p className="col-span-2 font-medium">{network === 'testnet' ? 'Testnet' : 'Mainnet'}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <p className="text-gray-500 dark:text-gray-400">Transaction Hash</p>
                    <div className="col-span-2 font-mono text-xs flex items-center">
                      <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                        {deploymentResult.transactionHash || 'N/A'}
                      </code>
                      {deploymentResult.transactionHash && (
                        <a 
                          href={`${explorerUrl}${deploymentResult.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-600 ml-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <p className="text-gray-500 dark:text-gray-400">Module Address</p>
                    <div className="col-span-2 font-mono text-xs">
                      <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                        {deploymentResult.deploymentAddress || 'N/A'}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-md p-4">
                <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Next Steps</h3>
                <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-2 list-disc list-inside">
                  <li>View your composition in the blockchain explorer</li>
                  <li>Test the composition by interacting with it</li>
                  <li>Share your composition with others</li>
                  <li>Create more complex compositions</li>
                </ul>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3">
            {deploymentResult.success ? (
              <Button 
                variant="outline"
                onClick={() => setDeploymentResult(null)}
              >
                Deploy Another Composition
              </Button>
            ) : (
              <Button 
                variant="outline"
                onClick={() => setDeploymentResult(null)}
              >
                Try Again
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
} 