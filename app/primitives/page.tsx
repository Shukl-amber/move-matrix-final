"use client";

import React from "react";
import { Metadata } from 'next';
import Link from 'next/link';
import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { getAllPrimitives } from '@/lib/db/services/primitiveService';

// export const metadata: Metadata = {
//   title: 'Primitives - MoveMatrix',
//   description: 'Manage and configure DeFi primitives in MoveMatrix',
// };

export default async function PrimitivesPage() {
  // Fetch primitives from the database
  const primitives = await getAllPrimitives();
  
  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
            DeFi <span className="text-purple">Primitives</span>
          </h1>
          <p className="text-white/70 mt-2">
            Explore and use our pre-built, secure DeFi building blocks
          </p>
        </div>

        {/* Primitives Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {primitives.map((primitive) => (
            <Card
              key={primitive.id}
              className="border border-white/10 backdrop-blur-sm bg-black-200/50 p-6 rounded-xl group hover:border-purple/50 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{primitive.name}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple/20 text-purple mt-2">
                    {primitive.category}
                  </span>
                  {primitive.status === "Beta" && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-500">
                      Beta
                    </span>
                  )}
                </div>
                <ArrowUpRight className="h-5 w-5 text-white/30 group-hover:text-purple transition-colors" />
              </div>
              <p className="text-white/70 text-sm mb-4">
                {primitive.description}
              </p>
              <div className="flex gap-2">
                <Button 
                  className="bg-purple hover:bg-purple/80 text-white rounded-xl flex-1"
                  onClick={() => window.location.href = `/primitives/${primitive.id}`}
                >
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
} 