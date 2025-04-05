import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { FileCode, Hexagon, ArrowDown, Database, Globe, ArrowRight, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Architecture - MoveMatrix',
  description: 'Understanding the MoveMatrix composition architecture and deployment process',
};

export default function ArchitecturePage() {
  return (
    <MainLayout>
      <div className="flex flex-col gap-8 max-w-5xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">MoveMatrix Architecture</h1>
          <p className="text-muted-foreground">
            Understanding how compositions work from creation to deployment
          </p>
        </div>

        {/* Overview Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Overview</h2>
          <p>
            MoveMatrix is designed around the concept of composable DeFi primitives that can be connected
            together to create complex financial products. The system follows a modular architecture where
            individual DeFi components (primitives) can be combined through a visual interface, generating
            deployable Move code.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="flex flex-col items-center text-center p-6 border rounded-lg">
              <Hexagon className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg font-semibold">Primitives</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Standardized DeFi building blocks with well-defined interfaces
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 border rounded-lg">
              <FileCode className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg font-semibold">Compositions</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Custom products created by connecting multiple primitives together
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 border rounded-lg">
              <Globe className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg font-semibold">Deployment</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Generated Move modules deployed to the Aptos blockchain
              </p>
            </div>
          </div>
        </section>

        {/* System Architecture Diagram */}
        <section className="space-y-4 mt-8">
          <h2 className="text-2xl font-bold">System Architecture</h2>
          <div className="border rounded-lg p-8 bg-muted/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="border bg-background rounded-lg p-4 text-center">
                  <h3 className="font-semibold">Frontend</h3>
                  <p className="text-xs text-muted-foreground mt-1">Next.js + React</p>
                </div>
                <ArrowDown className="mx-auto h-6 w-6 text-muted-foreground" />
                <div className="border bg-background rounded-lg p-4 text-center">
                  <h3 className="font-semibold">API Layer</h3>
                  <p className="text-xs text-muted-foreground mt-1">Next.js API Routes</p>
                </div>
              </div>
              
              <div className="space-y-4 md:mt-16">
                <ArrowDown className="mx-auto h-6 w-6 text-muted-foreground" />
                <div className="border bg-primary/10 rounded-lg p-4 text-center">
                  <h3 className="font-semibold">Composition Engine</h3>
                  <p className="text-xs text-muted-foreground mt-1">Move Code Generator</p>
                </div>
                <ArrowDown className="mx-auto h-6 w-6 text-muted-foreground" />
              </div>
              
              <div className="space-y-4">
                <div className="border bg-background rounded-lg p-4 text-center">
                  <h3 className="font-semibold">Database</h3>
                  <p className="text-xs text-muted-foreground mt-1">MongoDB</p>
                </div>
                <ArrowDown className="mx-auto h-6 w-6 text-muted-foreground" />
                <div className="border bg-background rounded-lg p-4 text-center">
                  <h3 className="font-semibold">Blockchain</h3>
                  <p className="text-xs text-muted-foreground mt-1">Aptos Network</p>
                </div>
              </div>
            </div>
            
            {/* Data flow arrows for desktop */}
            <div className="hidden md:block">
              <div className="absolute left-1/2 top-1/3 transform -translate-x-1/2 -translate-y-1/2">
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </div>
        </section>

        {/* Deployment Workflow */}
        <section className="space-y-4 mt-8">
          <h2 className="text-2xl font-bold">Deployment Workflow</h2>
          <p>
            When a composition is ready for deployment, MoveMatrix follows a streamlined process to 
            generate Move code, compile it, and deploy it to the Aptos blockchain.
          </p>
          
          <div className="relative mt-8">
            <div className="absolute left-9 top-0 h-full w-0.5 bg-border"></div>
            
            <div className="relative z-10">
              <div className="flex mb-8">
                <div className="flex items-center justify-center w-20 h-20 rounded-full border bg-background">
                  <FileCode className="h-8 w-8 text-primary" />
                </div>
                <div className="ml-6 pt-3">
                  <h3 className="text-lg font-semibold">Code Generation</h3>
                  <p className="text-muted-foreground mt-1">
                    The composition is translated into Move code based on the primitives and their connections
                  </p>
                </div>
              </div>
              
              <div className="flex mb-8">
                <div className="flex items-center justify-center w-20 h-20 rounded-full border bg-background">
                  <Server className="h-8 w-8 text-primary" />
                </div>
                <div className="ml-6 pt-3">
                  <h3 className="text-lg font-semibold">Compilation</h3>
                  <p className="text-muted-foreground mt-1">
                    Generated Move code is compiled and validated for correctness
                  </p>
                </div>
              </div>
              
              <div className="flex mb-8">
                <div className="flex items-center justify-center w-20 h-20 rounded-full border bg-background">
                  <Database className="h-8 w-8 text-primary" />
                </div>
                <div className="ml-6 pt-3">
                  <h3 className="text-lg font-semibold">Transaction Creation</h3>
                  <p className="text-muted-foreground mt-1">
                    A blockchain transaction is created to deploy the compiled module
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex items-center justify-center w-20 h-20 rounded-full border bg-background">
                  <Globe className="h-8 w-8 text-primary" />
                </div>
                <div className="ml-6 pt-3">
                  <h3 className="text-lg font-semibold">Blockchain Deployment</h3>
                  <p className="text-muted-foreground mt-1">
                    The transaction is signed and submitted to the Aptos blockchain
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Stack */}
        <section className="space-y-4 mt-8">
          <h2 className="text-2xl font-bold">Technical Stack</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-4">Frontend</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-primary mr-2"></div>
                  <span>Next.js 14 with App Router</span>
                </li>
                <li className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-primary mr-2"></div>
                  <span>React for component-based UI</span>
                </li>
                <li className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-primary mr-2"></div>
                  <span>TypeScript for type safety</span>
                </li>
                <li className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-primary mr-2"></div>
                  <span>Tailwind CSS for styling</span>
                </li>
                <li className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-primary mr-2"></div>
                  <span>React Flow for visual composer</span>
                </li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-4">Backend</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-primary mr-2"></div>
                  <span>MongoDB for data persistence</span>
                </li>
                <li className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-primary mr-2"></div>
                  <span>Next.js API routes/Server Actions</span>
                </li>
                <li className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-primary mr-2"></div>
                  <span>Move language for smart contracts</span>
                </li>
                <li className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-primary mr-2"></div>
                  <span>Aptos framework for blockchain</span>
                </li>
                <li className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-primary mr-2"></div>
                  <span>Aptos SDK for blockchain interaction</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Get Started */}
        <section className="border rounded-lg p-8 text-center mt-8">
          <h2 className="text-2xl font-bold mb-2">Ready to Create?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Start building your own DeFi composition by connecting primitives in our visual builder.
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" asChild>
              <Link href="/primitives">
                Browse Primitives
              </Link>
            </Button>
            <Button asChild>
              <Link href="/compositions/new">
                Create Composition
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </MainLayout>
  );
} 