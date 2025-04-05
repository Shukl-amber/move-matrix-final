'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, ArrowLeft, Plus, Check, X, Layers, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IConnection, IParameterMapping, CompositionStatus } from '@/lib/db/models/composition';
import ConnectionBuilder from '@/components/compositions/ConnectionBuilder';
import { createNewComposition } from '@/app/actions/compositionActions';
import { IPrimitive } from '@/lib/db/models/primitive';

export default function NewCompositionPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPrimitiveIds, setSelectedPrimitiveIds] = useState<string[]>([]);
  const [connections, setConnections] = useState<IConnection[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [primitives, setPrimitives] = useState<IPrimitive[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch primitives on component mount
  useEffect(() => {
    async function fetchPrimitives() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/primitives');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch primitives: ${response.statusText}`);
        }
        
        const data = await response.json();
        setPrimitives(data.primitives);
      } catch (err: any) {
        console.error('Error fetching primitives:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPrimitives();
  }, []);

  const handlePrimitiveToggle = (primitiveId: string) => {
    if (selectedPrimitiveIds.includes(primitiveId)) {
      setSelectedPrimitiveIds(
        selectedPrimitiveIds.filter(id => id !== primitiveId)
      );
    } else {
      setSelectedPrimitiveIds([...selectedPrimitiveIds, primitiveId]);
    }
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    
    try {
      // Generate a random ID for composition (MongoDB will assign a real _id)
      const compositionId = `comp-${Date.now()}`;
      
      // Create primitives array with positions
      const primitives = selectedPrimitiveIds.map((primitiveId, index) => ({
        primitiveId,
        position: {
          x: 100 + (index * 200), // Simple layout algorithm
          y: 150
        }
      }));
      
      // Call the server action to create the composition
      const result = await createNewComposition({
        id: compositionId,
        name,
        description,
        ownerId: "user-1", // This will be mapped to creatorAddress in the backend
        createdAt: new Date(),
        updatedAt: new Date(),
        status: CompositionStatus.DRAFT, // This will be mapped to deploymentStatus
        primitiveIds: selectedPrimitiveIds,
        primitives: primitives,
        connections,
      });
      
      if (result.success) {
        console.log('Composition created successfully:', result.data);
        router.push('/compositions');
      } else {
        console.error('Failed to create composition:', result.error);
        alert(`Failed to create composition: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Error saving composition:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validation for each step
  const canProceedToStep2 = name.trim() !== '' && description.trim() !== '';
  const canProceedToStep3 = selectedPrimitiveIds.length >= 2;
  const canSave = connections.length >= 1;

  // Show loading state
  if (isLoading && step === 2) {
    return (
      <MainLayout>
        <div className="flex flex-col gap-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">Loading primitives...</h2>
            <div className="animate-pulse h-4 bg-muted rounded w-48 mx-auto"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Show error state
  if (error && step === 2) {
    return (
      <MainLayout>
        <div className="flex flex-col gap-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4 text-destructive">Error Loading Primitives</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
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
            <h1 className="text-3xl font-bold tracking-tight">Create New Composition</h1>
            <p className="text-muted-foreground">
              Build a new DeFi product by combining primitives together.
            </p>
          </div>
          <Link href="/compositions" passHref>
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Compositions
            </Button>
          </Link>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-between mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 
                ${step === i ? 'bg-primary text-white' : step > i ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}
              >
                {step > i ? <Check className="h-5 w-5" /> : i}
              </div>
              <div className={`text-sm ${step === i ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                {i === 1 ? 'Details' : i === 2 ? 'Select Primitives' : 'Connect Primitives'}
              </div>
            </div>
          ))}
        </div>

        <Card>
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle>Composition Details</CardTitle>
                <CardDescription>
                  Provide basic information about your new composition.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Composition Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Leveraged Yield Farming"
                    value={name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what your composition does..."
                    value={description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                    rows={5}
                  />
                </div>
              </CardContent>
            </>
          )}

          {step === 2 && primitives.length > 0 && (
            <>
              <CardHeader>
                <CardTitle>Select Primitives</CardTitle>
                <CardDescription>
                  Choose the primitives you want to use in your composition.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {primitives.map((primitive) => (
                    <Card 
                      key={primitive.id}
                      className={`cursor-pointer transition-all ${selectedPrimitiveIds.includes(primitive.id) ? 'border-primary' : 'hover:border-primary/50'}`}
                      onClick={() => handlePrimitiveToggle(primitive.id)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">{primitive.name}</CardTitle>
                          {selectedPrimitiveIds.includes(primitive.id) && (
                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="rounded-full inline-block bg-primary/10 px-2 py-1 text-xs font-medium capitalize">
                          {primitive.category}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{primitive.description}</p>
                        
                        <div className="mt-3 text-xs text-muted-foreground">
                          <p className="font-medium">Functions:</p>
                          <ul className="list-disc list-inside">
                            {primitive.functions?.slice(0, 3).map((func, index) => (
                              <li key={index} className="font-mono">{func.name}</li>
                            ))}
                            {primitive.functions && primitive.functions.length > 3 && (
                              <li className="text-muted-foreground">+ {primitive.functions.length - 3} more</li>
                            )}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </>
          )}

          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle>Connect Primitives</CardTitle>
                <CardDescription>
                  Define how your primitives interact with each other.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ConnectionBuilder 
                  primitives={primitives}
                  selectedPrimitiveIds={selectedPrimitiveIds}
                  connections={connections}
                  onConnectionsChange={setConnections}
                />
              </CardContent>
            </>
          )}

          <div className="flex justify-between px-6 pb-6">
            {step > 1 ? (
              <Button variant="outline" onClick={prevStep}>
                Back
              </Button>
            ) : (
              <Link href="/compositions" passHref>
                <Button variant="outline">Cancel</Button>
              </Link>
            )}
            {step < 3 ? (
              <Button 
                onClick={nextStep} 
                disabled={step === 1 && !canProceedToStep2 || step === 2 && !canProceedToStep3}
              >
                Next
              </Button>
            ) : (
              <Button onClick={handleSave} disabled={!canSave || isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Composition'}
                {!isSubmitting && <Save className="h-4 w-4 ml-2" />}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
} 