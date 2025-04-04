import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, TrendingUp, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Examples - MoveMatrix',
  description: 'Explore pre-built example products using MoveMatrix primitives',
};

// Mock data for example products
const exampleProducts = [
  {
    id: 'example-1',
    name: 'Leveraged Yield Farming',
    description: 'A product that allows users to leverage their position to earn higher yields in DeFi protocols.',
    icon: <TrendingUp className="h-10 w-10 text-primary/70" />,
    details: 'This strategy borrows assets against your collateral to amplify yields. It automatically manages risk by monitoring health factors and adjusting positions accordingly.',
    difficulty: 'Advanced',
  },
  {
    id: 'example-2',
    name: 'CDP with Protection',
    description: 'A collateralized debt position that protects against liquidation with automatic rebalancing.',
    icon: <Shield className="h-10 w-10 text-primary/70" />,
    details: 'This product creates a collateralized debt position with built-in protection mechanisms that automatically adjust your position to avoid liquidation during market volatility.',
    difficulty: 'Intermediate',
  },
];

export default function ExamplesPage() {
  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Example Products</h1>
          <p className="text-muted-foreground">
            Ready-to-use DeFi products built with MoveMatrix primitives.
          </p>
        </div>

        <div className="grid gap-6">
          {exampleProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="md:grid md:grid-cols-[1fr_2fr]">
                <div className="flex flex-col items-center justify-center p-6 bg-muted/50">
                  {product.icon}
                  <h3 className="mt-4 text-xl font-bold">{product.name}</h3>
                  <div className="mt-2 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium">
                    {product.difficulty}
                  </div>
                </div>
                <div className="p-6">
                  <CardDescription className="mb-4">{product.description}</CardDescription>
                  <div className="mb-6 text-sm">
                    <p>{product.details}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href={`/examples/${product.id}`} passHref>
                      <Button className="gap-2">
                        View Details <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/examples/${product.id}/setup`} passHref>
                      <Button variant="outline" className="gap-2">
                        Setup Product <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-8">
          <Card className="border-dashed bg-muted/30">
            <CardHeader>
              <CardTitle>Create Your Own Product</CardTitle>
              <CardDescription>
                Not finding what you need? Build a custom product using our primitives.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/primitives" passHref>
                  <Button variant="outline" className="gap-2">
                    Browse Primitives <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/compositions/new" passHref>
                  <Button className="gap-2">
                    Create Composition <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
} 