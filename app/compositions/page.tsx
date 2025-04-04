import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Plus, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Compositions - MoveMatrix',
  description: 'Create and manage compositions of DeFi primitives in MoveMatrix',
};

// Mock data for compositions
const mockCompositions = [
  {
    id: 'comp-1',
    name: 'Leveraged Yield Farming',
    description: 'A composition that leverages borrowed assets to farm higher yields.',
    primitives: ['lending-primitive-1', 'swap-primitive-1'],
    createdAt: '2023-04-05T00:00:00Z',
  },
  {
    id: 'comp-2',
    name: 'CDP with Protection',
    description: 'A collateralized debt position with liquidation protection mechanism.',
    primitives: ['lending-primitive-1'],
    createdAt: '2023-04-10T00:00:00Z',
  },
];

export default function CompositionsPage() {
  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Compositions</h1>
            <p className="text-muted-foreground">
              Connect multiple primitives to create complex financial products.
            </p>
          </div>
          <Link href="/compositions/new" passHref>
            <Button className="w-full md:w-auto gap-2">
              <Plus className="h-4 w-4" />
              New Composition
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockCompositions.map((composition) => (
            <Card key={composition.id}>
              <CardHeader>
                <CardTitle>{composition.name}</CardTitle>
                <CardDescription>{composition.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="rounded-md bg-muted p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Layers className="h-4 w-4 text-muted-foreground" />
                    <div className="text-sm font-medium">Primitives Used</div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {composition.primitives.map((primitiveId) => (
                      <div key={primitiveId} className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium">
                        {primitiveId.split('-')[0]}
                      </div>
                    ))}
                  </div>
                </div>
                <Link href={`/compositions/${composition.id}`} passHref>
                  <Button variant="outline" className="w-full justify-between">
                    View Composition <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}

          {/* Create New Composition Card */}
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>Create New Composition</CardTitle>
              <CardDescription>
                Build a new DeFi product by connecting multiple primitives together.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/compositions/new" passHref>
                <Button className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  Start Building
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
} 