"use client";

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
import { Card } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";

// export const metadata: Metadata = {
//   title: 'Compositions - MoveMatrix',
//   description: 'Create and manage compositions of DeFi primitives in MoveMatrix',
// };

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
              DeFi <span className="text-purple">Compositions</span>
            </h1>
            <p className="text-white/70 mt-2">
              Complex DeFi strategies composed from our secure primitives
            </p>
          </div>
          <Link href="/compositions/new" passHref>
            <Button className="bg-purple hover:bg-purple/80 text-white rounded-xl gap-2">
              <Plus className="h-4 w-4" />
              New Composition
            </Button>
          </Link>
        </div>

        {compositions.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {compositions.map((composition) => (
              <Card
                key={composition.id}
                className="border border-white/10 backdrop-blur-sm bg-black-200/50 p-6 rounded-xl group hover:border-purple/50 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{composition.name}</h3>
                    <div className="flex gap-2 mt-2">
                      {(composition.primitiveIds || []).map((primitiveId) => (
                        <span
                          key={primitiveId}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple/20 text-purple"
                        >
                          {getPrimitiveName(primitiveId)}
                        </span>
                      ))}
                    </div>
                    {composition.status === CompositionStatus.DEPLOYED ? (
                      <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success text-success">
                        Deployed
                      </span>
                    ) : (
                      <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-500">
                        In Development
                      </span>
                    )}
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-white/30 group-hover:text-purple transition-colors" />
                </div>
                <p className="text-white/70 text-sm mb-4">
                  {composition.description}
                </p>
                <div className="flex gap-2">
                  <Button 
                    className="bg-purple hover:bg-purple/80 text-white rounded-xl flex-1"
                    onClick={() => window.location.href = `/compositions/${composition.id}`}
                  >
                    View Details
                  </Button>
                </div>
              </Card>
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