'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Link2, Plus, Save, X } from 'lucide-react';
import FunctionSelector from './FunctionSelector';
import ParameterMapping from './ParameterMapping';
import { IPrimitive } from '@/lib/db/models/primitive';
import { IConnection, IParameterMapping } from '@/lib/db/models/composition';

interface ConnectionBuilderProps {
  primitives: IPrimitive[];
  selectedPrimitiveIds: string[];
  connections: IConnection[];
  onConnectionsChange: (connections: IConnection[]) => void;
}

export default function ConnectionBuilder({
  primitives,
  selectedPrimitiveIds,
  connections,
  onConnectionsChange
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
    setNewConnection({
      sourceId: selectedPrimitives[0]?.id,
      targetId: selectedPrimitives[1]?.id,
    });
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
    return primitives.find(p => p.id === id);
  };
  
  // Check if we can save the connection
  const canSaveConnection = 
    newConnection.sourceId && 
    newConnection.sourceFunction && 
    newConnection.targetId && 
    newConnection.targetFunction;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Connections</h3>
        {!isCreatingConnection && (
          <Button 
            onClick={startConnection} 
            disabled={!canCreateConnection} 
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Connection
          </Button>
        )}
      </div>
      
      {!canCreateConnection && !isCreatingConnection && (
        <Card className="bg-muted/30">
          <CardContent className="pt-6 text-center text-muted-foreground">
            Select at least two primitives to create connections
          </CardContent>
        </Card>
      )}
      
      {/* Connection Builder Interface */}
      {isCreatingConnection && (
        <Card>
          <CardHeader>
            <CardTitle>Create Connection</CardTitle>
            <CardDescription>
              Define how your primitives interact with each other
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Source Primitive */}
              <div className="space-y-4">
                <div>
                  <Label>Source Primitive</Label>
                  <div className="p-3 border rounded-md mt-2">
                    {getPrimitiveById(newConnection.sourceId || '')?.name || 'Select a primitive'}
                  </div>
                </div>
                
                {newConnection.sourceId && (
                  <FunctionSelector
                    primitive={getPrimitiveById(newConnection.sourceId) as IPrimitive}
                    selectedFunction={newConnection.sourceFunction || null}
                    onChange={(func) => setNewConnection({...newConnection, sourceFunction: func})}
                    label="Source Function"
                  />
                )}
              </div>
              
              {/* Target Primitive */}
              <div className="space-y-4">
                <div>
                  <Label>Target Primitive</Label>
                  <div className="p-3 border rounded-md mt-2">
                    {getPrimitiveById(newConnection.targetId || '')?.name || 'Select a primitive'}
                  </div>
                </div>
                
                {newConnection.targetId && (
                  <FunctionSelector
                    primitive={getPrimitiveById(newConnection.targetId) as IPrimitive}
                    selectedFunction={newConnection.targetFunction || null}
                    onChange={(func) => setNewConnection({...newConnection, targetFunction: func})}
                    label="Target Function"
                  />
                )}
              </div>
            </div>
            
            {/* Parameter Mappings */}
            {newConnection.sourceFunction && newConnection.targetFunction && (
              <ParameterMapping
                sourcePrimitive={getPrimitiveById(newConnection.sourceId || '') as IPrimitive}
                sourceFunction={newConnection.sourceFunction}
                targetPrimitive={getPrimitiveById(newConnection.targetId || '') as IPrimitive}
                targetFunction={newConnection.targetFunction}
                parameterMappings={parameterMappings}
                onParameterMappingsChange={setParameterMappings}
              />
            )}
            
            {/* Connection Description */}
            <div className="space-y-2">
              <Label>Connection Description</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this connection does"
              />
            </div>
            
            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={cancelConnection}>
                Cancel
              </Button>
              <Button onClick={saveConnection} disabled={!canSaveConnection}>
                <Save className="h-4 w-4 mr-2" />
                Save Connection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Existing Connections List */}
      {connections.length > 0 && (
        <div className="space-y-4 mt-6">
          <h4 className="text-sm font-medium">Existing Connections</h4>
          {connections.map((connection, index) => {
            const sourcePrimitive = getPrimitiveById(connection.sourceId);
            const targetPrimitive = getPrimitiveById(connection.targetId);
            
            if (!sourcePrimitive || !targetPrimitive) return null;
            
            return (
              <Card key={index} className="border border-muted">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">Connection {index + 1}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeConnection(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="mt-3 flex items-center gap-2">
                    <div className="text-sm">
                      {sourcePrimitive.name}
                      <span className="text-xs text-muted-foreground mx-1">.</span>
                      <span className="font-mono text-xs">{connection.sourceFunction}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div className="text-sm">
                      {targetPrimitive.name}
                      <span className="text-xs text-muted-foreground mx-1">.</span>
                      <span className="font-mono text-xs">{connection.targetFunction}</span>
                    </div>
                  </div>
                  
                  {connection.description && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      {connection.description}
                    </div>
                  )}
                  
                  {connection.parameterMappings.length > 0 && (
                    <div className="mt-3 text-xs">
                      <div className="font-medium mb-1">Parameter Mappings:</div>
                      <div className="space-y-1">
                        {connection.parameterMappings.map((mapping, mappingIndex) => (
                          <div key={mappingIndex} className="flex items-center gap-1">
                            <span className="font-mono">{mapping.targetParam}</span>
                            <span>←</span>
                            {mapping.sourceParam ? (
                              <span className="font-mono">{mapping.sourceParam}</span>
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
      )}
    </div>
  );
} 