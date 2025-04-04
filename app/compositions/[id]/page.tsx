'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useRouter } from 'next/navigation';
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
import { mockPrimitives } from '@/lib/types/primitives';
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

// Mock composition for demonstration
const mockComposition = {
  id: 'comp-1',
  name: 'Leveraged Yield Farming',
  description: 'A composition that allows users to borrow assets and deposit them into a yield-generating protocol for increased returns.',
  ownerId: 'user-1',
  createdAt: new Date('2023-09-15'),
  updatedAt: new Date('2023-09-20'),
  status: CompositionStatus.DRAFT,
  primitiveIds: ['primitive-1', 'primitive-5'],
  connections: [
    {
      sourceId: 'primitive-1',
      sourceFunction: 'borrow',
      targetId: 'primitive-5',
      targetFunction: 'deposit',
      description: 'Borrow assets and deposit them into vault for yield',
      parameterMappings: [
        {
          sourceParam: 'amount',
          targetParam: 'amount',
          constantValue: undefined
        },
        {
          sourceParam: 'account',
          targetParam: 'account',
          constantValue: undefined
        }
      ]
    }
  ] as IConnection[],
  generatedCode: `module CompositionLeveragedYieldFarming {
    use primitive_1::lending_protocol;
    use primitive_5::vault_strategy;
    
    public entry fun execute_composition(account: address, amount: u64, collateral_amount: u64) {
        // Borrow assets from lending protocol
        let borrow_success = lending_protocol::borrow(amount, account, collateral_amount);
        assert!(borrow_success, 0);
        
        // Deposit borrowed assets into vault
        let shares = vault_strategy::deposit(amount, account);
    }
  }`
};

