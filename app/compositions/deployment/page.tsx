import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { ArrowRight, Check, Cpu, Globe, Info, SendHorizonal, ServerCrash, Wrench, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const metadata: Metadata = {
  title: 'Deployment Guide - MoveMatrix',
  description: 'Understanding how to deploy compositions to the Aptos blockchain',
};

export default function DeploymentGuidePage() {
  return (
    <MainLayout>
      <div className="flex flex-col gap-8 max-w-5xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deploying Compositions</h1>
          <p className="text-muted-foreground">
            Learn how to deploy your compositions to the Aptos blockchain
          </p>
        </div>

        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border rounded-lg p-8 text-center">
          <Globe className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Deployment Made Easy</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            MoveMatrix handles the complex process of converting your composition into blockchain-ready code,
            compiling it, and deploying it to the Aptos network with a single click.
          </p>
          <Button asChild>
            <Link href="/compositions">
              View My Compositions
            </Link>
          </Button>
        </div>

        {/* Deployment Process */}
        <section className="space-y-4 mt-8">
          <h2 className="text-2xl font-bold mb-6">Deployment Process</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border rounded-lg p-6 relative">
              <div className="absolute top-0 left-0 transform -translate-y-1/2 bg-background px-4 py-1 border rounded-full text-xs font-semibold text-primary">
                Step 1
              </div>
              <h3 className="font-semibold text-lg mt-4 mb-2">Code Generation</h3>
              <p className="text-muted-foreground text-sm">
                The system translates your visual composition into Move language code.
                This includes:
              </p>
              <ul className="mt-2 space-y-2">
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-primary mr-2 mt-1" />
                  <span className="text-sm">Importing relevant primitive modules</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-primary mr-2 mt-1" />
                  <span className="text-sm">Creating functions for each connection</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-primary mr-2 mt-1" />
                  <span className="text-sm">Building parameter mappings</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-primary mr-2 mt-1" />
                  <span className="text-sm">Implementing composition execution logic</span>
                </li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-6 relative">
              <div className="absolute top-0 left-0 transform -translate-y-1/2 bg-background px-4 py-1 border rounded-full text-xs font-semibold text-primary">
                Step 2
              </div>
              <h3 className="font-semibold text-lg mt-4 mb-2">Compilation</h3>
              <p className="text-muted-foreground text-sm">
                The generated Move code is compiled to bytecode using the Aptos framework.
                This includes:
              </p>
              <ul className="mt-2 space-y-2">
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-primary mr-2 mt-1" />
                  <span className="text-sm">Syntax validation</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-primary mr-2 mt-1" />
                  <span className="text-sm">Type checking</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-primary mr-2 mt-1" />
                  <span className="text-sm">Dependency verification</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-primary mr-2 mt-1" />
                  <span className="text-sm">Optimization for on-chain execution</span>
                </li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-6 relative">
              <div className="absolute top-0 left-0 transform -translate-y-1/2 bg-background px-4 py-1 border rounded-full text-xs font-semibold text-primary">
                Step 3
              </div>
              <h3 className="font-semibold text-lg mt-4 mb-2">Wallet Connection</h3>
              <p className="text-muted-foreground text-sm">
                Connect your wallet to authorize the deployment transaction.
                This includes:
              </p>
              <ul className="mt-2 space-y-2">
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-primary mr-2 mt-1" />
                  <span className="text-sm">Connecting to Petra or other compatible wallets</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-primary mr-2 mt-1" />
                  <span className="text-sm">Verifying account access</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-primary mr-2 mt-1" />
                  <span className="text-sm">Preparing transaction payload</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-primary mr-2 mt-1" />
                  <span className="text-sm">Estimating gas fees</span>
                </li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-6 relative">
              <div className="absolute top-0 left-0 transform -translate-y-1/2 bg-background px-4 py-1 border rounded-full text-xs font-semibold text-primary">
                Step 4
              </div>
              <h3 className="font-semibold text-lg mt-4 mb-2">Blockchain Deployment</h3>
              <p className="text-muted-foreground text-sm">
                The compiled bytecode is deployed to the Aptos blockchain.
                This includes:
              </p>
              <ul className="mt-2 space-y-2">
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-primary mr-2 mt-1" />
                  <span className="text-sm">Transaction signing</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-primary mr-2 mt-1" />
                  <span className="text-sm">Submitting to the Aptos network</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-primary mr-2 mt-1" />
                  <span className="text-sm">Confirmation monitoring</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-primary mr-2 mt-1" />
                  <span className="text-sm">Storage of deployment details</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
        
        {/* Post-Deployment */}
        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-6">After Deployment</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded-lg p-6 flex flex-col items-center text-center">
              <Cpu className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Module Access</h3>
              <p className="text-sm text-muted-foreground">
                Your composition is now available as a Move module on-chain, accessible via its module address and name.
              </p>
            </div>
            
            <div className="border rounded-lg p-6 flex flex-col items-center text-center">
              <Wrench className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Integration</h3>
              <p className="text-sm text-muted-foreground">
                Other applications can now integrate with your composition through its public interface.
              </p>
            </div>
            
            <div className="border rounded-lg p-6 flex flex-col items-center text-center">
              <SendHorizonal className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Transactions</h3>
              <p className="text-sm text-muted-foreground">
                Users can interact with your composition by sending transactions to its functions.
              </p>
            </div>
          </div>
        </section>

        {/* System Requirements */}
        <section className="border rounded-lg p-6 mt-8">
          <h2 className="text-xl font-bold mb-4">System Requirements</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-3">Minimum Requirements</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <div>
                    <span className="font-medium">Aptos Wallet</span>
                    <p className="text-sm text-muted-foreground">Petra or other compatible wallet</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <div>
                    <span className="font-medium">APT Balance</span>
                    <p className="text-sm text-muted-foreground">Minimum 0.1 APT for transaction fees</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <div>
                    <span className="font-medium">Browser</span>
                    <p className="text-sm text-muted-foreground">Chrome, Firefox, or Edge</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-3">Restrictions</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <XCircle className="h-5 w-5 text-destructive mr-2" />
                  <div>
                    <span className="font-medium">Module Size</span>
                    <p className="text-sm text-muted-foreground">Modules exceeding 64KB in size cannot be deployed</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <XCircle className="h-5 w-5 text-destructive mr-2" />
                  <div>
                    <span className="font-medium">Primitive Compatibility</span>
                    <p className="text-sm text-muted-foreground">All primitives must be deployed on the same network</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <XCircle className="h-5 w-5 text-destructive mr-2" />
                  <div>
                    <span className="font-medium">Function Limit</span>
                    <p className="text-sm text-muted-foreground">Maximum of 1000 functions per module</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section className="mt-8">
          <div className="flex items-center mb-6">
            <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
            <Info className="h-5 w-5 text-muted-foreground ml-2" />
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How much does it cost to deploy a composition?</AccordionTrigger>
              <AccordionContent>
                Deploying a composition requires paying network fees (gas) on the Aptos blockchain. 
                The exact cost depends on the size and complexity of your composition, but typically
                ranges from 0.01 to 0.1 APT. MoveMatrix does not charge any additional fees for deployment.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger>Can I update my composition after deployment?</AccordionTrigger>
              <AccordionContent>
                Once deployed, Move modules on Aptos are immutable and cannot be directly updated.
                However, you can implement upgrade patterns such as using proxy modules or governance
                mechanisms. For simple updates, we recommend deploying a new version of your composition
                and migrating users to the new version.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger>What happens if the deployment fails?</AccordionTrigger>
              <AccordionContent>
                If deployment fails, your funds for the transaction will be returned (minus a small
                fee for processing the failed transaction). MoveMatrix will provide detailed error
                information to help you diagnose and fix the issue. Common problems include insufficient
                funds, compilation errors, or network congestion.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger>Which networks are supported for deployment?</AccordionTrigger>
              <AccordionContent>
                MoveMatrix currently supports deployment to the Aptos Testnet and Mainnet.
                During development, we recommend using Testnet for initial testing and validation
                before deploying to Mainnet. Switching networks can be done through your connected
                wallet interface.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5">
              <AccordionTrigger>How do I share my deployed composition with others?</AccordionTrigger>
              <AccordionContent>
                After successful deployment, you'll receive a unique module address and name.
                You can share this information with others to allow them to interact with your
                composition. MoveMatrix also provides a shareable link to your composition page,
                which includes all the necessary details and documentation.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
        
        {/* Troubleshooting */}
        <section className="border rounded-lg p-6 bg-destructive/5 mt-8">
          <div className="flex items-center mb-4">
            <ServerCrash className="h-6 w-6 text-destructive mr-2" />
            <h2 className="text-xl font-bold">Troubleshooting Common Issues</h2>
          </div>
          
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="font-semibold mb-1">Wallet Connection Failed</h3>
              <p className="text-sm text-muted-foreground">
                Make sure your wallet extension is installed and unlocked. Try refreshing the page
                or reconnecting your wallet. Check that you're using a compatible wallet like Petra.
              </p>
            </div>
            
            <div className="border-b pb-4">
              <h3 className="font-semibold mb-1">Insufficient Funds</h3>
              <p className="text-sm text-muted-foreground">
                Ensure you have enough APT in your wallet to cover the deployment costs.
                If you're on Testnet, you can use the faucet to get free test tokens.
              </p>
            </div>
            
            <div className="border-b pb-4">
              <h3 className="font-semibold mb-1">Compilation Errors</h3>
              <p className="text-sm text-muted-foreground">
                Check that all primitives used in your composition are valid and available on the target
                network. Review the generated code for any syntax or type errors.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-1">Transaction Timeout</h3>
              <p className="text-sm text-muted-foreground">
                If your transaction takes too long, the network might be congested. Try again later
                or consider increasing the gas price for faster processing.
              </p>
            </div>
          </div>
        </section>
        
        {/* Get Started */}
        <section className="border rounded-lg p-8 text-center mt-8">
          <h2 className="text-2xl font-bold mb-2">Ready to Deploy?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Return to your compositions and start the deployment process with a single click.
          </p>
          <Button asChild>
            <Link href="/compositions">
              My Compositions <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </section>
      </div>
    </MainLayout>
  );
} 