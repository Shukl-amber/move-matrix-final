# MoveMatrix: Composable DeFi Primitive Generator - Implementation Guide

## Project Overview

Create a fully functional MVP for MoveMatrix, a platform that utilizes Move's resource model to generate standardized yet customizable DeFi building blocks that developers can compose into complex financial products.

The MVP will focus on:
1. Two core DeFi primitives (lending/borrowing and swapping)
2. A composition framework for connecting primitives
3. Two example complex products (leveraged yield farming and CDP with protection)
4. A visual builder interface for non-technical users
5. Basic testing and security infrastructure

## Tech Stack

- **Frontend**: Next.js 14+ with App Router, TypeScript, Tailwind CSS
- **Blockchain**: Aptos blockchain with Move language
- **Authentication**: Basic wallet connection (Petra wallet)
- **State Management**: React context and hooks
- **Visualization**: Flowchart diagrams for composition (react-flow)
- **Testing**: Jest for frontend, Aptos framework for Move modules

## Project Structure

Set up a Next.js project with the following structure:

```
/move-matrix
  /app                    # Next.js app router
    /api                  # API routes
    /dashboard            # Main dashboard pages
    /primitives           # Pages for managing primitives
    /compositions         # Pages for managing compositions
    /examples             # Example product pages
    /(auth)               # Authentication pages
  /components             # Reusable React components
    /ui                   # UI components
    /primitives           # Primitive-related components
    /compositions         # Composition-related components
    /layout               # Layout components
  /lib                    # Shared utilities
    /api                  # API client
    /blockchain           # Blockchain interaction
    /hooks                # Custom hooks
    /types                # TypeScript types
  /move                   # Move code
    /sources              # Move modules
      /primitives         # DeFi primitives
      /framework          # Composition framework
      /products           # Example products
    /tests                # Move tests
  /prisma                 # Database schema (if needed)
  /public                 # Static assets
```

## Implementation Steps

### 1. Initial Setup

1. Create a new Next.js project with TypeScript and Tailwind CSS
```bash
npx create-next-app move-matrix --typescript --tailwind --eslint
cd move-matrix
```

2. Install necessary dependencies
```bash
npm install react-flow-renderer @headlessui/react @heroicons/react aptos @tanstack/react-query date-fns zod react-hook-form lucide-react class-variance-authority clsx tailwind-merge
```

3. Set up base layout, theme, and authentication context

### 2. Move Module Implementation

Implement the core Move modules based on the provided code templates:

1. Create the Move project structure
```bash
mkdir -p move/sources/{primitives,framework,products} move/tests
```

2. Implement the lending primitive in `move/sources/primitives/lending_primitive.move`
3. Implement the swap primitive in `move/sources/primitives/swap_primitive.move`
4. Implement the composition framework in `move/sources/framework/composition_framework.move`
5. Implement the example products:
   - Leveraged yield farming in `move/sources/products/leveraged_yield_farming.move`
   - CDP with protection in `move/sources/products/cdp_protection.move`
6. Set up Move tests for each module

### 3. Frontend Components

#### Shared UI Components

1. Implement a component library with:
   - Button (primary, secondary, outline, ghost variants)
   - Input, Select, Textarea components
   - Card, Dialog, Popover components
   - Tabs, Accordion components
   - Toast notifications

2. Create layout components:
   - MainLayout with sidebar, header, and content area
   - Dashboard layout with summary cards
   - Form layouts for primitives and compositions

#### Primitive Management UI

1. Create a primitive list view with filtering options
2. Implement primitive detail view showing parameters and functions
3. Build forms for primitive registration and configuration

#### Composition Builder UI

1. Implement a drag-and-drop interface using react-flow
2. Create node components for each primitive type
3. Build connection logic for linking primitives
4. Implement parameter configuration forms for each node
5. Add validation for composition integrity

#### Example Product UI

1. Create guided setup wizards for the example products
2. Implement monitoring dashboards for each product
3. Build parameter adjustment interfaces for fine-tuning

### 4. Blockchain Integration

