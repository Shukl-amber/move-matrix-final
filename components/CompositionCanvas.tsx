'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  Connection,
  Edge,
  Node,
  ConnectionLineType,
  Panel,
  addEdge,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Primitive, Position } from '@/lib/types';
import { CompositionEngine } from '@/lib/composition-engine';
import PrimitiveNode from './PrimitiveNode';

// Custom tooltip component
const CustomTooltip = ({ id, text }: { id: string, text: string }) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const targetElement = document.querySelector(`[data-tooltip-id="${id}"]`);
    
    if (!targetElement) return;
    
    const showTooltip = (e: Event) => {
      if (e.target) {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        setPosition({ x: rect.left + rect.width / 2, y: rect.top - 5 });
        setVisible(true);
      }
    };
    
    const hideTooltip = () => {
      setVisible(false);
    };
    
    targetElement.addEventListener('mouseenter', showTooltip);
    targetElement.addEventListener('mouseleave', hideTooltip);
    
    return () => {
      targetElement.removeEventListener('mouseenter', showTooltip);
      targetElement.removeEventListener('mouseleave', hideTooltip);
    };
  }, [id]);
  
  if (!visible) return null;
  
  return (
    <div 
      ref={ref}
      className="fixed z-50 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap transform -translate-x-1/2 -translate-y-full pointer-events-none"
      style={{ 
        left: position.x, 
        top: position.y, 
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.2s',
      }}
    >
      {text}
      <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full border-4 border-transparent border-t-gray-900" />
    </div>
  );
};

interface CompositionCanvasProps {
  compositionEngine: CompositionEngine;
  onSelectPrimitive: (primitive: Primitive | null) => void;
}

// Register custom node types
const nodeTypes = {
  primitiveNode: PrimitiveNode,
};

