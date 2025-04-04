'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Code, FileCode, TrendingUp, Layers, AlertCircle, Info, Check } from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Architecture diagram component for Leveraged Yield Farming
function ArchitectureDiagram() {
  return (
    <div className="relative p-8 border rounded-lg bg-muted/20">
      <div className="grid grid-cols-3 gap-8">
        {/* User */}
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 rounded-full bg-background flex items-center justify-center border">
            <div className="text-2xl">👤</div>
          </div>
          <div className="mt-2 text-center font-medium">User</div>
          <div className="text-xs text-center text-muted-foreground mt-1">Provides initial collateral</div>
        </div>
        
        {/* Empty space */}
        <div className="flex items-center justify-center relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-muted" />
          <div className="absolute flex items-center justify-center bg-muted/50 rounded-full p-1">
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        
        {/* Lending Primitive */}
        <div className="flex flex-col items-center">
          <div className="h-16 w-32 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
            <div className="text-sm font-medium">Lending Primitive</div>
          </div>
          <div className="mt-2 text-center text-xs text-muted-foreground">Borrow against collateral</div>
        </div>
      </div>
      
      {/* Second row - arrows */}
      <div className="h-12 grid grid-cols-3 gap-8">
        <div className="flex justify-center">
          <div className="w-0.5 h-full bg-muted" />
        </div>
        <div className="col-span-2 flex items-end">
          <div className="w-full border-l-2 border-b-2 border-r-2 border-dashed border-muted h-3/4 rounded-b-lg" />
        </div>
      </div>
      
      {/* Third row - components */}
      <div className="grid grid-cols-3 gap-8">
        <div className="flex flex-col items-center">
          <div className="h-16 w-32 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
            <div className="text-sm font-medium">Swap Primitive</div>
          </div>
          <div className="mt-2 text-center text-xs text-muted-foreground">Exchange borrowed assets</div>
        </div>
        
        {/* Arrow */}
        <div className="flex items-center justify-center relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-muted" />
          <div className="absolute flex items-center justify-center bg-muted/50 rounded-full p-1">
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        
        {/* Yield Farm */}
        <div className="flex flex-col items-center">
          <div className="h-16 w-32 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/20">
            <div className="text-sm font-medium">Yield Farm</div>
          </div>
          <div className="mt-2 text-center text-xs text-muted-foreground">Generate yield with leverage</div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-8 flex flex-col gap-2">
        <div className="text-sm font-medium">Flow Overview:</div>
        <div className="text-xs flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary/10 border border-primary/20" />
          <span>MoveMatrix Primitives</span>
        </div>
        <div className="text-xs flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500/10 border border-green-500/20" />
          <span>External Yield Source</span>
        </div>
      </div>
    </div>
  );
}

