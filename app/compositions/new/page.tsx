'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mockPrimitives } from '@/lib/types/primitives';
import { ArrowRight, ArrowLeft, Plus, Check, X, Layers, LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NewCompositionPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [composition, setComposition] = useState({
    name: '',
    description: '',
    selectedPrimitives: [] as string[],
    connections: [] as Array<{source: string, target: string, description: string}>,
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setComposition({...composition, name: e.target.value});
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setComposition({...composition, description: e.target.value});
  };

  const handlePrimitiveToggle = (primitiveId: string) => {
    if (composition.selectedPrimitives.includes(primitiveId)) {
      setComposition({
        ...composition,
        selectedPrimitives: composition.selectedPrimitives.filter(id => id !== primitiveId)
      });
    } else {
      setComposition({
        ...composition,
        selectedPrimitives: [...composition.selectedPrimitives, primitiveId]
      });
    }
  };

  const handleAddConnection = () => {
    if (composition.selectedPrimitives.length < 2) return;
    
    const newConnection = {
      source: composition.selectedPrimitives[0],
      target: composition.selectedPrimitives[1],
      description: 'Connect output of first primitive to input of second primitive'
    };
    
    setComposition({
      ...composition,
      connections: [...composition.connections, newConnection]
    });
  };

  const handleRemoveConnection = (index: number) => {
    setComposition({
      ...composition,
      connections: composition.connections.filter((_, i) => i !== index)
    });
  };

  const handleSave = () => {
    // In a real implementation, we would save the composition to the backend
    console.log('Saving composition:', composition);
    // Navigate to the compositions page
    router.push('/compositions');
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const canProceedToStep2 = composition.name.trim() !== '' && composition.description.trim() !== '';
  const canProceedToStep3 = composition.selectedPrimitives.length >= 2;
  const canFinish = composition.connections.length >= 1;

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
                    value={composition.name}
                    onChange={handleNameChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Describe what your composition does..."
                    value={composition.description}
                    onChange={handleDescriptionChange}
                  />
                </div>
              </CardContent>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle>Select Primitives</CardTitle>
                <CardDescription>
                  Choose the primitives you want to use in your composition.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {mockPrimitives.map((primitive) => (
                    <Card 
                      key={primitive.id}
                      className={`cursor-pointer transition-all ${composition.selectedPrimitives.includes(primitive.id) ? 'border-primary' : 'hover:border-primary/50'}`}
                      onClick={() => handlePrimitiveToggle(primitive.id)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">{primitive.name}</CardTitle>
                          {composition.selectedPrimitives.includes(primitive.id) && (
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
                <div className="rounded-md bg-muted p-4">
                  <div className="text-sm font-medium mb-2">Selected Primitives</div>
                  <div className="flex flex-wrap gap-2">
                    {composition.selectedPrimitives.map((primitiveId) => {
                      const primitive = mockPrimitives.find(p => p.id === primitiveId);
                      return (
                        <div key={primitiveId} className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium">
                          {primitive?.name || primitiveId}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Button onClick={handleAddConnection} className="gap-2" disabled={composition.selectedPrimitives.length < 2}>
                    <LinkIcon className="h-4 w-4" />
                    Create Connection
                  </Button>
                </div>

                {composition.connections.length > 0 && (
                  <div className="space-y-4">
                    <div className="text-sm font-medium">Connections</div>
                    {composition.connections.map((connection, index) => {
                      const sourcePrimitive = mockPrimitives.find(p => p.id === connection.source);
                      const targetPrimitive = mockPrimitives.find(p => p.id === connection.target);
                      return (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-md">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium">{sourcePrimitive?.name || connection.source}</div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <div className="text-sm font-medium">{targetPrimitive?.name || connection.target}</div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleRemoveConnection(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
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
              <Button onClick={handleSave} disabled={!canFinish}>
                Create Composition
              </Button>
            )}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
} 