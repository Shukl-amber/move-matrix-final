import React from 'react';
import { Metadata } from 'next';
import { MainLayout } from '@/components/layout/MainLayout';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Code, 
  Edit, 
  ExternalLink, 
  Link2, 
  Trash2, 
  ArrowRight,
  Play,
  Download 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IConnection, CompositionStatus } from '@/lib/db/models/composition';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { getCompositionById } from '@/lib/db/services/compositionService';
import { getPrimitiveById } from '@/lib/db/services/primitiveService';
import { IPrimitive } from '@/lib/db/models/primitive';
import CompositionDetail from './CompositionDetail';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const id = params?.id;
  
  if (!id || id === 'undefined') {
    return {
      title: 'Composition Not Found - MoveMatrix',
      description: 'The requested composition could not be found',
    };
  }
  
  const composition = await getCompositionById(id);
  
  return {
    title: `${composition?.name || 'Composition'} - MoveMatrix`,
    description: composition?.description || 'View composition details in MoveMatrix',
  };
}

export default async function CompositionDetailPage({ params }: { params: { id: string } }) {
  const id = params?.id;
  
  // Check for valid ID format
  if (!id || id === 'undefined') {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <h1 className="text-2xl font-bold mb-2">Invalid Composition ID</h1>
          <p className="text-muted-foreground mb-6">The composition ID provided is invalid or undefined.</p>
          <Button asChild>
            <Link href="/compositions">Back to Compositions</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }
  
  // Fetch the specific composition by ID
  const composition = await getCompositionById(id);
  
  if (!composition) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <h1 className="text-2xl font-bold mb-2">Composition Not Found</h1>
          <p className="text-muted-foreground mb-6">The composition you are looking for does not exist or has been deleted.</p>
          <Button asChild>
            <Link href="/compositions">Back to Compositions</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }
  
  // Fetch primitives used in this composition
  const primitives: Record<string, IPrimitive | null> = {};
  
  for (const primitiveId of composition.primitiveIds || []) {
    primitives[primitiveId] = await getPrimitiveById(primitiveId);
  }
  
  return (
    <MainLayout>
      <CompositionDetail composition={composition} primitives={primitives} />
    </MainLayout>
  );
} 