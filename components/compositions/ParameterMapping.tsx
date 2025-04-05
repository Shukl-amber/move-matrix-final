'use client';

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { IPrimitive, IFunction } from '@/lib/db/models/primitive';
import { IParameterMapping } from '@/lib/db/models/composition';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowDown, Plus, X } from 'lucide-react';

interface ParameterMappingProps {
  sourcePrimitive: IPrimitive;
  sourceFunction: string;
  targetPrimitive: IPrimitive;
  targetFunction: string;
  parameterMappings: IParameterMapping[];
  onParameterMappingsChange: (mappings: IParameterMapping[]) => void;
}

// Add this helper function to safely get parameter names
const getParameterNames = (funcObj: IFunction | undefined): string[] => {
  if (!funcObj || !funcObj.parameters) {
    return [];
  }
  
  if (!Array.isArray(funcObj.parameters)) {
    return [];
  }
  
  return funcObj.parameters.map(param => {
    if (typeof param === 'string') {
      return param;
    }
    // Handle MongoDB object with _id
    if (typeof param === 'object' && param !== null) {
      // Use type assertion to handle MongoDB object
      const objParam = param as Record<string, any>;
      if (objParam.name && typeof objParam.name === 'string') {
        return objParam.name;
      }
      // Try to convert to string representation
      return JSON.stringify(param).replace(/[{}"]/g, '').replace(/_id:[^,]+,?/, '');
    }
    return String(param);
  });
};

export default function ParameterMapping({
  sourcePrimitive,
  sourceFunction,
  targetPrimitive,
  targetFunction,
  parameterMappings,
  onParameterMappingsChange
}: ParameterMappingProps) {
  // Find selected functions
  const sourceFuncObj = sourcePrimitive.functions?.find(f => f.name === sourceFunction);
  const targetFuncObj = targetPrimitive.functions?.find(f => f.name === targetFunction);
  
  if (!sourcePrimitive.functions || !targetPrimitive.functions || !sourceFuncObj || !targetFuncObj) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Please select valid functions from both primitives
      </div>
    );
  }

  // Get parameter names
  const sourceParams = getParameterNames(sourceFuncObj);
  const targetParams = getParameterNames(targetFuncObj);

  // Add a new parameter mapping
  const addParameterMapping = () => {
    if (!targetParams.length) return;
    
    const newMapping: IParameterMapping = {
      sourceParam: null, // Initially set to constant value
      targetParam: targetParams[0],
      constantValue: ''
    };
    
    onParameterMappingsChange([...parameterMappings, newMapping]);
  };

  // Remove a parameter mapping
  const removeParameterMapping = (index: number) => {
    const newMappings = [...parameterMappings];
    newMappings.splice(index, 1);
    onParameterMappingsChange(newMappings);
  };

  // Update a parameter mapping
  const updateParameterMapping = (index: number, field: keyof IParameterMapping, value: any) => {
    const newMappings = [...parameterMappings];
    newMappings[index] = { ...newMappings[index], [field]: value };
    
    // If we change from constant to source param or vice versa, update the other field
    if (field === 'sourceParam') {
      if (value === null) {
        newMappings[index].constantValue = '';
      } else {
        newMappings[index].constantValue = undefined;
      }
    }
    
    onParameterMappingsChange(newMappings);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Parameter Mappings</CardTitle>
          <CardDescription className="text-xs">
            Map outputs from {sourcePrimitive.name}.{sourceFunction} to inputs of {targetPrimitive.name}.{targetFunction}
          </CardDescription>
        </CardHeader>
        <CardContent className="py-3">
          {parameterMappings.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-4">
              No parameter mappings defined yet
            </div>
          ) : (
            <div className="space-y-4">
              {parameterMappings.map((mapping, index) => (
                <div key={index} className="border rounded-md p-3 space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-medium">Mapping {index + 1}</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeParameterMapping(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Target Parameter */}
                    <div>
                      <Label className="text-xs">Target Parameter</Label>
                      <Select
                        value={mapping.targetParam}
                        onValueChange={(value) => updateParameterMapping(index, 'targetParam', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select parameter" />
                        </SelectTrigger>
                        <SelectContent>
                          {targetParams.map((param) => (
                            <SelectItem key={param} value={param}>
                              {param}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Source or Constant */}
                    <div>
                      <Label className="text-xs">Mapped From</Label>
                      <Select
                        value={mapping.sourceParam !== null ? 'source' : 'constant'}
                        onValueChange={(value) => {
                          if (value === 'source') {
                            updateParameterMapping(
                              index, 
                              'sourceParam', 
                              sourceParams.length > 0 ? sourceParams[0] : null
                            );
                          } else {
                            updateParameterMapping(index, 'sourceParam', null);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select mapping type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="source">Source Parameter</SelectItem>
                          <SelectItem value="constant">Constant Value</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Source Parameter or Constant Value */}
                    {mapping.sourceParam !== null ? (
                      <div>
                        <Label className="text-xs">Source Parameter</Label>
                        <Select
                          value={mapping.sourceParam}
                          onValueChange={(value) => updateParameterMapping(index, 'sourceParam', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select parameter" />
                          </SelectTrigger>
                          <SelectContent>
                            {sourceParams.map((param) => (
                              <SelectItem key={param} value={param}>
                                {param}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div>
                        <Label className="text-xs">Constant Value</Label>
                        <Input
                          value={mapping.constantValue || ''}
                          onChange={(e) => updateParameterMapping(index, 'constantValue', e.target.value)}
                          placeholder="Enter a constant value"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <Button
            variant="outline"
            size="sm"
            className="mt-4 w-full"
            onClick={addParameterMapping}
            disabled={!targetParams.length}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Parameter Mapping
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 