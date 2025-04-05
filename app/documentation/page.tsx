"use client";

import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const Documentation = () => {
  return (
    <MainLayout>
      <div className="text-foreground">
        {/* Header Section */}
        <div className="mb-16">
          <h1 className="text-4xl font-bold mb-6 text-center bg-clip-text text-black bg-gradient-to-r from-white to-gray-900">
            Move Matrix
          </h1>
          <p className="text-muted-foreground text-center text-xl mb-8">
            Build DeFi Applications Visually
          </p>
          <p className="text-muted-foreground text-center text-lg max-w-3xl mx-auto">
            MoveMatrix helps you create decentralized finance applications on the Aptos blockchain - no coding required! Simply drag, drop, and connect building blocks to bring your DeFi ideas to life.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid gap-8">
          {/* Getting Started Section */}
          <section className="border rounded-lg p-6 bg-card text-card-foreground shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-primary">Getting Started</h2>
            <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
              <li>Visit our platform</li>
              <li>Click &quot;Try it now&quot; to open the builder</li>
              <li>Start creating your first DeFi protocol</li>
            </ol>
          </section>

          {/* Understanding DeFi Section */}
          <section className="border rounded-lg p-6 bg-card text-card-foreground shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-primary">Understanding DeFi Basics</h2>
            <p className="text-muted-foreground mb-6">
              DeFi (Decentralized Finance) brings traditional financial services to blockchain technology, making them accessible to everyone.
            </p>
            
            <h3 className="text-xl font-semibold mb-4 text-primary">Building Blocks</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="border rounded-lg p-4 bg-background/50">
                <h4 className="font-bold mb-2 text-foreground">Lending</h4>
                <p className="text-muted-foreground">Create automated lending markets with customizable interest rates</p>
              </div>
              <div className="border rounded-lg p-4 bg-background/50">
                <h4 className="font-bold mb-2 text-foreground">Trading</h4>
                <p className="text-muted-foreground">Set up token exchange pools with automated pricing</p>
              </div>
              <div className="border rounded-lg p-4 bg-background/50">
                <h4 className="font-bold mb-2 text-foreground">Staking</h4>
                <p className="text-muted-foreground">Build reward systems for token holders</p>
              </div>
              <div className="border rounded-lg p-4 bg-background/50">
                <h4 className="font-bold mb-2 text-foreground">Yield</h4>
                <p className="text-muted-foreground">Design strategies to maximize returns across protocols</p>
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-4 text-primary">Key Terms to Know</h3>
            <div className="space-y-3">
              <div className="border rounded-lg p-4 bg-background/50">
                <span className="font-bold text-foreground">Liquidity:</span>
                <span className="text-muted-foreground"> Assets available in a pool for trading or lending</span>
              </div>
              <div className="border rounded-lg p-4 bg-background/50">
                <span className="font-bold text-foreground">APY:</span>
                <span className="text-muted-foreground"> Annual Percentage Yield - your potential yearly earnings</span>
              </div>
              <div className="border rounded-lg p-4 bg-background/50">
                <span className="font-bold text-foreground">Collateral:</span>
                <span className="text-muted-foreground"> Assets you provide as security when borrowing</span>
              </div>
              <div className="border rounded-lg p-4 bg-background/50">
                <span className="font-bold text-foreground">TVL:</span>
                <span className="text-muted-foreground"> Total Value Locked - total assets in your protocol</span>
              </div>
            </div>
          </section>

          {/* Why Use MoveMatrix Section */}
          <section className="border rounded-lg p-6 bg-card text-card-foreground shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-primary">Why Use MoveMatrix?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Build Safely</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Pre-audited building blocks</li>
                  <li>Real-time error detection</li>
                  <li>Built-in security checks</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Move Fast</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>No coding needed</li>
                  <li>Ready-to-use components</li>
                  <li>Instant testing</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">See Clearly</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Visual connections</li>
                  <li>Real-time token flows</li>
                  <li>Easy-to-understand risk metrics</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Safety Features Section */}
          <section className="border rounded-lg p-6 bg-card text-card-foreground shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-primary">Safety Features</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 bg-background/50 flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-muted-foreground">Pre-audited components</span>
              </div>
              <div className="border rounded-lg p-4 bg-background/50 flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-muted-foreground">Real-time security checks</span>
              </div>
              <div className="border rounded-lg p-4 bg-background/50 flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-muted-foreground">Risk assessment tools</span>
              </div>
              <div className="border rounded-lg p-4 bg-background/50 flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-muted-foreground">Testnet deployment option</span>
              </div>
            </div>
          </section>

          {/* Remember Section */}
          <section className="border rounded-lg p-6 bg-card text-card-foreground shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-primary">Remember</h2>
            <ul className="list-disc list-inside space-y-3 text-muted-foreground">
              <li>Always test on testnet first</li>
              <li>Review all settings carefully</li>
              <li>Monitor your protocol after launch</li>
              <li>Join our community for support</li>
            </ul>
          </section>
        </div>

        {/* Examples Button Section */}
        <div className="mt-12 flex justify-center">
          <Link href="/documentation/examples">
            <Button className="bg-black hover:bg-black/80 text-white border border-white/20 px-8 py-6 text-lg rounded-xl font-semibold transition-all duration-300 hover:scale-105">
              View Examples
            </Button>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default Documentation;
