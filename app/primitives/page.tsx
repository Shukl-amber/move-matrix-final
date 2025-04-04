import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockPrimitives } from '@/lib/types/primitives';

export const metadata: Metadata = {
  title: 'Primitives - MoveMatrix',
  description: 'Manage and configure DeFi primitives in MoveMatrix',
};

export default function PrimitivesPage() {
  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Primitives</h1>
            <p className="text-muted-foreground">
              DeFi building blocks that can be composed into complex financial products.
            </p>
          </div>
          <Link href="/primitives/new" passHref>
            <Button className="w-full md:w-auto gap-2">
              <Plus className="h-4 w-4" />
              New Primitive
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockPrimitives.map((primitive) => (
            <Card key={primitive.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{primitive.name}</CardTitle>
                  <div className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium capitalize">
                    {primitive.category}
                  </div>
                </div>
                <CardDescription>{primitive.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="text-sm font-medium mb-1">Functions</div>
                  <div className="space-y-1">
                    {primitive.functions.slice(0, 3).map((func) => (
                      <div key={func.name} className="text-xs text-muted-foreground">
                        {func.name}({func.parameters.join(', ')})
                      </div>
                    ))}
                    {primitive.functions.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{primitive.functions.length - 3} more...
                      </div>
                    )}
                  </div>
                </div>
                <Link href={`/primitives/${primitive.id}`} passHref>
                  <Button variant="outline" className="w-full justify-between">
                    View Details <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
} 