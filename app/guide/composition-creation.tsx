import React from 'react';
import { 
  ChevronRight, 
  Code, 
  Link as LinkIcon, 
  Check, 
  BarChart2, 
  GitMerge, 
  ArrowRight,
  Rocket,
  AlertTriangle,
  Lock,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function CompositionCreationGuide() {
  return (
    <div className="container mx-auto py-10 max-w-5xl">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Creating a Composition: Leveraged Yield Farming</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Follow this step-by-step guide to create a Leveraged Yield Farming composition using MoveMatrix primitives
        </p>
      </div>

      <div className="space-y-8">
        {/* Step 1: Start a New Composition */}
        <Card className="p-6">
          <div className="flex items-start">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mr-4">
              <span className="font-bold text-blue-700 dark:text-blue-300">1</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2">Start a New Composition</h2>
              <p className="mb-4">Navigate to the dashboard and click on the "Create New Composition" button.</p>
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md mb-4">
                <ul className="list-disc list-inside space-y-2">
                  <li>Enter a name for your composition (e.g., "Leveraged Yield Farming")</li>
                  <li>Add a description explaining the composition's purpose and functionality</li>
                  <li>Select a category, such as "DeFi" or "Yield"</li>
                  <li>Click "Create" to initialize the composition</li>
                </ul>
              </div>
              <div className="flex justify-end">
                <Button className="flex items-center">
                  Dashboard <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Step 2: Add Primitives */}
        <Card className="p-6">
          <div className="flex items-start">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mr-4">
              <span className="font-bold text-blue-700 dark:text-blue-300">2</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2">Add Primitives to Your Composition</h2>
              <p className="mb-4">Select the required primitives from the primitives panel on the right side of the canvas.</p>
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md mb-4">
                <p className="font-semibold mb-2">For Leveraged Yield Farming, you'll need:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Lending Protocol primitive - For leveraging positions through borrowing</li>
                  <li>AMM Swap primitive - For swapping tokens</li>
                  <li>Yield Farm primitive - For depositing tokens and earning yield</li>
                </ul>
                <p className="mt-4">Drag each primitive onto the canvas to add it to your composition.</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Step 3: Create Connections */}
        <Card className="p-6">
          <div className="flex items-start">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mr-4">
              <span className="font-bold text-blue-700 dark:text-blue-300">3</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2">Connect Your Primitives</h2>
              <p className="mb-4">Create connections between primitives to define how they interact with each other.</p>
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md mb-4">
                <p className="font-semibold mb-2">For Leveraged Yield Farming, create these connections:</p>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Connect the Lending Protocol's <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">borrow</code> function to the AMM Swap's input</li>
                  <li>Connect the AMM Swap's <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">swapExactTokensForTokens</code> function to the Yield Farm's input</li>
                  <li>Connect the Yield Farm's <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">deposit</code> function to complete the flow</li>
                </ol>
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-md flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    The system will automatically validate connections between primitives. Invalid connections will be highlighted in red, and you'll receive suggestions on how to fix them.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Step 4: Validate Connections */}
        <Card className="p-6">
          <div className="flex items-start">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mr-4">
              <span className="font-bold text-blue-700 dark:text-blue-300">4</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2">Validate Your Composition</h2>
              <p className="mb-4">Our validation system ensures that your primitive connections are correct and compatible.</p>
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md mb-4 space-y-4">
                <div className="flex items-start">
                  <Lock className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Type Checking</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      The system validates that the output type of one primitive's function matches the expected input type of the connected function.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Protocol Compatibility</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Validates that the protocols can work together (e.g., Lending Protocol supports the token used by the AMM Swap).
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Security Validation</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Checks for potential security issues in the composition flow.
                    </p>
                  </div>
                </div>
                
                <div className="p-3 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/30 rounded-md">
                  <p className="text-sm text-green-700 dark:text-green-300 flex items-center">
                    <Check className="h-4 w-4 mr-2" />
                    Click "Validate Composition" to run automated checks on your connections.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Step 5: Generate Code */}
        <Card className="p-6">
          <div className="flex items-start">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mr-4">
              <span className="font-bold text-blue-700 dark:text-blue-300">5</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2">Generate and View Code</h2>
              <p className="mb-4">Once your composition is validated, you can generate and review the Move code.</p>
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md mb-4">
                <div className="flex items-start mb-4">
                  <Code className="h-5 w-5 text-indigo-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Code Generation</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Click "Generate Code" to create the Move code that implements your composition.
                    </p>
                  </div>
                </div>
                
                <div className="bg-black text-white p-4 rounded-md text-sm font-mono mb-4 overflow-x-auto">
                  <pre>{`module leveraged_yield_farming {
    use lending_protocol::deposit;
    use amm_swap::swapExactTokensForTokens;
    use yield_farm::deposit;
    
    // Generated function that combines the primitives
    public entry fun execute_strategy(
        lending_amount: u64,
        min_swap_out: u64,
        account: address
    ) {
        // Step 1: Borrow from lending protocol
        let borrowed_funds = lending_protocol::borrow(lending_amount, account);
        
        // Step 2: Swap tokens using AMM
        let yield_tokens = amm_swap::swapExactTokensForTokens(
            borrowed_funds, 
            min_swap_out, 
            account
        );
        
        // Step 3: Deposit into yield farm
        yield_farm::deposit(yield_tokens, account);
    }
}`}</pre>
                </div>
                
                <div className="flex items-center justify-between">
                  <Button variant="outline" className="flex items-center">
                    <Code className="mr-2 h-4 w-4" /> View Full Code
                  </Button>
                  <Button variant="outline" className="flex items-center">
                    <ArrowRight className="mr-2 h-4 w-4" /> Download Code
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Step 6: Deploy */}
        <Card className="p-6">
          <div className="flex items-start">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mr-4">
              <span className="font-bold text-blue-700 dark:text-blue-300">6</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2">Deploy Your Composition</h2>
              <p className="mb-4">Deploy your composition to the blockchain to make it available for users.</p>
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md mb-4 space-y-4">
                <div className="flex items-start">
                  <Rocket className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Deployment Options</p>
                    <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1 mt-1">
                      <li>Deploy to testnet for testing</li>
                      <li>Deploy to mainnet for production use</li>
                      <li>Connect your wallet to sign the deployment transaction</li>
                    </ul>
                  </div>
                </div>
                
                <div className="border border-dashed border-gray-300 dark:border-gray-600 p-4 rounded-md">
                  <h3 className="font-semibold mb-2">Deployment Configuration</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Network</p>
                      <p>Testnet</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Gas Budget</p>
                      <p>1000 APTOS</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Publishing Account</p>
                      <p>Your connected wallet</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Estimated Fees</p>
                      <p>~0.01 APTOS</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button className="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <Rocket className="mr-2 h-4 w-4" /> Deploy Composition
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Step 7: Monitor */}
        <Card className="p-6">
          <div className="flex items-start">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mr-4">
              <span className="font-bold text-blue-700 dark:text-blue-300">7</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2">Monitor Your Deployed Composition</h2>
              <p className="mb-4">After deployment, you can monitor your composition's performance and usage.</p>
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md mb-4">
                <div className="flex items-start mb-4">
                  <BarChart2 className="h-5 w-5 text-teal-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Analytics Dashboard</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      View real-time analytics for your composition including:
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                      <li>Usage statistics</li>
                      <li>Performance metrics</li>
                      <li>Gas consumption</li>
                      <li>User interactions</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <Button variant="outline" className="flex items-center">
                  <GitMerge className="mr-2 h-4 w-4" /> View All My Compositions
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="mb-6">
          Create your first composition now using our intuitive interface and deployed primitives. Our
          validation system will guide you through the process and help you avoid errors.
        </p>
        <div className="flex space-x-4">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Create New Composition
          </Button>
          <Button variant="outline">
            Browse Example Compositions
          </Button>
        </div>
      </div>
    </div>
  );
} 