export default function LeveragedYieldFarmingPage() {
  const [deploymentStep, setDeploymentStep] = useState(1);
  
  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Leveraged Yield Farming</h1>
              <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium">
                Advanced
              </div>
            </div>
            <p className="text-muted-foreground mt-1">
              A product that allows users to leverage their position to earn higher yields in DeFi protocols.
            </p>
          </div>
          <Link href="/examples" passHref>
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Examples
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
            <TabsTrigger value="deploy">Deploy</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Leveraged Yield Farming Overview</CardTitle>
                <CardDescription>
                  This product utilizes the lending and swap primitives to create a leveraged yield farming position.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                  <TrendingUp className="h-10 w-10 text-primary/70 mt-1" />
                  <div>
                    <h3 className="text-lg font-medium">How It Works</h3>
                    <p className="text-muted-foreground mt-1">
                      Leveraged Yield Farming allows users to amplify their yield farming returns by borrowing additional assets against their collateral. The borrowed assets are then deployed into yield-generating protocols, potentially earning more than the cost of borrowing.
                    </p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Benefits</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>Higher potential returns compared to standard yield farming</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>Automatic position management and health monitoring</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>Built-in safety mechanisms to prevent liquidation</span>
                      </li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Risks</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                        <span>Higher risk of liquidation if market prices drop significantly</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                        <span>Interest costs may exceed farming yields in some scenarios</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                        <span>Smart contract risks inherent in DeFi products</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="rounded-md bg-muted/50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-primary" />
                    <div className="font-medium">Primitives Used</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Lending Primitive</span>
                      <Link href="/primitives/lending-primitive-1" passHref>
                        <Button variant="link" size="sm" className="h-auto p-0">View Details</Button>
                      </Link>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Swap Primitive</span>
                      <Link href="/primitives/swap-primitive-1" passHref>
                        <Button variant="link" size="sm" className="h-auto p-0">View Details</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="architecture" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Architecture</CardTitle>
                <CardDescription>
                  Visual representation of how the Leveraged Yield Farming product works.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ArchitectureDiagram />
                
                <div className="mt-8 space-y-4">
                  <h3 className="font-medium">Process Flow</h3>
                  <ol className="space-y-4">
                    <li className="flex items-start gap-3 border-b pb-4">
                      <div className="flex-none w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">1</div>
                      <div>
                        <h4 className="font-medium">Deposit Collateral</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          User deposits collateral into the lending primitive. The collateral is used as security for borrowing.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 border-b pb-4">
                      <div className="flex-none w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">2</div>
                      <div>
                        <h4 className="font-medium">Borrow Assets</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          The lending primitive allows borrowing up to a certain percentage of the collateral's value. This creates leverage.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 border-b pb-4">
                      <div className="flex-none w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">3</div>
                      <div>
                        <h4 className="font-medium">Swap to Target Assets</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          The borrowed assets are swapped for the desired yield farming tokens using the swap primitive.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-none w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">4</div>
                      <div>
                        <h4 className="font-medium">Deposit in Yield Farm</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          The swapped tokens are deposited into a yield farm to earn returns. The returns are periodically harvested and can be used to repay the loan or reinvested.
                        </p>
                      </div>
                    </li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="code" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Implementation Code</CardTitle>
                <CardDescription>
                  Example code for implementing the Leveraged Yield Farming product.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md bg-muted p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FileCode className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm font-medium">leveraged_yield_farming.move</div>
                    </div>
                  </div>
                  <div className="bg-background p-4 rounded-md font-mono text-xs overflow-x-auto">
                    <pre>
{`module defi_matrix::leveraged_yield_farming {
    use std::signer;
    use aptos_framework::coin;
    use defi_matrix::lending_primitive;
    use defi_matrix::swap_primitive;
    
    /// Leverage position for a user
    struct LeveragePosition<phantom CollateralCoin, phantom BorrowCoin, phantom TargetCoin> has key {
        /// Collateral amount
        collateral_amount: u64,
        /// Borrowed amount
        borrowed_amount: u64,
        /// Target coin amount (used in yield farming)
        target_amount: u64,
        /// Health factor (collateral value / borrowed value)
        health_factor: u64,
    }
    
    /// Set up a leveraged position
    public fun setup_leverage<CollateralCoin, BorrowCoin, TargetCoin>(
        user: &signer,
        collateral_amount: u64,
        target_leverage: u64,
    ) {
        // Step 1: Deposit collateral into lending pool
        lending_primitive::deposit<CollateralCoin>(user, collateral_amount);
        
        // Step 2: Calculate borrow amount based on leverage
        let borrow_amount = calculate_borrow_amount(collateral_amount, target_leverage);
        
        // Step 3: Borrow assets
        lending_primitive::borrow<BorrowCoin>(user, borrow_amount);
        
        // Step 4: Swap borrowed assets to target assets for yield farming
        let min_amount_out = calculate_min_amount_out(borrow_amount);
        swap_primitive::swap_x_for_y<BorrowCoin, TargetCoin>(
            user,
            borrow_amount,
            min_amount_out
        );
        
        // Store position info
        let user_addr = signer::address_of(user);
        let position = LeveragePosition<CollateralCoin, BorrowCoin, TargetCoin> {
            collateral_amount,
            borrowed_amount: borrow_amount,
            target_amount: min_amount_out,
            health_factor: 200, // Example: 200 = 2.00x
        };
        
        move_to(user, position);
    }
    
    /// Calculate how much to borrow based on collateral and desired leverage
    fun calculate_borrow_amount(collateral_amount: u64, target_leverage: u64): u64 {
        // Simple calculation: collateral * (leverage - 1) / leverage
        // For example, with $100 collateral and 2x leverage, borrow $50
        (collateral_amount * (target_leverage - 100)) / 100
    }
    
    /// Calculate minimum amount out from swap to prevent excessive slippage
    fun calculate_min_amount_out(amount_in: u64): u64 {
        // Example: Allow 1% slippage
        (amount_in * 99) / 100
    }
    
    /// Monitor and adjust position if needed to prevent liquidation
    public fun monitor_position<CollateralCoin, BorrowCoin, TargetCoin>(
        user: &signer
    ) {
        // Implementation would check health factor and adjust position
        // if needed to prevent liquidation
    }
    
    /// Close the leveraged position
    public fun close_position<CollateralCoin, BorrowCoin, TargetCoin>(
        user: &signer
    ) {
        // Implementation would:
        // 1. Swap yield farm assets back to borrowed currency
        // 2. Repay the borrowed amount
        // 3. Withdraw collateral
        // 4. Delete the position struct
    }
}`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="deploy" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Deploy Your Own</CardTitle>
                <CardDescription>
                  Set up and deploy your own Leveraged Yield Farming product.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {deploymentStep === 1 && (
                  <div className="space-y-6">
                    <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-md">
                      <div className="flex-none">
                        <Info className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm">
                          Before setting up your leveraged yield farming position, you need to configure some parameters. This affects your risk level and potential returns.
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="collateral">Collateral Amount</Label>
                        <div className="flex gap-2">
                          <Input id="collateral" placeholder="100" type="number" className="flex-1" />
                          <div className="w-24">
                            <select className="w-full h-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                              <option>APT</option>
                              <option>USDC</option>
                              <option>BTC</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="leverage">Target Leverage</Label>
                        <div className="flex gap-2 items-center">
                          <Input id="leverage" placeholder="2.0" type="number" min="1" max="3" step="0.1" />
                          <span className="text-sm text-muted-foreground">x</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Safe range: 1.0x - 3.0x</div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="farm">Yield Farm</Label>
                        <select id="farm" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                          <option>MoveMatrix Liquidity Pool (8.2% APY)</option>
                          <option>Stable Farm (5.5% APY)</option>
                          <option>High Yield Farm (12.1% APY)</option>
                        </select>
                      </div>
                    </div>
                    
                    <Button onClick={() => setDeploymentStep(2)} className="w-full">
                      Continue
                    </Button>
                  </div>
                )}
                
                {deploymentStep === 2 && (
                  <div className="space-y-6">
                    <div className="p-4 border rounded-md">
                      <h3 className="font-medium mb-2">Position Summary</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Collateral:</span>
                          <span>100 APT</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Leverage:</span>
                          <span>2.0x</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Borrow Amount:</span>
                          <span>50 APT</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total Position Size:</span>
                          <span>150 APT</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Estimated APY:</span>
                          <span className="text-green-500">12.4%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Health Factor:</span>
                          <span className="text-green-500">2.0</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-muted/30 rounded-md space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        <h3 className="font-medium">Risk Warning</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Leveraged positions carry additional risk. If the value of your collateral drops, your position may be liquidated. Make sure you understand the risks before proceeding.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Button className="w-full" onClick={() => setDeploymentStep(3)}>
                        Deploy Position
                      </Button>
                      <Button variant="outline" className="w-full" onClick={() => setDeploymentStep(1)}>
                        Back to Configuration
                      </Button>
                    </div>
                  </div>
                )}
                
                {deploymentStep === 3 && (
                  <div className="flex flex-col items-center py-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                      <Check className="h-8 w-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Position Deployed!</h3>
                    <p className="text-muted-foreground mb-6">
                      Your leveraged yield farming position has been successfully created and is now active.
                    </p>
                    <div className="w-full max-w-sm p-4 bg-muted/30 rounded-md text-left mb-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Transaction Hash:</span>
                          <span className="font-mono">0x71a2...f93e</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Status:</span>
                          <span className="text-green-500">Active</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Link href="/dashboard" passHref>
                        <Button>
                          View on Dashboard
                        </Button>
                      </Link>
                      <Button variant="outline" onClick={() => setDeploymentStep(1)}>
                        Create Another Position
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
} 