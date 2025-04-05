'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Link2, Plus, Save, X, Trash2 } from 'lucide-react';
import FunctionSelector from './FunctionSelector';
import ParameterMapping from './ParameterMapping';
import { IPrimitive } from '@/lib/db/models/primitive';
import { IConnection, IParameterMapping } from '@/lib/db/models/composition';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ConnectionBuilderProps {
  primitives: IPrimitive[];
  selectedPrimitiveIds: string[];
  connections: IConnection[];
  onConnectionsChange: (connections: IConnection[]) => void;
  onDelete: () => void;
  availableFunctions: {
    source: Function[];
    target: Function[];
  };
}

export default function ConnectionBuilder({
  primitives,
  selectedPrimitiveIds,
  connections,
  onConnectionsChange,
  onDelete,
  availableFunctions,
}: ConnectionBuilderProps) {
  const [isCreatingConnection, setIsCreatingConnection] = useState(false);
  const [newConnection, setNewConnection] = useState<Partial<IConnection>>({});
  const [parameterMappings, setParameterMappings] = useState<IParameterMapping[]>([]);
  const [description, setDescription] = useState('');
  
  // Filter to only selected primitives
  const selectedPrimitives = primitives.filter(p => 
    selectedPrimitiveIds.includes(p.id)
  );

  // Check if we can create a connection
  const canCreateConnection = selectedPrimitives.length >= 2;
  
  // Start creating a new connection
  const startConnection = () => {
    setIsCreatingConnection(true);
    setNewConnection({});
    setParameterMappings([]);
    setDescription('');
  };
  
  // Cancel connection creation
  const cancelConnection = () => {
    setIsCreatingConnection(false);
    setNewConnection({});
    setParameterMappings([]);
    setDescription('');
  };
  
  // Save the new connection
  const saveConnection = () => {
    if (!newConnection.sourceId || !newConnection.sourceFunction || 
        !newConnection.targetId || !newConnection.targetFunction) {
      return;
    }
    
    const connection: IConnection = {
      sourceId: newConnection.sourceId,
      sourceFunction: newConnection.sourceFunction,
      targetId: newConnection.targetId,
      targetFunction: newConnection.targetFunction,
      parameterMappings: parameterMappings,
      description: description
    };
    
    onConnectionsChange([...connections, connection]);
    setIsCreatingConnection(false);
    setNewConnection({});
    setParameterMappings([]);
    setDescription('');
  };
  
  // Remove an existing connection
  const removeConnection = (index: number) => {
    const newConnections = [...connections];
    newConnections.splice(index, 1);
    onConnectionsChange(newConnections);
  };
  
  // Get primitive by ID
  const getPrimitiveById = (id: string): IPrimitive | undefined => {
    if (!id) return undefined;
    const primitive = primitives.find(p => p.id === id);
    
    if (!primitive) {
      console.error(`Primitive with ID ${id} not found. Available primitives:`, primitives);
      return undefined;
    }
    
    return primitive;
  };
  
  // Check if we can save the connection
  const canSaveConnection = 
    newConnection.sourceId && 
    newConnection.sourceFunction && 
    newConnection.targetId && 
    newConnection.targetFunction;

  // Handle source primitive selection
  const handleSourcePrimitiveChange = (primitiveId: string) => {
    setNewConnection({
      ...newConnection,
      sourceId: primitiveId,
      sourceFunction: undefined
    });
    // Reset parameter mappings when changing primitives
    setParameterMappings([]);
  };

  // Handle target primitive selection
  const handleTargetPrimitiveChange = (primitiveId: string) => {
    setNewConnection({
      ...newConnection,
      targetId: primitiveId,
      targetFunction: undefined
    });
    // Reset parameter mappings when changing primitives
    setParameterMappings([]);
  };

  const handleSourceFunctionSelect = (functionName: string) => {
    setNewConnection({
      ...newConnection,
      sourceFunction: functionName,
      parameterMappings: [],
    });
  };

  const handleTargetFunctionSelect = (functionName: string) => {
    setNewConnection({
      ...newConnection,
      targetFunction: functionName,
      parameterMappings: [],
    });
  };

  const handleParameterMappingsUpdate = (mappings: IParameterMapping[]) => {
    setNewConnection({
      ...newConnection,
      parameterMappings: mappings,
    });
  };

  return (
    <Card className="border border-white/10 backdrop-blur-sm bg-black-200/50 p-6 rounded-xl">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
          Connection <span className="text-purple">Configuration</span>
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="text-white/50 hover:text-red-500 hover:bg-red-500/20 rounded-xl"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>

      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="text-sm font-medium text-white/70">Source Function</label>
            <FunctionSelector
              functions={availableFunctions.source}
              selectedFunction={newConnection.sourceFunction}
              onSelect={handleSourceFunctionSelect}
            />
          </div>
          <div className="space-y-4">
            <label className="text-sm font-medium text-white/70">Target Function</label>
            <FunctionSelector
              functions={availableFunctions.target}
              selectedFunction={newConnection.targetFunction}
              onSelect={handleTargetFunctionSelect}
            />
          </div>
        </div>

        {newConnection.sourceFunction && newConnection.targetFunction && (
          <div className="pt-6 border-t border-white/10">
            <h4 className="text-lg font-medium mb-4 text-white/90">Parameter Mappings</h4>
            <ParameterMapping
              sourceFunction={availableFunctions.source.find(
                (f) => f.name === newConnection.sourceFunction
              )}
              targetFunction={availableFunctions.target.find(
                (f) => f.name === newConnection.targetFunction
              )}
              mappings={newConnection.parameterMappings}
              onUpdate={handleParameterMappingsUpdate}
            />
          </div>
        )}

        <div className="flex justify-end pt-6">
          <Button className="bg-purple hover:bg-purple/80 text-white rounded-xl gap-2">
            Save Connection
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
} 