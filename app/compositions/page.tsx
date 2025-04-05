import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { ArrowRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAllCompositions } from '@/lib/db/services/compositionService';
import { getPrimitiveById } from '@/lib/db/services/primitiveService';
import { CompositionStatus } from '@/lib/db/models/composition';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Compositions - MoveMatrix',
  description: 'Create and manage compositions of DeFi primitives in MoveMatrix',
};

export default async function CompositionsPage() {
  // Fetch compositions from the database
  const compositions = await getAllCompositions();
  
  // Create a map of primitive IDs to names for display
  const primitiveNames = new Map<string, string>();
  
  // Get primitive names for all compositions
  for (const composition of compositions) {
    for (const primitiveId of composition.primitiveIds || []) {
      if (!primitiveNames.has(primitiveId)) {
        const primitive = await getPrimitiveById(primitiveId);
        if (primitive) {
          primitiveNames.set(primitiveId, primitive.name);
        }
      }
    }
  }
  
  // Helper function to get a primitive name or fallback to ID
  const getPrimitiveName = (primitiveId: string) => {
    return primitiveNames.get(primitiveId) || primitiveId.split('-')[0];
  };

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
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

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Compositions</h1>
          <p className="text-muted-foreground">
            Custom DeFi products built with MoveMatrix primitives.
          </p>
        </div>

        {compositions.length > 0 ? (
          <div className="space-y-8">
            {compositions.map((composition) => (
              <div key={composition.id} className="bg-background border rounded-lg overflow-hidden">
                <div className="grid md:grid-cols-3 gap-6 p-6">
                  <div className="col-span-2">
                    <div className="mb-2 flex items-center gap-2">
                      <h2 className="text-2xl font-bold">{composition.name}</h2>
                      {getStatusBadge(composition.status || 'draft')}
                    </div>
                    <p className="text-muted-foreground mb-4">{composition.description}</p>
                    <div className="flex gap-2 flex-wrap">
                      {(composition.primitiveIds || []).map((primitiveId) => (
                        <div key={primitiveId} className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium">
                          {getPrimitiveName(primitiveId)}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col md:items-end justify-center gap-2">
                    <Button asChild variant="outline">
                      <Link href={`/compositions/${composition.id}`}>
                        View Details <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                    {composition.status === CompositionStatus.DEPLOYED ? (
                      <Button>
                        <Link href={`/compositions/${composition.id}`}>
                          Deploy Composition
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">No Compositions Yet</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Create your first composition by connecting multiple DeFi primitives to build a custom financial product.
            </p>
            <Button asChild>
              <Link href="/compositions/new">
                <Plus className="h-4 w-4 mr-2" /> Create Composition
              </Link>
            </Button>
          </div>
        )}

        <div className="mt-4 bg-background border rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">Create Your Own Product</h2>
            <p className="text-muted-foreground mb-4">
              Not finding what you need? Build a custom product using our primitives.
            </p>
            <div className="flex gap-4">
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
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 