export default function CompositionCanvas({ compositionEngine, onSelectPrimitive }: CompositionCanvasProps) {
  // State for tracking tooltips
  const [activeTooltips, setActiveTooltips] = useState<{id: string, text: string}[]>([]);
  
  // Status message for connection feedback
  const [statusMessage, setStatusMessage] = useState<{text: string, type: 'success' | 'error' | 'info' | null}>({
    text: 'Drag between connection points to connect primitives',
    type: 'info'
  });
  
  // Debug mode toggle
  const [debugMode, setDebugMode] = useState(false);
  
  // Convert primitives to ReactFlow nodes
  const getPrimitivesAsNodes = useCallback((): Node[] => {
    return Object.values(compositionEngine.getComposition().primitives).map(primitive => ({
      id: primitive.id,
      type: 'primitiveNode',
      position: primitive.position,
      data: {
        primitive,
        onSelect: () => onSelectPrimitive(primitive),
        debug: debugMode
      },
      draggable: true,
      selectable: true,
    }));
  }, [compositionEngine, onSelectPrimitive, debugMode]);

  // Convert connections to ReactFlow edges
  const getConnectionsAsEdges = useCallback((): Edge[] => {
    return Object.values(compositionEngine.getComposition().connections).map(connection => ({
      id: connection.id,
      source: connection.sourcePortId.split('-')[0],
      target: connection.targetPortId.split('-')[0],
      sourceHandle: connection.sourcePortId,
      targetHandle: connection.targetPortId,
      type: 'default',
      animated: true,
      label: connection.resourceType,
      labelStyle: { fill: '#334155', fontWeight: 500 },
      labelBgStyle: { fill: 'white' },
      style: { 
        stroke: '#3b82f6', 
        strokeWidth: 2,
        strokeDasharray: '5, 5'
      },
    }));
  }, [compositionEngine]);

  const [nodes, setNodes, onNodesChange] = useNodesState(getPrimitivesAsNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(getConnectionsAsEdges());
  
  // Update nodes and edges when composition changes
  useEffect(() => {
    setNodes(getPrimitivesAsNodes());
    setEdges(getConnectionsAsEdges());
  }, [compositionEngine, getPrimitivesAsNodes, getConnectionsAsEdges, setNodes, setEdges]);
  
  // Update debug mode
  useEffect(() => {
    setNodes(getPrimitivesAsNodes());
  }, [debugMode, getPrimitivesAsNodes, setNodes]);
  
  // Handle connecting nodes
  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.sourceHandle && connection.targetHandle) {
        try {
          const newConnection = compositionEngine.addConnection(
            connection.sourceHandle,
            connection.targetHandle
          );
          
          if (newConnection) {
            const edge: Edge = {
              id: newConnection.id,
              source: connection.source || '',
              target: connection.target || '',
              sourceHandle: connection.sourceHandle,
              targetHandle: connection.targetHandle,
              type: 'default',
              animated: true,
              label: newConnection.resourceType,
              style: { stroke: '#22c55e', strokeWidth: 2 },
              labelStyle: { fill: '#1e40af', fontWeight: 500 },
              labelBgStyle: { fill: 'white' },
              data: { 
                createdAt: new Date(),
                tooltip: `${newConnection.resourceType} flowing from source to target`
              },
            };
            
            setEdges(addEdge(edge, edges));
            setStatusMessage({
              text: `Connected successfully! Resource type: ${newConnection.resourceType}`,
              type: 'success'
            });
            
            setTimeout(() => {
              setStatusMessage({
                text: 'Drag between connection points to connect primitives',
                type: 'info'
              });
            }, 3000);
          } else {
            const errorEdge: Edge = {
              id: `temp-${Date.now()}`,
              source: connection.source || '',
              target: connection.target || '',
              sourceHandle: connection.sourceHandle,
              targetHandle: connection.targetHandle,
              type: 'default',
              animated: true,
              style: { stroke: '#ef4444', strokeWidth: 3, opacity: 0.7 },
              data: { isTemporary: true }
            };
            
            setEdges([...edges, errorEdge]);
            
            setTimeout(() => {
              setEdges(edges => edges.filter(e => e.id !== errorEdge.id));
            }, 2000);
            
            setStatusMessage({
              text: 'Connection failed: Incompatible resource types',
              type: 'error'
            });
            
            setTimeout(() => {
              setStatusMessage({
                text: 'Drag between connection points to connect primitives',
                type: 'info'
              });
            }, 3000);
          }
        } catch (error) {
          setStatusMessage({
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            type: 'error'
          });
          
          setTimeout(() => {
            setStatusMessage({
              text: 'Drag between connection points to connect primitives',
              type: 'info'
            });
          }, 3000);
        }
      }
    },
    [compositionEngine, edges, setEdges]
  );
  
  // Handle node position changes
  const onNodeDragStop = useCallback(
    (event: React.MouseEvent, node: Node) => {
      try {
        compositionEngine.updatePrimitivePosition(node.id, node.position as Position);
      } catch (error) {
        console.error('Failed to update node position:', error);
      }
    },
    [compositionEngine]
  );
  
  // Handle node selection
  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      try {
        const primitive = compositionEngine.getComposition().primitives[node.id];
        if (primitive) {
          onSelectPrimitive(primitive);
        }
      } catch (error) {
        console.error('Failed to select node:', error);
      }
    },
    [compositionEngine, onSelectPrimitive]
  );
  
  // Handle removing an edge
  const onEdgeDelete = useCallback(
    (edge: Edge) => {
      try {
        compositionEngine.removeConnection(edge.id);
        setEdges(edges => edges.filter(e => e.id !== edge.id));
      } catch (error) {
        console.error('Failed to delete edge:', error);
      }
    },
    [compositionEngine, setEdges]
  );
  
  // Handle removing a node
  const onNodeDelete = useCallback(
    (node: Node) => {
      try {
        compositionEngine.removePrimitive(node.id);
        setNodes(nodes => nodes.filter(n => n.id !== node.id));
        onSelectPrimitive(null);
      } catch (error) {
        console.error('Failed to delete node:', error);
      }
    },
    [compositionEngine, onSelectPrimitive, setNodes]
  );
  
  // Handle keydown events for deletion
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        const selectedNodes = nodes.filter(node => node.selected);
        const selectedEdges = edges.filter(edge => edge.selected);
        
        selectedNodes.forEach(node => onNodeDelete(node));
        selectedEdges.forEach(edge => onEdgeDelete(edge));
      }
    },
    [nodes, edges, onNodeDelete, onEdgeDelete]
  );
  
  useEffect(() => {
    const tooltipElements = document.querySelectorAll('[data-tooltip-id]');
    const tooltips = Array.from(tooltipElements).map(el => ({
      id: el.getAttribute('data-tooltip-id') || '',
      text: el.getAttribute('data-tooltip-content') || '',
    }));
    setActiveTooltips(tooltips);
  }, [nodes, edges]);

  return (
    <ReactFlowProvider>
      <div className="w-full h-full bg-black-200/50 backdrop-blur-md rounded-lg" onKeyDown={onKeyDown} tabIndex={0}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={onNodeDragStop}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          connectionLineType={ConnectionLineType.Bezier}
          connectionLineStyle={{ stroke: '#3b82f6', strokeWidth: 3 }}
          deleteKeyCode="Delete"
          onEdgeDoubleClick={(event, edge) => onEdgeDelete(edge)}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.1}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          elementsSelectable={true}
          snapToGrid={true}
          snapGrid={[15, 15]}
        >
          <Background color="#ffffff10" gap={16} />
          <Controls className="bg-black-300 border-white/10" />
          
          <Panel position="top-right" className="bg-black-300 border border-white/10 p-2 rounded backdrop-blur-md">
            <button 
              onClick={() => {
                const validationResult = compositionEngine.validateComposition();
                alert(validationResult.valid 
                  ? 'Composition is valid!' 
                  : `Validation issues: ${validationResult.issues.map(i => i.message).join(', ')}`
                );
              }}
              className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded text-sm mr-2"
            >
              Validate
            </button>
            
            <button 
              onClick={() => {
                const code = compositionEngine.exportCode();
                alert('Code generated! Check console for details.');
              }}
              className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded text-sm"
            >
              Generate Code
            </button>
          </Panel>
          
          <Panel position="bottom-center" className={`p-2 rounded shadow-md transition-all backdrop-blur-md ${
            statusMessage.type === 'success' ? 'bg-green-500/20 text-green-500 border border-green-500/20' :
            statusMessage.type === 'error' ? 'bg-red-500/20 text-red-500 border border-red-500/20' :
            'bg-black-300 border-white/10 text-white/70'
          }`}>
            <div className="text-sm flex items-center">
              {statusMessage.text}
            </div>
          </Panel>
          
          <Panel position="top-center" className="bg-black-300 border border-white/10 p-2 rounded shadow-md mb-2 backdrop-blur-md">
            <div className="text-sm text-white/70">
              <span className="font-medium text-white">Connection Guide:</span> Connect primitive outputs (right) to inputs (left).
              <div className="flex items-center mt-1 text-xs">
                <span className="inline-flex items-center mr-3">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span> Output
                </span>
                <span className="inline-flex items-center mr-3">
                  <span className="w-3 h-3 bg-blue-500 rounded-full mr-1"></span> Input
                </span>
              </div>
            </div>
          </Panel>
        </ReactFlow>
        
        <div className="absolute top-2 left-2 z-10">
          <button
            onClick={() => setDebugMode(!debugMode)}
            className={`px-2 py-1 rounded text-xs font-medium ${
              debugMode ? 'bg-amber-500 text-white' : 'bg-black-300 border border-white/10 text-white/70'
            }`}
          >
            {debugMode ? 'Debug Mode: ON' : 'Debug Mode'}
          </button>
        </div>
        
        {activeTooltips.map(tooltip => (
          <CustomTooltip key={tooltip.id} id={tooltip.id} text={tooltip.text} />
        ))}
      </div>
    </ReactFlowProvider>
  );
} 