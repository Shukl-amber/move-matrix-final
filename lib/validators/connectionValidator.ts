import { IPrimitive, IFunction } from '../db/models/primitive';

// Define types for connection validation
export interface IConnection {
  sourceId: string;
  targetId: string;
  sourceFunctionId: string;
  targetFunctionId: string;
}

export interface IValidationError {
  type: 'TYPE_MISMATCH' | 'INCOMPATIBLE_PROTOCOLS' | 'SECURITY_ISSUE' | 'CIRCULAR_DEPENDENCY';
  sourceId: string;
  targetId: string;
  message: string;
  suggestion?: string;
}

export interface IValidationResult {
  isValid: boolean;
  errors: IValidationError[];
  warnings: IValidationError[];
}

// Function to validate a single connection between two primitives
export function validateConnection(
  connection: IConnection,
  primitives: Record<string, IPrimitive>
): IValidationError[] {
  const errors: IValidationError[] = [];
  
  // Get the source and target primitives
  const sourcePrimitive = primitives[connection.sourceId];
  const targetPrimitive = primitives[connection.targetId];
  
  if (!sourcePrimitive || !targetPrimitive) {
    errors.push({
      type: 'INCOMPATIBLE_PROTOCOLS',
      sourceId: connection.sourceId,
      targetId: connection.targetId,
      message: 'One or both primitives in the connection do not exist',
    });
    return errors;
  }
  
  // Find the relevant functions
  const sourceFunction = sourcePrimitive.functions?.find(f => f.name === connection.sourceFunctionId);
  const targetFunction = targetPrimitive.functions?.find(f => f.name === connection.targetFunctionId);
  
  if (!sourceFunction || !targetFunction) {
    errors.push({
      type: 'INCOMPATIBLE_PROTOCOLS',
      sourceId: connection.sourceId,
      targetId: connection.targetId,
      message: 'One or both functions in the connection do not exist',
    });
    return errors;
  }
  
  // Validate type compatibility between output of source and input of target
  if (sourceFunction.returnType !== targetFunction.parameters[0]) {
    errors.push({
      type: 'TYPE_MISMATCH',
      sourceId: connection.sourceId,
      targetId: connection.targetId,
      message: `Type mismatch: ${sourceFunction.name} returns ${sourceFunction.returnType} but ${targetFunction.name} expects ${targetFunction.parameters[0]}`,
      suggestion: `Consider adding an adapter or finding a compatible function that accepts ${sourceFunction.returnType}`,
    });
  }
  
  // Check for protocol compatibility
  if (!areProtocolsCompatible(sourcePrimitive, targetPrimitive)) {
    errors.push({
      type: 'INCOMPATIBLE_PROTOCOLS',
      sourceId: connection.sourceId,
      targetId: connection.targetId,
      message: `Protocols may not be compatible: ${sourcePrimitive.name} and ${targetPrimitive.name} may not work together`,
      suggestion: 'Check documentation for these primitives to ensure they can be connected directly',
    });
  }
  
  // Check for security issues in the connection
  const securityIssues = checkSecurityIssues(sourcePrimitive, targetPrimitive, sourceFunction, targetFunction);
  if (securityIssues.length > 0) {
    errors.push(...securityIssues);
  }
  
  return errors;
}

// Validate all connections in a composition
export function validateComposition(
  connections: IConnection[],
  primitives: Record<string, IPrimitive>
): IValidationResult {
  const errors: IValidationError[] = [];
  const warnings: IValidationError[] = [];
  
  // Validate each connection
  connections.forEach(connection => {
    const connectionErrors = validateConnection(connection, primitives);
    errors.push(...connectionErrors);
  });
  
  // Check for circular dependencies
  const circularDependencies = detectCircularDependencies(connections);
  if (circularDependencies.length > 0) {
    circularDependencies.forEach(cycle => {
      errors.push({
        type: 'CIRCULAR_DEPENDENCY',
        sourceId: cycle[0],
        targetId: cycle[cycle.length - 1],
        message: `Circular dependency detected: ${cycle.join(' -> ')}`,
        suggestion: 'Break the circular dependency by restructuring your composition',
      });
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Helper function to check if two protocols are compatible
function areProtocolsCompatible(
  sourcePrimitive: IPrimitive,
  targetPrimitive: IPrimitive
): boolean {
  // Implement logic to check protocol compatibility
  // This is a simplified implementation
  
  // Example: Check if the categories are compatible
  const compatibleCategories: Record<string, string[]> = {
    'lending': ['swap', 'staking', 'options'],
    'swap': ['lending', 'staking', 'options'],
    'staking': ['lending', 'swap'],
    'options': ['lending', 'swap'],
    'custom': ['lending', 'swap', 'staking', 'options', 'custom'],
  };
  
  const sourceCategory = sourcePrimitive.category;
  const targetCategory = targetPrimitive.category;
  
  if (!sourceCategory || !targetCategory) {
    return false;
  }
  
  const compatibleWithSource = compatibleCategories[sourceCategory] || [];
  return compatibleWithSource.includes(targetCategory);
}

// Helper function to check for security issues in a connection
function checkSecurityIssues(
  sourcePrimitive: IPrimitive,
  targetPrimitive: IPrimitive,
  sourceFunction: IFunction,
  targetFunction: IFunction
): IValidationError[] {
  const issues: IValidationError[] = [];
  
  // Example: Check for known security patterns
  // This is a simplified implementation
  
  // Example: Check if a lending function is connected directly to a high-risk operation
  if (
    sourcePrimitive.category === 'lending' && 
    sourceFunction.name.includes('borrow') &&
    targetPrimitive.category === 'options'
  ) {
    issues.push({
      type: 'SECURITY_ISSUE',
      sourceId: sourcePrimitive.id!,
      targetId: targetPrimitive.id!,
      message: 'Connecting lending directly to options can pose liquidation risks',
      suggestion: 'Consider adding risk management primitives between lending and options',
    });
  }
  
  return issues;
}

// Helper function to detect circular dependencies in connections
function detectCircularDependencies(connections: IConnection[]): string[][] {
  // Build an adjacency list representation of the graph
  const graph: Record<string, string[]> = {};
  
  connections.forEach(connection => {
    if (!graph[connection.sourceId]) {
      graph[connection.sourceId] = [];
    }
    graph[connection.sourceId].push(connection.targetId);
  });
  
  // Track visited nodes and recursion stack
  const visited: Record<string, boolean> = {};
  const recursionStack: Record<string, boolean> = {};
  const cycles: string[][] = [];
  
  // DFS to detect cycles
  function dfs(node: string, path: string[] = []): void {
    // Mark current node as visited and add to recursion stack
    visited[node] = true;
    recursionStack[node] = true;
    path.push(node);
    
    // Visit all the vertices adjacent to this vertex
    const neighbors = graph[node] || [];
    for (const neighbor of neighbors) {
      // If not visited, recur
      if (!visited[neighbor]) {
        dfs(neighbor, [...path]);
      } 
      // If visited and in recursion stack, there's a cycle
      else if (recursionStack[neighbor]) {
        // Find where the cycle starts
        const cycleStart = path.indexOf(neighbor);
        if (cycleStart !== -1) {
          cycles.push(path.slice(cycleStart).concat(neighbor));
        }
      }
    }
    
    // Remove vertex from recursion stack
    recursionStack[node] = false;
  }
  
  // Call DFS for each unvisited node
  Object.keys(graph).forEach(node => {
    if (!visited[node]) {
      dfs(node);
    }
  });
  
  return cycles;
} 