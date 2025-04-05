import { IPrimitive } from '../db/models/primitive';
import { IConnection } from '../validators/connectionValidator';

export interface IComposition {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  primitives: string[]; // Array of primitive IDs
  connections: IConnection[];
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'validated' | 'deployed';
  deploymentAddress?: string;
}

export interface IGeneratedCode {
  moduleName: string;
  sourceCode: string;
  imports: string[];
  functions: IGeneratedFunction[];
  fullSourceCode: string;
}

export interface IGeneratedFunction {
  name: string;
  parameters: string[];
  returnType: string;
  body: string;
}

export interface IDeploymentResult {
  success: boolean;
  transactionHash?: string;
  deploymentAddress?: string;
  error?: string;
}

// Generate Move code from a composition
export async function generateMoveCode(
  composition: IComposition,
  primitives: Record<string, IPrimitive>
): Promise<IGeneratedCode> {
  try {
    // Create a sanitized module name
    const moduleName = composition.name
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_');
    
    // Track imports and functions
    const imports: string[] = [];
    let mainFunctionBody = '';
    
    // Create a dependency graph to determine execution order
    const graph = createDependencyGraph(composition.connections);
    const executionOrder = topologicalSort(graph);
    
    // Generate imports
    composition.primitives.forEach(primitiveId => {
      const primitive = primitives[primitiveId];
      if (primitive) {
        imports.push(`use ${primitive.moduleAddress}::${primitive.moduleName};`);
      }
    });
    
    // Generate the main function
    const usedPrimitives = new Set<string>();
    const parameters: string[] = [];
    
    // Add input parameters for the main function
    composition.connections.forEach(connection => {
      const sourcePrimitive = primitives[connection.sourceId];
      const sourceFunction = sourcePrimitive?.functions?.find(f => f.name === connection.sourceFunctionId);
      
      if (sourcePrimitive && sourceFunction) {
        // Add parameters if not already added
        sourceFunction.parameters.forEach(param => {
          if (!usedPrimitives.has(`${sourcePrimitive.id}-${param}`)) {
            usedPrimitives.add(`${sourcePrimitive.id}-${param}`);
            parameters.push(`${param}: ${getTypeFromParamName(param)}`);
          }
        });
      }
    });
    
    // Generate the function body based on execution order
    let variableCounter = 1;
    const variableMap: Record<string, string> = {};
    
    executionOrder.forEach(nodeId => {
      // Find connections where this primitive is the source
      const connections = composition.connections.filter(conn => conn.sourceId === nodeId);
      
      connections.forEach(connection => {
        const sourcePrimitive = primitives[connection.sourceId];
        const sourceFunction = sourcePrimitive?.functions?.find(f => f.name === connection.sourceFunctionId);
        
        if (sourcePrimitive && sourceFunction) {
          const functionParams = sourceFunction.parameters.map(
            param => variableMap[`${connection.sourceId}-${param}`] || param
          ).join(', ');
          
          const resultVar = `result_${variableCounter++}`;
          variableMap[`${connection.sourceId}-${sourceFunction.name}`] = resultVar;
          
          mainFunctionBody += `    // Execute ${sourcePrimitive.name} ${sourceFunction.name}\n`;
          mainFunctionBody += `    let ${resultVar} = ${sourcePrimitive.moduleName}::${sourceFunction.name}(${functionParams});\n\n`;
        }
      });
    });
    
    // Create the full source code
    const mainFunction = `
    public entry fun execute_strategy(
        ${parameters.join(',\n        ')}
    ) {
${mainFunctionBody}    }
`;
    
    let fullSourceCode = `module ${moduleName} {
    ${imports.join('\n    ')}
    
${mainFunction}
}`;

    // Try to refine the code using Gemini if available
    try {
      const { refineGeneratedCode } = await import('./geminiCodeRefiner');
      
      // Adapt the composition to match the database model interface
      const adaptedComposition = {
        ...composition,
        primitiveIds: Array.isArray(composition.primitives) 
          ? composition.primitives
          : Object.keys(primitives),
        // Add any other required properties
        _id: composition.id || 'temp_id',
        status: composition.status || 'draft',
        connections: composition.connections || []
      };
      
      fullSourceCode = await refineGeneratedCode(adaptedComposition, primitives, fullSourceCode);
    } catch (refinementError) {
      console.warn('Code refinement with Gemini failed, using standard generation:', refinementError);
      // Continue with the standard generated code
    }
    
    return {
      moduleName,
      sourceCode: mainFunction,
      imports,
      functions: [{
        name: 'execute_strategy',
        parameters: parameters.map(p => p.split(':')[0].trim()),
        returnType: 'void',
        body: mainFunctionBody,
      }],
      fullSourceCode,
    };
  } catch (error) {
    console.error('Error generating code:', error);
    throw new Error(`Failed to generate code: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Deploy a composition to the blockchain
export async function deployComposition(
  composition: IComposition,
  code: IGeneratedCode,
  networkType: 'testnet' | 'mainnet',
  senderAddress: string
): Promise<IDeploymentResult> {
  try {
    // This is a placeholder for actual deployment logic
    // In a real implementation, this would interact with a blockchain API or SDK
    
    // Simulate deployment delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock successful deployment
    return {
      success: true,
      transactionHash: `0x${Math.random().toString(16).substring(2)}`,
      deploymentAddress: `0x${Math.random().toString(16).substring(2)}`,
    };
    
    // Example of what a real implementation might look like:
    /*
    const provider = new Provider(networkType === 'testnet' 
      ? 'https://testnet.aptoslabs.com/v1' 
      : 'https://mainnet.aptoslabs.com/v1');
    
    const deploymentResult = await provider.publishModule(
      senderAddress,
      Buffer.from(code.fullSourceCode, 'utf8'),
      {
        gasUnitPrice: 100,
        maxGasAmount: 10000,
      }
    );
    
    return {
      success: true,
      transactionHash: deploymentResult.hash,
      deploymentAddress: `${senderAddress}::${code.moduleName}`,
    };
    */
  } catch (error) {
    console.error('Deployment failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Create a dependency graph from connections
function createDependencyGraph(connections: IConnection[]): Record<string, string[]> {
  const graph: Record<string, string[]> = {};
  
  connections.forEach(connection => {
    if (!graph[connection.sourceId]) {
      graph[connection.sourceId] = [];
    }
    if (!graph[connection.targetId]) {
      graph[connection.targetId] = [];
    }
    
    graph[connection.sourceId].push(connection.targetId);
  });
  
  return graph;
}

// Perform a topological sort of the dependency graph
function topologicalSort(graph: Record<string, string[]>): string[] {
  const visited: Record<string, boolean> = {};
  const temp: Record<string, boolean> = {};
  const order: string[] = [];
  
  function visit(node: string): void {
    if (temp[node]) {
      throw new Error(`Circular dependency detected at node ${node}`);
    }
    
    if (!visited[node]) {
      temp[node] = true;
      
      const neighbors = graph[node] || [];
      neighbors.forEach(neighbor => visit(neighbor));
      
      temp[node] = false;
      visited[node] = true;
      order.unshift(node); // Add to the beginning of the array
    }
  }
  
  Object.keys(graph).forEach(node => {
    if (!visited[node]) {
      visit(node);
    }
  });
  
  return order;
}

// Helper function to infer data type from parameter name
function getTypeFromParamName(paramName: string): string {
  if (paramName.includes('amount') || paramName.includes('qty') || paramName.includes('value')) {
    return 'u64';
  }
  
  if (paramName.includes('account') || paramName.includes('address')) {
    return 'address';
  }
  
  if (paramName.includes('enabled') || paramName.includes('active')) {
    return 'bool';
  }
  
  // Default type
  return 'u64';
} 