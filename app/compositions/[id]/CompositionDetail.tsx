'use client';

/* IMPORTANT: Browser-only Component
 * This component uses browser-specific APIs (window, wallet integration)
 * While the 'use client' directive ensures it runs only on the client side,
 * Next.js still performs an initial server-side render. Therefore,
 * we need extra checks before accessing browser-only objects like 'window'.
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Code, 
  Edit, 
  ExternalLink, 
  Link2, 
  Trash2, 
  ArrowRight,
  Play,
  Download 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IConnection, CompositionStatus, IComposition } from '@/lib/db/models/composition';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { IPrimitive } from '@/lib/db/models/primitive';
import CodeViewer from '@/app/components/CodeViewer';
import { getWalletAddress, deployMoveCode } from '@/lib/moveDeployUtils';

// Update the interface to include explorerUrl
interface IDeploymentResult {
  success: boolean;
  transactionHash?: string;
  deploymentAddress?: string;
  explorerUrl?: string;
  error?: string;
}

interface IGeneratedCode {
  moduleName: string;
  sourceCode: string;
  imports: string[];
  functions: {
    name: string;
    parameters: string[];
    returnType: string;
    body: string;
  }[];
  fullSourceCode: string;
}

// Extend the IComposition interface for MongoDB compatibility
interface ExtendedComposition extends IComposition {
  _id?: string; // MongoDB uses _id
}

// Import DeploymentPanel if it doesn't have TypeScript issues
// If it has TypeScript issues, we'll create a simpler version
// import DeploymentPanel from '@/app/components/DeploymentPanel';

interface CompositionDetailProps {
  composition: ExtendedComposition;
  primitives: Record<string, IPrimitive | null>;
}

// Define the response type structure for deployComposition
interface DeploymentResponse {
  success: boolean;
  txHash?: string;
  moduleName?: string;
  error?: string;
  details?: string;
  preparedData?: {
    code: string;
    compositionId: string;
    moduleName: string;
  };
}

export default function CompositionDetail({ composition, primitives }: CompositionDetailProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [alertOpen, setAlertOpen] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState(composition.status || CompositionStatus.DRAFT);
  const [deploying, setDeploying] = useState(false);
  const [isValidated, setIsValidated] = useState(deploymentStatus !== CompositionStatus.DRAFT);
  
  // State for generated code
  const [generatedCode, setGeneratedCode] = useState<IGeneratedCode | null>(null);
  const [deploymentResult, setDeploymentResult] = useState<IDeploymentResult | null>(null);
  const [deploymentError, setDeploymentError] = useState<string | null>(null);
  
  // Set isClient to true once the component mounts
  // This ensures we only run client-side code after hydration is complete
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Format date
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get status badge color
  const getStatusBadge = (status: string | undefined) => {
    switch(status) {
      case CompositionStatus.DRAFT:
        return <Badge variant="outline">Draft</Badge>;
      case CompositionStatus.COMPLETE:
        return <Badge variant="secondary">Complete</Badge>;
      case CompositionStatus.DEPLOYED:
        return <Badge variant="success">Deployed</Badge>;
      default:
        return <Badge variant="outline">Draft</Badge>;
    }
  };
  
  // Handle delete
  const handleDelete = () => {
    console.log('Deleting composition:', composition.id);
    router.push('/compositions');
  };
  
  // Function to handle deployment with our utility functions
  const startDeployment = async (address: string) => {
    // Don't proceed if we're not client-side yet
    if (!isClient) {
      console.warn("Cannot deploy: Component not yet hydrated on client");
      return;
    }
    
    if (!composition) {
      alert("Missing composition");
      return;
    }

    try {
      setDeploying(true);
      setDeploymentError(null);
      
      // Convert composition._id to string if it's an ObjectId
      const compositionId = (composition.id || composition._id)?.toString();
      
      if (!compositionId) {
        console.error("Missing composition ID in:", composition);
        setDeploymentError("Missing composition ID");
        return;
      }
      
      // Import the real deployment functions 
      const { generateMoveCode } = await import('@/app/actions/compositionActions');
      
      // Generate the Move code first
      const codeGenResponse = await generateMoveCode(compositionId, composition);
      
      if (!codeGenResponse.success || !codeGenResponse.code) {
        console.error("Code generation failed:", codeGenResponse.error);
        setDeploymentError(codeGenResponse.error || "Failed to generate code");
        setDeploymentResult({
          success: false,
          error: codeGenResponse.error || "Failed to generate code"
        });
        return;
      }
      
      // Extract the code
      const code = codeGenResponse.code;
      
      console.log("Generated Move code for deployment:", { 
        codeLength: code.length, 
        compositionId
      });
      
      try {
        // Validate and get the wallet address
        const validatedAddress = await getWalletAddress(address);
        
        console.log("Using wallet address for deployment:", validatedAddress);
        
        // Deploy the Move code using the CLI approach
        const txHash = await deployMoveCode(code, validatedAddress, compositionId);
        
        console.log("Deployment successful! Transaction hash:", txHash);
        
        // Update the server about the successful deployment
        const { updateCompositionAfterDeployment } = await import('@/app/actions/compositionActions');
        await updateCompositionAfterDeployment(compositionId, txHash);
        
        // Update the UI state
        setDeploymentStatus(CompositionStatus.DEPLOYED);
        setDeploymentResult({
          success: true,
          transactionHash: txHash,
          deploymentAddress: validatedAddress,
          explorerUrl: `https://explorer.aptoslabs.com/txn/${txHash}?network=testnet`
        });
        
      } catch (error: any) {
        console.error("Error during deployment process:", error);
        
        // Extract the most meaningful error message
        let errorMessage = error instanceof Error ? error.message : String(error);
        
        // Add more helpful context based on the error message
        if (errorMessage.includes("Invalid wallet address")) {
          errorMessage += "\n\nPlease enter a valid Aptos wallet address starting with 0x.";
        } else if (errorMessage.includes("No wallet address provided")) {
          errorMessage += "\n\nPlease enter your wallet address or connect your Petra wallet.";
        } else if (errorMessage.includes("Compilation failed")) {
          errorMessage += "\n\nPlease check your Move code for syntax errors.";
        }
        
        setDeploymentError(errorMessage);
        setDeploymentResult({
          success: false,
          error: errorMessage
        });
      }
    } finally {
      setDeploying(false);
    }
  };
  
  // Generate code
  const handleGenerateCode = async () => {
    try {
      // Set loading state
      setDeploying(true);
      
      // Verify and extract the composition ID - MongoDB might use _id instead of id
      const compositionId = composition.id || (composition as any)._id;
      
      if (!compositionId) {
        console.error('Composition object:', JSON.stringify(composition, null, 2));
        throw new Error('Missing composition ID - could not find id or _id property');
      }
      
      console.log('Starting code generation for composition ID:', compositionId);
      
      // Import the real code generation function
      const { generateMoveCode } = await import('@/app/actions/compositionActions');
      
      // Call the server action to generate code
      const result = await generateMoveCode(String(compositionId), composition);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate Move code');
      }
      
      console.log('Code generation successful, received code length:', result.code?.length || 0);
      
      // Convert the generated code to the IGeneratedCode format that the UI expects
      const generatedSourceCode = result.code || '';
      
      // Log the first few lines to verify content
      console.log('Generated code preview:', 
        generatedSourceCode.split('\n').slice(0, 10).join('\n'));
      
      // Parse the Move code to extract different parts
      // This is a simplified parsing - in production, you'd want more robust parsing
      const moduleNameMatch = generatedSourceCode.match(/module\s+[^:]+::([a-zA-Z0-9_]+)/);
      const moduleName = moduleNameMatch ? moduleNameMatch[1] : composition.name.toLowerCase().replace(/\s+/g, '_');
      
      // Extract imports
      const importMatches = generatedSourceCode.match(/use\s+[^;]+;/g) || [];
      const imports = importMatches.map(imp => imp.trim());
      
      // Extract functions (simplified - this would need to be more robust in production)
      const functionMatches = generatedSourceCode.match(/public\s+(entry\s+)?fun\s+([^(]+)\([^{]*\{[^}]*\}/g) || [];
      const functions = functionMatches.map(func => {
        const nameMatch = func.match(/fun\s+([^(]+)/);
        const paramsMatch = func.match(/\(([^)]*)\)/);
        const bodyMatch = func.match(/\{([^}]*)\}/);
        
        return {
          name: nameMatch ? nameMatch[1].trim() : 'execute',
          parameters: paramsMatch ? paramsMatch[1].split(',').map(p => p.trim()) : [],
          returnType: 'void', // Simplified
          body: bodyMatch ? bodyMatch[1].trim() : ''
        };
      });
      
      // Create the complete IGeneratedCode object
      const code: IGeneratedCode = {
        moduleName,
        sourceCode: generatedSourceCode,
        imports,
        functions,
        fullSourceCode: generatedSourceCode
      };
      
      setGeneratedCode(code);
      setIsValidated(true);
      setActiveTab('code');
      
      console.log('Code parsing complete:', { 
        moduleName, 
        importCount: imports.length,
        functionCount: functions.length
      });
    } catch (error) {
      console.error('Error generating code:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate code');
    } finally {
      setDeploying(false);
    }
  };

  // SimpleDeploymentPanel component
  const SimpleDeploymentPanel = ({ 
    onDeploy,
    deploymentError,
    deploymentResult,
    isDeploying,
    isValidated
  }: { 
    onDeploy: (address: string) => void;
    deploymentError: string | null;
    deploymentResult: IDeploymentResult | null;
    isDeploying: boolean;
    isValidated: boolean;
  }) => {
    const [address, setAddress] = useState<string>("");
    const [walletConnected, setWalletConnected] = useState<boolean>(false);
    const [connecting, setConnecting] = useState<boolean>(false);
    
    // Check if wallet is connected when component mounts
    useEffect(() => {
      const checkWalletConnection = async () => {
        if (typeof window !== 'undefined' && (window as any).aptos) {
          try {
            const isConnected = await (window as any).aptos.isConnected();
            setWalletConnected(isConnected);
            
            if (isConnected) {
              const account = await (window as any).aptos.account();
              setAddress(account.address);
            }
          } catch (error) {
            console.error("Error checking wallet connection:", error);
          }
        }
      };
      
      checkWalletConnection();
    }, []);
    
    // Connect wallet function
    const connectWallet = async () => {
      if (typeof window === 'undefined' || !(window as any).aptos) {
        alert("Petra wallet extension not detected. Please install it and reload the page.");
        return;
      }
      
      try {
        setConnecting(true);
        await (window as any).aptos.connect();
        const account = await (window as any).aptos.account();
        setAddress(account.address);
        setWalletConnected(true);
      } catch (error) {
        console.error("Error connecting to wallet:", error);
        alert("Failed to connect to wallet. Please try again.");
      } finally {
        setConnecting(false);
      }
    };
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Deploy to Aptos Testnet</h3>
        
        <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-800 text-sm mb-4">
          <p><strong>Note:</strong> Deployment is now performed through the Aptos CLI on the server.</p>
          <p className="mt-1">Your Move code will be compiled and deployed using the wallet address you provide below.</p>
          <p className="mt-1">You don't need to sign any transactions in your browser - the server will handle everything!</p>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-full">
              <label className="text-sm mb-1 block">Your Aptos Wallet Address</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter your 0x... wallet address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={isDeploying}
                />
                {(window as any)?.aptos && (
                  <Button 
                    className="whitespace-nowrap" 
                    variant="outline" 
                    onClick={connectWallet}
                    disabled={connecting || isDeploying || walletConnected}
                  >
                    {connecting ? "Connecting..." : walletConnected ? "Connected ✓" : "Get from Petra"}
                  </Button>
                )}
              </div>
              <div className="text-xs mt-1 text-muted-foreground">
                {walletConnected 
                  ? "Address imported from Petra wallet ✓" 
                  : "Enter your Aptos wallet address or connect to Petra to import it"
                }
              </div>
            </div>
          </div>
          
          <Button 
            onClick={() => onDeploy(address)} 
            disabled={!isValidated || isDeploying || !address} 
            className="w-full"
          >
            {isDeploying ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Compiling & Deploying...
              </>
            ) : "Deploy to Aptos"}
          </Button>
          
          {deploymentError && (
            <div className="text-sm p-3 border rounded border-red-200 bg-red-50 text-red-800 whitespace-pre-wrap">
              <strong>Error:</strong> {deploymentError}
              
              {/* Suggestions based on error message */}
              {deploymentError.includes("composition") && (
                <div className="mt-2">
                  <strong>Suggestion:</strong> Try regenerating the code first.
                </div>
              )}
              {deploymentError.includes("wallet") && (
                <div className="mt-2">
                  <strong>Suggestion:</strong> Make sure you've entered a valid wallet address.
                </div>
              )}
            </div>
          )}
          
          {deploymentResult && deploymentResult.success && (
            <div className="text-sm p-3 border rounded border-green-200 bg-green-50 text-green-800">
              <p><strong>Deployment successful!</strong></p>
              <p className="mt-1">
                Transaction hash: {deploymentResult.transactionHash}
              </p>
              <p className="mt-1">
                Deployed from address: {deploymentResult.deploymentAddress}
              </p>
              {deploymentResult.explorerUrl && (
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-green-800 font-medium" 
                  onClick={() => window.open(deploymentResult.explorerUrl, '_blank')}
                >
                  View on Explorer <ExternalLink className="h-3 w-3 inline ml-1" />
                </Button>
              )}
              <p className="mt-3 text-xs">
                Your smart contract has been successfully deployed to the Aptos testnet and can be used immediately.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/compositions" className="text-sm text-muted-foreground hover:text-foreground flex items-center mb-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Compositions
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{composition.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            {getStatusBadge(deploymentStatus)}
            <span className="text-sm text-muted-foreground">
              Updated {formatDate(composition.updatedAt)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/compositions/edit/${composition.id}`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={() => setAlertOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          {deploymentStatus !== CompositionStatus.DEPLOYED && isClient ? (
            <Button size="sm" onClick={handleGenerateCode} disabled={deploying}>
              <Code className="h-4 w-4 mr-2" />
              Generate Code
            </Button>
          ) : deploymentStatus === CompositionStatus.DEPLOYED ? (
            <Button size="sm" variant="secondary">
              <Download className="h-4 w-4 mr-2" />
              Export ABI
            </Button>
          ) : null}
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="code">Generated Code</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div>
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <p className="text-muted-foreground">{composition.description}</p>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-3">Primitives Used</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(composition.primitiveIds || []).map(primitiveId => {
                const primitive = primitives[primitiveId];
                if (!primitive) return null;
                
                return (
                  <Card key={primitiveId}>
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{primitive.name}</h3>
                            <div className="rounded-full inline-block bg-primary/10 px-2 py-0.5 text-xs font-medium capitalize">
                              {primitive.category}
                            </div>
                          </div>
                          <Link 
                            href={`/primitives/${primitiveId}`} 
                            className="text-xs text-primary hover:underline"
                          >
                            View
                          </Link>
                        </div>
                        <p className="text-xs text-muted-foreground">{primitive.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="connections" className="space-y-6 mt-6">
          <h2 className="text-xl font-semibold mb-3">Connections</h2>
          {(composition.connections || []).length > 0 ? (
            <div className="space-y-4">
              {(composition.connections || []).map((connection, index) => {
                const sourcePrimitive = primitives[connection.sourceId];
                const targetPrimitive = primitives[connection.targetId];
                
                if (!sourcePrimitive || !targetPrimitive) return null;
                
                return (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Link2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Connection {index + 1}</span>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                        <div className="flex-1 p-3 border rounded-md">
                          <div className="font-mono text-sm">{sourcePrimitive.name}.{connection.sourceFunction}</div>
                        </div>
                        <ArrowRight className="h-4 w-4 self-center" />
                        <div className="flex-1 p-3 border rounded-md">
                          <div className="font-mono text-sm">{targetPrimitive.name}.{connection.targetFunction}</div>
                        </div>
                      </div>
                      
                      {connection.description && (
                        <p className="text-sm text-muted-foreground mb-3">{connection.description}</p>
                      )}
                      
                      {connection.parameterMappings && connection.parameterMappings.length > 0 && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium mb-2">Parameter Mappings:</h4>
                          <div className="bg-muted/50 p-3 rounded-md">
                            {connection.parameterMappings.map((mapping, mappingIndex) => (
                              <div key={mappingIndex} className="flex items-center gap-1 text-sm">
                                <span className="font-mono">{targetPrimitive.name}.{connection.targetFunction}.{mapping.targetParam}</span>
                                <span>←</span>
                                {mapping.sourceParam ? (
                                  <span className="font-mono">{sourcePrimitive.name}.{connection.sourceFunction}.{mapping.sourceParam}</span>
                                ) : (
                                  <span className="italic">{mapping.constantValue || 'constant'}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center p-6 text-muted-foreground border rounded-md">
              No connections defined for this composition.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="code" className="space-y-6 mt-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">Generated Move Code</h2>
            {!generatedCode && isClient && (
              <Button onClick={handleGenerateCode}>
                <Code className="h-4 w-4 mr-2" />
                Generate Code
              </Button>
            )}
          </div>
          
          {generatedCode ? (
            <CodeViewer generatedCode={generatedCode} onDownload={() => console.log('Code downloaded')} />
          ) : (
            <div className="bg-muted p-4 rounded-md overflow-x-auto">
              <div className="text-center py-8">
                <Code className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Code Generated Yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  Click the "Generate Code" button to create Move code for your composition based on the defined connections.
                </p>
                {isClient && (
                <Button onClick={handleGenerateCode}>
                  <Code className="h-4 w-4 mr-2" />
                  Generate Code
                </Button>
                )}
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="deployment" className="space-y-6 mt-6">
          <h2 className="text-xl font-semibold mb-3">Deploy Your Composition</h2>
          
          {!isValidated ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-md p-4 mb-4">
              <h3 className="font-medium text-yellow-800 dark:text-yellow-300">Validation Required</h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                You need to generate and validate your code before deploying. Go to the "Generated Code" tab
                and click "Generate Code" to proceed.
              </p>
            </div>
          ) : !isClient ? (
            // Show a loading state while waiting for client-side hydration
            <div className="flex items-center justify-center p-8 bg-gray-50 rounded-md">
              <div className="animate-pulse text-gray-500">Loading deployment interface...</div>
            </div>
          ) : (
            <SimpleDeploymentPanel 
              onDeploy={startDeployment}
              deploymentError={deploymentError}
              deploymentResult={deploymentResult}
              isDeploying={deploying}
              isValidated={isValidated}
            />
          )}
        </TabsContent>
      </Tabs>
      
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the composition "{composition.name}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 