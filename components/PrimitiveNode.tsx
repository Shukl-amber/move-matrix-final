'use client';

import React from 'react';
import { Handle, Position } from 'reactflow';
import { Primitive } from '@/lib/types';

interface PrimitiveNodeProps {
  data: {
    primitive: Primitive;
    onSelect: (primitive: Primitive) => void;
    debug?: boolean;
  };
}

export default function PrimitiveNode({ data }: PrimitiveNodeProps) {
  const { primitive, onSelect, debug } = data;

  return (
    <div 
      className="px-4 py-2 shadow-lg rounded-lg border bg-black-200/50 backdrop-blur-md border-white/10"
      onClick={() => onSelect(primitive)}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-blue-500"
        data-tooltip-id={`input-${primitive.id}`}
        data-tooltip-content="Input Port"
      />

      {/* Node Content */}
      <div className="flex flex-col gap-1">
        <div className="text-sm font-medium text-white">{primitive.name}</div>
        <div className="text-xs text-white/70">{primitive.type}</div>
        
        {debug && (
          <div className="mt-2 text-xs text-white/50 border-t border-white/10 pt-1">
            <div>ID: {primitive.id}</div>
            <div>Pos: {primitive.position.x}, {primitive.position.y}</div>
          </div>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-green-500"
        data-tooltip-id={`output-${primitive.id}`}
        data-tooltip-content="Output Port"
      />
    </div>
  );
} 