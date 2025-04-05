'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Code, FileCode, Terminal } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { mockPrimitives } from '@/lib/types/primitives';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PrimitiveDetailsPage() {
  const params = useParams();
  const primitiveId = params.id as string;
  
  // Find the primitive by id
  const primitive = mockPrimitives.find(p => p.id === primitiveId);
  
  if (!primitive) {
    return (
      <MainLayout>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Primitive Not Found</h1>
              <p className="text-muted-foreground">
                The primitive you are looking for could not be found.
              </p>
            </div>
            <Link href="/primitives" passHref>
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Primitives
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{primitive.name}</h1>
              <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium capitalize">
                {primitive.category}
              </div>
            </div>
            <p className="text-muted-foreground mt-1">
              {primitive.description}
            </p>
          </div>
          <Link href="/primitives" passHref>
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Primitives
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="functions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="functions">Functions</TabsTrigger>
            <TabsTrigger value="code">Source Code</TabsTrigger>
            <TabsTrigger value="usage">Usage Examples</TabsTrigger>
          </TabsList>
          
          <TabsContent value="functions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Functions</CardTitle>
                <CardDescription>
                  These functions can be used to interact with the {primitive.name} primitive.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {primitive.functions?.map((func, index) => (
                  <div key={index} className="p-4 border rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <Code className="h-4 w-4 text-primary" />
                      <h3 className="font-medium">{func.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{func.description}</p>
                    <div className="bg-muted p-3 rounded-md font-mono text-xs">
                      {func.name}({func.parameters.join(', ')}) → {func.returnType}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="code" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Source Code</CardTitle>
                <CardDescription>
                  The implementation of the {primitive.name} primitive.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md bg-muted p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FileCode className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm font-medium">{primitive.moduleName || primitive.name.toLowerCase().replace(/\s+/g, '_')}.move</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Module address: {primitive.moduleAddress || '0x1'}
                    </div>
                  </div>
                  <div className="bg-background p-4 rounded-md font-mono text-xs overflow-x-auto">
                    <pre>
                      {`module ${primitive.moduleAddress || '0x1'}::${primitive.moduleName || primitive.name.toLowerCase().replace(/\s+/g, '_')} {
    // Source code would be displayed here
    // For demonstration purposes, we're showing placeholder content
    
    public fun ${primitive.functions?.[0]?.name || 'example_function'}(
        // Parameters would be listed here
    ) {
        // Function implementation
    }
    
    // More functions...
}`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="usage" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage Examples</CardTitle>
                <CardDescription>
                  Learn how to use the {primitive.name} primitive in your compositions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-md border p-4">
                  <h3 className="font-medium mb-2">Basic Usage</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    This example shows how to use the basic functions of the {primitive.name} primitive.
                  </p>
                  <div className="bg-muted p-4 rounded-md font-mono text-xs overflow-x-auto">
                    <pre>
                      {`// Example code using ${primitive.name}
script {
    use ${primitive.moduleAddress || '0x1'}::${primitive.moduleName || primitive.name.toLowerCase().replace(/\s+/g, '_')};
    
    fun main(account: signer) {
        // Initialize or interact with the primitive
        ${primitive.moduleName || primitive.name.toLowerCase().replace(/\s+/g, '_')}::${primitive.functions?.[0]?.name || 'example_function'}(...);
    }
}`}
                    </pre>
                  </div>
                </div>
                
                <div className="rounded-md border p-4">
                  <h3 className="font-medium mb-2">In a Composition</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    This example shows how to use the {primitive.name} primitive in a composition with other primitives.
                  </p>
                  <div className="bg-muted p-4 rounded-md font-mono text-xs overflow-x-auto">
                    <pre>
                      {`// Example composition
module my_defi::leveraged_yield {
    use ${primitive.moduleAddress || '0x1'}::${primitive.moduleName || primitive.name.toLowerCase().replace(/\s+/g, '_')};
    // Import other primitives...
    
    public fun setup_yield_strategy() {
        // Use the primitive as part of a larger composition
        ${primitive.moduleName || primitive.name.toLowerCase().replace(/\s+/g, '_')}::${primitive.functions?.[0]?.name || 'example_function'}(...);
        // Call other primitives...
    }
}`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-4">
          <Link href={`/compositions/new?primitive=${primitive.id}`} passHref>
            <Button className="gap-2">
              Create Composition with This Primitive
            </Button>
          </Link>
          
          <Button variant="outline" className="gap-2">
            <Terminal className="h-4 w-4" />
            Test in Playground
          </Button>
        </div>
      </div>
    </MainLayout>
  );
} 