import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  BookOpen, 
  ArrowRight, 
  CircleCheck, 
  Pencil, 
  Layers, 
  Link2, 
  FileCode, 
  Globe 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'User Guide - MoveMatrix',
  description: 'Step-by-step guide to creating compositions in MoveMatrix',
};

export default function UserGuidePage() {
  return (
    <MainLayout>
      <div className="flex flex-col gap-8 max-w-5xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">MoveMatrix User Guide</h1>
          <p className="text-muted-foreground">
            Learn how to build powerful DeFi compositions in minutes
          </p>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border rounded-lg p-8">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <BookOpen className="h-16 w-16 text-primary" />
            <div>
              <h2 className="text-2xl font-bold mb-2">Building Your First Composition</h2>
              <p className="text-muted-foreground mb-4">
                This guide will walk you through the process of creating, connecting, and deploying
                your DeFi composition using MoveMatrix's visual builder.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild variant="outline">
                  <Link href="/primitives">Browse Primitives</Link>
                </Button>
                <Button asChild>
                  <Link href="/compositions/new">Start Building Now</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Step 1 */}
        <div className="relative border rounded-lg p-6 mt-8">
          <div className="absolute -top-4 left-6 bg-background px-2 text-sm font-medium text-primary">
            Step 1
          </div>
          
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Pencil className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Define Your Composition</h3>
              <p className="text-muted-foreground mb-4">
                Start by providing basic information about your composition. This includes:
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center">
                  <CircleCheck className="h-4 w-4 text-primary mr-2" />
                  <span>A descriptive name for your composition</span>
                </li>
                <li className="flex items-center">
                  <CircleCheck className="h-4 w-4 text-primary mr-2" />
                  <span>A detailed description explaining what your composition does</span>
                </li>
                <li className="flex items-center">
                  <CircleCheck className="h-4 w-4 text-primary mr-2" />
                  <span>Optional tags to categorize your composition</span>
                </li>
              </ul>
              
              <div className="bg-muted/50 p-4 rounded-md border">
                <p className="text-sm font-medium mb-1">Pro Tip:</p>
                <p className="text-sm text-muted-foreground">
                  Choose a clear, descriptive name that reflects the purpose of your composition.
                  A good description helps others understand what your composition does and how to use it.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="relative border rounded-lg p-6">
          <div className="absolute -top-4 left-6 bg-background px-2 text-sm font-medium text-primary">
            Step 2
          </div>
          
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Layers className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Select Your Primitives</h3>
              <p className="text-muted-foreground mb-4">
                Choose from our library of pre-built DeFi primitives to include in your composition:
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center">
                  <CircleCheck className="h-4 w-4 text-primary mr-2" />
                  <span>Browse available primitives by category (lending, swapping, etc.)</span>
                </li>
                <li className="flex items-center">
                  <CircleCheck className="h-4 w-4 text-primary mr-2" />
                  <span>Select at least two primitives to enable connections</span>
                </li>
                <li className="flex items-center">
                  <CircleCheck className="h-4 w-4 text-primary mr-2" />
                  <span>Review primitive functions and parameters</span>
                </li>
              </ul>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="border rounded p-3">
                  <p className="font-medium mb-1">Common Primitive Types:</p>
                  <ul className="text-sm space-y-1">
                    <li>• Lending/Borrowing</li>
                    <li>• Token Swapping</li>
                    <li>• Yield Farming</li>
                    <li>• Staking</li>
                    <li>• Collateralized Debt</li>
                  </ul>
                </div>
                <div className="border rounded p-3">
                  <p className="font-medium mb-1">Selection Tips:</p>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Choose primitives with compatible functions</li>
                    <li>• Consider transaction flow and data dependencies</li>
                    <li>• Look for primitives with well-documented parameters</li>
                    <li>• Check gas efficiency for complex operations</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-md border">
                <p className="text-sm font-medium mb-1">Pro Tip:</p>
                <p className="text-sm text-muted-foreground">
                  Hover over primitives to see more details about their functions and parameters.
                  Select primitives that can be logically connected based on their inputs and outputs.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="relative border rounded-lg p-6">
          <div className="absolute -top-4 left-6 bg-background px-2 text-sm font-medium text-primary">
            Step 3
          </div>
          
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Link2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Create Connections</h3>
              <p className="text-muted-foreground mb-4">
                Define how your primitives interact with each other by creating connections:
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center">
                  <CircleCheck className="h-4 w-4 text-primary mr-2" />
                  <span>Select a source primitive function (that produces output)</span>
                </li>
                <li className="flex items-center">
                  <CircleCheck className="h-4 w-4 text-primary mr-2" />
                  <span>Select a target primitive function (that accepts input)</span>
                </li>
                <li className="flex items-center">
                  <CircleCheck className="h-4 w-4 text-primary mr-2" />
                  <span>Map parameters between the source and target functions</span>
                </li>
                <li className="flex items-center">
                  <CircleCheck className="h-4 w-4 text-primary mr-2" />
                  <span>Add a description for each connection</span>
                </li>
              </ul>
              
              <div className="border rounded-md p-4 mb-4">
                <h4 className="font-medium mb-2">Example Connection:</h4>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="border rounded p-2 bg-background">
                    <p className="text-sm font-mono">LendingProtocol.borrow()</p>
                    <p className="text-xs text-muted-foreground">outputs: token amount</p>
                  </div>
                  <ArrowRight className="h-5 w-5" />
                  <div className="border rounded p-2 bg-background">
                    <p className="text-sm font-mono">YieldFarm.deposit()</p>
                    <p className="text-xs text-muted-foreground">inputs: token amount</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  This connection takes the tokens borrowed from a lending protocol and deposits them into a yield farm.
                </p>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-md border">
                <p className="text-sm font-medium mb-1">Pro Tip:</p>
                <p className="text-sm text-muted-foreground">
                  For complex compositions, focus on creating a logical flow of operations.
                  Parameter mapping is crucial for ensuring data flows correctly between primitives.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="relative border rounded-lg p-6">
          <div className="absolute -top-4 left-6 bg-background px-2 text-sm font-medium text-primary">
            Step 4
          </div>
          
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <FileCode className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Generate and Review Code</h3>
              <p className="text-muted-foreground mb-4">
                MoveMatrix automatically generates Move code based on your composition:
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center">
                  <CircleCheck className="h-4 w-4 text-primary mr-2" />
                  <span>Review the generated Move module code</span>
                </li>
                <li className="flex items-center">
                  <CircleCheck className="h-4 w-4 text-primary mr-2" />
                  <span>Check for potential issues or optimizations</span>
                </li>
                <li className="flex items-center">
                  <CircleCheck className="h-4 w-4 text-primary mr-2" />
                  <span>Understand how your primitives will interact</span>
                </li>
              </ul>
              
              <div className="border rounded-md p-4 bg-muted/30 mb-4 overflow-x-auto">
                <pre className="text-xs font-mono">
{`module defi_matrix::leveraged_yield_farming {
    use 0x1::lending_protocol;
    use 0x1::yield_farming;
    
    // Data structure for tracking the composition state
    struct CompositionData has key {
        owner: address,
        active: bool,
    }
    
    // Execute the full composition workflow
    public fun execute(user: &signer) {
        // Borrow assets from lending protocol
        let amount = lending_protocol::borrow(user, 100);
        
        // Deposit into yield farming
        yield_farming::deposit(user, amount);
    }
}`}
                </pre>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-md border">
                <p className="text-sm font-medium mb-1">Pro Tip:</p>
                <p className="text-sm text-muted-foreground">
                  Even if you don't know Move programming, understanding the general structure of the code
                  can help you identify potential issues or improvements in your composition.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 5 */}
        <div className="relative border rounded-lg p-6">
          <div className="absolute -top-4 left-6 bg-background px-2 text-sm font-medium text-primary">
            Step 5
          </div>
          
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Deploy Your Composition</h3>
              <p className="text-muted-foreground mb-4">
                When you're ready, deploy your composition to the Aptos blockchain:
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center">
                  <CircleCheck className="h-4 w-4 text-primary mr-2" />
                  <span>Connect your Aptos wallet (Petra or compatible)</span>
                </li>
                <li className="flex items-center">
                  <CircleCheck className="h-4 w-4 text-primary mr-2" />
                  <span>Choose the network (Testnet or Mainnet)</span>
                </li>
                <li className="flex items-center">
                  <CircleCheck className="h-4 w-4 text-primary mr-2" />
                  <span>Confirm the transaction to deploy your module</span>
                </li>
                <li className="flex items-center">
                  <CircleCheck className="h-4 w-4 text-primary mr-2" />
                  <span>Monitor deployment status and get confirmation</span>
                </li>
              </ul>
              
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="border rounded p-3 flex-1">
                  <p className="font-medium mb-1">Testnet Deployment:</p>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Free to deploy (requires testnet tokens)</li>
                    <li>• Perfect for testing and validation</li>
                    <li>• No real value at risk</li>
                    <li>• Faster confirmation times</li>
                  </ul>
                </div>
                <div className="border rounded p-3 flex-1">
                  <p className="font-medium mb-1">Mainnet Deployment:</p>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Requires APT for gas fees</li>
                    <li>• Operates with real assets</li>
                    <li>• Accessible to all users</li>
                    <li>• Permanent on-chain presence</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-md border">
                <p className="text-sm font-medium mb-1">Pro Tip:</p>
                <p className="text-sm text-muted-foreground">
                  Always test your composition on Testnet first to ensure it works as expected.
                  This helps you identify any issues before deploying to Mainnet where real assets are involved.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="border rounded-lg p-8 text-center mt-8">
          <h2 className="text-2xl font-bold mb-2">Ready to Start Building?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Jump into MoveMatrix's visual builder and create your first DeFi composition in minutes.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button variant="outline" asChild>
              <Link href="/compositions">My Compositions</Link>
            </Button>
            <Button asChild>
              <Link href="/compositions/new">Create New Composition</Link>
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 