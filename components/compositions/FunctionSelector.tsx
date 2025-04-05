'use client';

import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { IPrimitive, IFunction } from '@/lib/db/models/primitive';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface FunctionSelectorProps {
  primitive: IPrimitive;
  selectedFunction: string | null;
  onChange: (functionName: string) => void;
  label?: string;
}

export default function FunctionSelector({ 
  primitive, 
  selectedFunction, 
  onChange,
  label = 'Select Function'
}: FunctionSelectorProps) {
  if (!primitive || !primitive.functions || primitive.functions.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No functions available for this primitive
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={selectedFunction || ''} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a function" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Available Functions</SelectLabel>
            {primitive.functions.map((func) => (
              <SelectItem key={func.name} value={func.name}>
                {func.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      
      {selectedFunction && (
        <FunctionDetails 
          primitive={primitive} 
          functionName={selectedFunction} 
        />
      )}
    </div>
  );
}

interface FunctionDetailsProps {
  primitive: IPrimitive;
  functionName: string;
}

function FunctionDetails({ primitive, functionName }: FunctionDetailsProps) {
  if (!primitive.functions) {
    return null;
  }
  
  const func = primitive.functions.find(f => f.name === functionName);
  
  if (!func) {
    return null;
  }
  
  // Parse parameters safely
  const getParams = () => {
    if (!func.parameters || !Array.isArray(func.parameters)) {
      return [];
    }
    
    return func.parameters.map(param => {
      if (typeof param === 'string') {
        return param;
      }
      // Handle MongoDB object with _id
      if (typeof param === 'object' && param !== null) {
        // Try to convert to string representation
        return JSON.stringify(param).replace(/[{}"]/g, '').replace(/_id:[^,]+,?/, '');
      }
      return String(param);
    });
  };
  
  const params = getParams();
  
  return (
    <Card className="mt-4">
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium">{func.name}</CardTitle>
        <CardDescription className="text-xs">{func.description}</CardDescription>
      </CardHeader>
      <CardContent className="py-3">
        {params.length > 0 ? (
          <div className="space-y-2">
            <Label className="text-xs">Parameters</Label>
            <div className="text-xs space-y-1">
              {params.map((param, index) => (
                <div key={index} className="flex justify-between">
                  <span className="font-mono">{param}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">No parameters</div>
        )}
        
        <div className="mt-2 pt-2 border-t">
          <Label className="text-xs">Return Type</Label>
          <div className="text-xs font-mono">{func.returnType}</div>
        </div>
      </CardContent>
    </Card>
  );
} 