1. Implement wallet connection functionality:
```typescript
// lib/blockchain/wallet.ts
import { AptosClient, AptosAccount, Types } from 'aptos';

export const connectWallet = async () => {
  if (window.aptos) {
    try {
      const response = await window.aptos.connect();
      return {
        address: response.address,
        publicKey: response.publicKey,
        connected: true
      };
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      throw error;
    }
  } else {
    throw new Error('Petra wallet not found');
  }
};

export const executeTransaction = async (
  moduleAddress: string, 
  moduleName: string, 
  functionName: string, 
  typeArgs: string[], 
  args: any[]
) => {
  if (!window.aptos) throw new Error('Wallet not connected');
  
  const transaction = {
    type: 'entry_function_payload',
    function: `${moduleAddress}::${moduleName}::${functionName}`,
    type_arguments: typeArgs,
    arguments: args
  };
  
  try {
    const pendingTransaction = await window.aptos.signAndSubmitTransaction(transaction);
    return pendingTransaction.hash;
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
};
```

2. Create Move module interaction helpers:
```typescript
// lib/blockchain/primitives.ts
import { executeTransaction } from './wallet';

export const registerPrimitive = async (
  registryAddress: string,
  name: string,
  moduleAddress: string,
  moduleName: string,
  functions: string[]
) => {
  return executeTransaction(
    registryAddress,
    'composition_framework',
    'register_primitive',
    [],
    [name, moduleAddress, moduleName, functions]
  );
};

// Similar functions for other operations...
```

3. Implement module deployment scripts
4. Create blockchain event listeners for monitoring transactions

### 5. Testing Infrastructure

1. Write Move tests for:
   - Lending primitive functionality
   - Swap primitive functionality
   - Composition framework
   - Example products

2. Create stress testing tools using Aptos testing framework
3. Implement transaction simulation for validating compositions
4. Set up frontend tests for UI components

### 6. Monitoring Dashboard

1. Create position tracking views for each product
2. Implement health metrics with warning thresholds
3. Build notification system for important events
4. Create transaction history views

## Key Components to Implement

### 1. Primitive Selector Component

```tsx
// components/primitives/PrimitiveSelector.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { primitives } from '@/lib/data/primitives';

interface PrimitiveSelectorProps {
  onSelect: (primitiveId: string) => void;
}

export function PrimitiveSelector({ onSelect }: PrimitiveSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {primitives.map((primitive) => (
        <Card 
          key={primitive.id}
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => onSelect(primitive.id)}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{primitive.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{primitive.description}</p>
            <div className="mt-2">
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                {primitive.category}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### 2. Composition Builder Component

```tsx
// components/compositions/CompositionBuilder.tsx
import React, { useState, useCallback } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  Connection,
  Edge,
  Elements,
  Node,
  NodeProps,
  NodeTypesType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { PrimitiveNode } from './PrimitiveNode';
import { Button } from '@/components/ui/button';
import { saveComposition } from '@/lib/api/compositions';

const nodeTypes: NodeTypesType = {
  primitive: PrimitiveNode,
};

export function CompositionBuilder() {
  const [elements, setElements] = useState<Elements>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setElements((els) => addEdge({ ...params, animated: true }, els)),
    [setElements]
  );

  const onNodeDragStop = useCallback((event: React.MouseEvent, node: Node) => {
    // Update node position in backend if needed
  }, []);

  const onElementClick = useCallback((event: React.MouseEvent, element: Node | Edge) => {
    if (element.type === 'primitive') {
      setSelectedNode(element as Node);
    }
  }, []);

  const onAddNode = useCallback((primitiveType: string) => {
    const newNode = {
      id: `node-${Date.now()}`,
      type: 'primitive',
      data: { label: primitiveType, primitiveType },
      position: { x: 250, y: 150 },
    };
    setElements((els) => [...els, newNode]);
  }, [setElements]);

  const onSave = useCallback(async () => {
    try {
      await saveComposition({
        name: 'My Composition',
        elements,
      });
      // Show success notification
    } catch (error) {
      // Show error notification
      console.error('Failed to save composition:', error);
    }
  }, [elements]);

  return (
    <div className="h-[600px] w-full border border-border rounded-md">
      <div className="flex justify-between p-4 border-b">
        <div className="flex gap-2">
          <Button size="sm" onClick={() => onAddNode('lending')}>Add Lending</Button>
          <Button size="sm" onClick={() => onAddNode('swap')}>Add Swap</Button>
        </div>
        <Button onClick={onSave}>Save Composition</Button>
      </div>
      <ReactFlow
        elements={elements}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onElementClick={onElementClick}
        nodeTypes={nodeTypes}
        snapToGrid={true}
        snapGrid={[15, 15]}
      >
        <Background />
        <Controls />
      </ReactFlow>
      {selectedNode && (
        <div className="absolute right-0 top-0 h-full w-80 bg-background border-l border-border p-4 overflow-y-auto">
          {/* Node configuration panel */}
          <h3 className="font-medium mb-4">{selectedNode.data.label} Configuration</h3>
          {/* Add configuration form based on primitive type */}
        </div>
      )}
    </div>
  );
}
```

### 3. Example Product Setup Component

```tsx
// components/examples/LeveragedYieldFarmingSetup.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createLeveragedYieldFarming } from '@/lib/blockchain/products';