export default function CompositionDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [alertOpen, setAlertOpen] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState(mockComposition.status);
  const [deploying, setDeploying] = useState(false);

  // Get primitive info by id
  const getPrimitiveById = (id: string) => {
    return mockPrimitives.find(p => p.id === id);
  };
  
  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get status badge color
  const getStatusBadge = (status: CompositionStatus) => {
    switch(status) {
      case CompositionStatus.DRAFT:
        return <Badge variant="outline">Draft</Badge>;
      case CompositionStatus.COMPLETE:
        return <Badge variant="secondary">Complete</Badge>;
      case CompositionStatus.DEPLOYED:
        return <Badge variant="success">Deployed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  // Handle delete
  const handleDelete = () => {
    console.log('Deleting composition:', params.id);
    router.push('/compositions');
  };
  
  // Handle deploy
  const handleDeploy = async () => {
    setDeploying(true);
    
    // Simulate deployment
    setTimeout(() => {
      setDeploymentStatus(CompositionStatus.DEPLOYED);
      setDeploying(false);
    }, 2000);
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link href="/compositions" className="text-sm text-muted-foreground hover:text-foreground flex items-center mb-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Compositions
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">{mockComposition.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              {getStatusBadge(deploymentStatus)}
              <span className="text-sm text-muted-foreground">
                Updated {formatDate(mockComposition.updatedAt)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/compositions/edit/${params.id}`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAlertOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            {deploymentStatus !== CompositionStatus.DEPLOYED ? (
              <Button size="sm" onClick={handleDeploy} disabled={deploying}>
                {deploying ? 'Deploying...' : 'Deploy'}
                {!deploying && <Play className="h-4 w-4 ml-2" />}
              </Button>
            ) : (
              <Button size="sm" variant="secondary">
                <Download className="h-4 w-4 mr-2" />
                Export ABI
              </Button>
            )}
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
            <TabsTrigger value="code">Generated Code</TabsTrigger>
            {deploymentStatus === CompositionStatus.DEPLOYED && (
              <TabsTrigger value="deployment">Deployment</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <p className="text-muted-foreground">{mockComposition.description}</p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">Primitives Used</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {mockComposition.primitiveIds.map(primitiveId => {
                  const primitive = getPrimitiveById(primitiveId);
                  if (!primitive) return null;
                  
                  return (
                    <Card key={primitiveId}>
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{primitive.name}</h3>
                              <div className="rounded-full inline-block bg-primary/10 px-2 py-0.5 text-xs font-medium capitalize">
                                {primitive.category}
                              </div>
                            </div>
                            <Link 
                              href={`/primitives/${primitiveId}`} 
                              className="text-xs text-primary hover:underline"
                            >
                              View
                            </Link>
                          </div>
                          <p className="text-xs text-muted-foreground">{primitive.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="connections" className="space-y-6 mt-6">
            <h2 className="text-xl font-semibold mb-3">Connections</h2>
            {mockComposition.connections.length > 0 ? (
              <div className="space-y-4">
                {mockComposition.connections.map((connection, index) => {
                  const sourcePrimitive = getPrimitiveById(connection.sourceId);
                  const targetPrimitive = getPrimitiveById(connection.targetId);
                  
                  if (!sourcePrimitive || !targetPrimitive) return null;
                  
                  return (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Link2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Connection {index + 1}</span>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                          <div className="flex-1 p-3 border rounded-md">
                            <div className="font-mono text-sm">{sourcePrimitive.name}.{connection.sourceFunction}</div>
                          </div>
                          <ArrowRight className="h-4 w-4 self-center" />
                          <div className="flex-1 p-3 border rounded-md">
                            <div className="font-mono text-sm">{targetPrimitive.name}.{connection.targetFunction}</div>
                          </div>
                        </div>
                        
                        {connection.description && (
                          <p className="text-sm text-muted-foreground mb-3">{connection.description}</p>
                        )}
                        
                        {connection.parameterMappings.length > 0 && (
                          <div className="mt-3">
                            <h4 className="text-sm font-medium mb-2">Parameter Mappings:</h4>
                            <div className="bg-muted/50 p-3 rounded-md">
                              {connection.parameterMappings.map((mapping, mappingIndex) => (
                                <div key={mappingIndex} className="flex items-center gap-1 text-sm">
                                  <span className="font-mono">{targetPrimitive.name}.{connection.targetFunction}.{mapping.targetParam}</span>
                                  <span>←</span>
                                  {mapping.sourceParam ? (
                                    <span className="font-mono">{sourcePrimitive.name}.{connection.sourceFunction}.{mapping.sourceParam}</span>
                                  ) : (
                                    <span className="italic">{mapping.constantValue || 'constant'}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center p-6 text-muted-foreground border rounded-md">
                No connections defined for this composition.
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="code" className="space-y-6 mt-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold">Generated Move Code</h2>
              <Button variant="outline" size="sm">
                <Code className="h-4 w-4 mr-2" />
                Copy Code
              </Button>
            </div>
            <div className="bg-muted p-4 rounded-md overflow-x-auto">
              <pre className="text-sm font-mono">
                {mockComposition.generatedCode || 'No code has been generated yet.'}
              </pre>
            </div>
          </TabsContent>
          
          {deploymentStatus === CompositionStatus.DEPLOYED && (
            <TabsContent value="deployment" className="space-y-6 mt-6">
              <h2 className="text-xl font-semibold mb-3">Deployment Details</h2>
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="text-sm font-medium">Transaction Hash</h3>
                      <div className="flex items-center mt-1">
                        <code className="text-xs bg-muted p-1 rounded">0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t</code>
                        <Button variant="ghost" size="icon" className="h-6 w-6 ml-2">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium">Deployment Address</h3>
                      <div className="flex items-center mt-1">
                        <code className="text-xs bg-muted p-1 rounded">0xdeployed_address_123456789abcdef</code>
                        <Button variant="ghost" size="icon" className="h-6 w-6 ml-2">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium">Deployment Date</h3>
                      <p className="text-sm text-muted-foreground">April 25, 2023 at 14:30 UTC</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium">Network</h3>
                      <p className="text-sm text-muted-foreground">Aptos Testnet</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
      
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the composition "{mockComposition.name}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
} 