const formSchema = z.object({
  collateralAmount: z.string().min(1, 'Required'),
  borrowRatio: z.string().min(1, 'Required'),
  lendingPool: z.string().min(1, 'Required'),
  swapPool: z.string().min(1, 'Required'),
  rewardPool: z.string().min(1, 'Required'),
  autoCompound: z.boolean().default(false),
  rebalanceThreshold: z.string().min(1, 'Required'),
});

export function LeveragedYieldFarmingSetup() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      collateralAmount: '',
      borrowRatio: '50', // 50%
      lendingPool: '',
      swapPool: '',
      rewardPool: '',
      autoCompound: false,
      rebalanceThreshold: '120', // 120%
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const result = await createLeveragedYieldFarming(
        values.collateralAmount,
        values.borrowRatio,
        values.lendingPool,
        values.swapPool,
        values.rewardPool,
        values.autoCompound,
        values.rebalanceThreshold
      );
      // Handle success
    } catch (error) {
      // Handle error
      console.error('Failed to create strategy:', error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Leveraged Yield Farming Strategy</CardTitle>
        <CardDescription>
          This strategy allows you to amplify your yields by borrowing additional
          assets against your collateral and investing them.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="collateralAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Collateral Amount</FormLabel>
                  <FormControl>
                    <Input placeholder="100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="borrowRatio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Borrow Ratio (%)</FormLabel>
                  <FormControl>
                    <Input placeholder="50" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Add remaining form fields */}
            
            <Button type="submit" className="w-full">Create Strategy</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
```

### 4. Dashboard Component

```tsx
// components/dashboard/DashboardOverview.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CircleDollarSign, TrendingUp, Shield, Activity } from 'lucide-react';

export function DashboardOverview() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Value Locked</CardTitle>
          <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$45,231.89</div>
          <p className="text-xs text-muted-foreground">
            +20.1% from last month
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Compositions</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">12</div>
          <p className="text-xs text-muted-foreground">
            +3 new this week
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Yield Strategies</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">7</div>
          <p className="text-xs text-muted-foreground">
            Avg APY: 14.2%
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Protected CDPs</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">5</div>
          <p className="text-xs text-muted-foreground">
            All in healthy status
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

## Important Notes and Best Practices

### Move Code Development

1. Always use resource-oriented patterns for Move development
2. Implement comprehensive error handling with descriptive error codes
3. Use access control patterns to restrict sensitive operations
4. Follow the "check-effects-interactions" pattern for security
5. Always update state after external interactions, not before
6. Use generics (`phantom` type parameters) for reusable components
7. Implement thorough event emission for tracking changes

### Frontend Development

1. Make all components responsive using Tailwind's responsive prefixes
2. Implement proper loading and error states for async operations
3. Use React Query for data fetching and caching
4. Implement form validation using Zod schemas
5. Create reusable hooks for common blockchain operations
6. Use TypeScript strictly (no `any` types, proper interfaces)
7. Follow Next.js best practices for routing and data fetching
8. Use React context for global state (wallet connection, user preferences)

### Security Considerations

1. Never expose private keys or sensitive information
2. Implement proper input validation on both frontend and Move code
3. Use defensive programming in Move modules to prevent overflows
4. Rate limit API endpoints to prevent abuse
5. Consider implementing transaction simulation before actual execution
6. Add monitoring for suspicious activity

### Testing Strategy

1. Write unit tests for all Move modules
2. Create integration tests for composition workflows
3. Implement end-to-end tests for critical user journeys
4. Use snapshot testing for UI components
5. Test edge cases thoroughly (zero values, maximum values, etc.)

## First Implementation Targets

Focus on these features for the initial MVP:

1. Wallet connection and basic navigation
2. Simple primitive registration and management
3. Basic composition builder with two primitives
4. One fully functional example (Leveraged Yield Farming)
5. Basic dashboard with monitoring

This should give you a functional prototype that demonstrates the core value proposition while being achievable in a reasonable timeframe.