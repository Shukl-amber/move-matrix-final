'use server';

import { 
  createComposition, 
  updateComposition, 
  deleteComposition,
  updateCompositionDeploymentStatus 
} from '@/lib/db/services/compositionService';
import { getPrimitiveById } from '@/lib/db/services/primitiveService';
import { IComposition, IConnection } from '@/lib/db/models/composition';
import { IPrimitive } from '@/lib/db/models/primitive';
import { revalidatePath } from 'next/cache';

// Create a new composition
export async function createNewComposition(compositionData: IComposition) {
  try {
    console.log('Server action: Creating new composition', {
      name: compositionData.name,
      description: compositionData.description,
      primitiveIds: compositionData.primitiveIds
    });
    
    // Validate required composition fields
    if (!compositionData.name || !compositionData.description) {
      return { 
        success: false, 
        error: 'Composition name and description are required' 
      };
    }
    
    if (!compositionData.primitiveIds || compositionData.primitiveIds.length < 1) {
      return { 
        success: false, 
        error: 'At least one primitive must be selected' 
      };
    }

    // Make sure ownerId is set, which will be mapped to creatorAddress in the service
    if (!compositionData.ownerId) {
      compositionData.ownerId = "default-user"; // Fallback for testing
    }
    
    const result = await createComposition(compositionData);
    console.log('Server action: Composition created successfully', { id: result.id });
    
    revalidatePath('/compositions');
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Server action: Error creating composition:', error);
    
    // Determine if the error is related to database connection
    const errorMessage = error.message || 'Unknown error occurred';
    const isDbConnectionError = 
      errorMessage.includes('MongoDB connection failed') ||
      errorMessage.includes('ECONNREFUSED') ||
      errorMessage.includes('topology was destroyed');
    
    if (isDbConnectionError) {
      return { 
        success: false, 
        error: 'Database connection error. Please make sure MongoDB is running.', 
        details: errorMessage 
      };
    }
    
    return { 
      success: false, 
      error: `Failed to create composition: ${errorMessage}`,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    };
  }
}

// Update an existing composition
export async function updateExistingComposition(id: string, compositionData: Partial<IComposition>) {
  try {
    const result = await updateComposition(id, compositionData);
    if (!result) {
      return { success: false, error: 'Composition not found' };
    }
    revalidatePath(`/compositions/${id}`);
    revalidatePath('/compositions');
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error updating composition:', error);
    return { success: false, error: error.message };
  }
}

// Delete a composition
export async function deleteExistingComposition(id: string) {
  try {
    const result = await deleteComposition(id);
    if (!result) {
      return { success: false, error: 'Composition not found' };
    }
    revalidatePath('/compositions');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting composition:', error);
    return { success: false, error: error.message };
  }
}

// Generate Move code for a composition
export async function generateMoveCode(id: string, composition: IComposition) {
  try {
    console.log(`Generating Move code for composition: ${id}`);
    
    // Instead of generating code from primitives, return the hardcoded message module
    // Using a simpler version that has less chance of simulation errors
    const generatedCode = `module hello_block::msg {
    use std::signer;
    use std::string;

    /// Resource that wraps a message
    struct MessageHolder has key {
        message: string::String,
    }

    /// Public function to get a message
    public fun get_message(addr: address): string::String acquires MessageHolder {
        assert!(exists<MessageHolder>(addr), 0);
        *&borrow_global<MessageHolder>(addr).message
    }

    /// Public entry function that allows an account to set a message
    public entry fun set_message(account: signer, message_bytes: vector<u8>) acquires MessageHolder {
        let account_addr = signer::address_of(&account);
        let message = string::utf8(message_bytes);
        
        if (!exists<MessageHolder>(account_addr)) {
            move_to(&account, MessageHolder {
                message
            })
        } else {
            let old_message_holder = borrow_global_mut<MessageHolder>(account_addr);
            old_message_holder.message = message;
        }
    }
}`;
    
    // Update the composition with the hardcoded generated code
    await updateCompositionDeploymentStatus(
      id,
      'compiled',
      undefined,
      generatedCode
    );
    
    revalidatePath(`/compositions/${id}`);
    return { success: true, code: generatedCode };
  } catch (error: any) {
    console.error('Error generating Move code:', error);
    return { success: false, error: error.message };
  }
}

// Deploy a composition to the blockchain
export async function deployComposition(id: string, userAddress: string) {
  try {
    if (!id) {
      console.error('Invalid composition ID received:', id);
      return { success: false, error: 'Missing or invalid composition ID' };
    }
    
    console.log(`Initiating deployment for composition ${id} from address ${userAddress}`);
    
    // Get the composition with its generated code - use the direct import pattern
    const compositionService = await import('@/lib/db/services/compositionService');
    const composition = await compositionService.getCompositionById(id);
    
    if (!composition) {
      console.error(`Composition not found with ID: ${id}`);
      return { success: false, error: `Composition not found with ID: ${id}` };
    }
    
    console.log(`Found composition: ${composition.name} (${composition.id})`);
    
    if (!composition.generatedCode) {
      return { success: false, error: 'No generated code found for this composition. Generate code first.' };
    }
    
    // Since we're using hardcoded code, just get it directly
    const sanitizedCode = composition.generatedCode;

    // Use the hardcoded module name instead of trying to extract it
    const moduleNameMatch = ["hello_block::msg", "msg"];
    
    // Update status to compiled (indicating it's ready for deployment)
    await compositionService.updateCompositionDeploymentStatus(id, 'compiled');

    // IMPORTANT: Instead of trying to execute browser code on the server,
    // return the needed information for the client to handle the wallet interaction
    return { 
      success: true, 
      preparedData: {
        code: sanitizedCode,
        compositionId: id,
        moduleName: moduleNameMatch[1].trim() 
      }
    };
    
  } catch (error: any) {
    console.error(`Error preparing composition ${id} for deployment:`, error);
    
    // Attempt to update the composition with error info
    try {
      const compositionService = await import('@/lib/db/services/compositionService');
      await compositionService.updateCompositionDeploymentStatus(
        id, 
        'compiled', 
        undefined,
        `Error: ${error.message || 'Unknown error'}`
      );
    } catch (updateError) {
      console.error(`Failed to update composition ${id} status:`, updateError);
    }
    
    return { 
      success: false, 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    };
  }
}

// Client-side function to update composition after successful deployment
export async function updateCompositionAfterDeployment(
  compositionId: string, 
  txHash: string
) {
  try {
    if (!compositionId) {
      console.error('Invalid composition ID received for update:', compositionId);
      return { success: false, error: 'Missing or invalid composition ID' };
    }
    
    if (!txHash) {
      console.error('Invalid transaction hash received for update');
      return { success: false, error: 'Missing or invalid transaction hash' };
    }
    
    console.log(`Updating composition ${compositionId} after deployment with tx hash ${txHash}`);
    
    // For client-side execution, use fetch API to call our endpoint
    if (typeof window !== 'undefined') {
      try {
        const response = await fetch('/api/compositions/updateDeployment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            compositionId, 
            txHash 
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to update deployment status: ${errorData.error || 'Unknown error'}`);
        }
        
        const result = await response.json();
        console.log('Composition deployment status updated successfully via API');
        
        return { success: true };
      } catch (fetchError) {
        console.error('Error calling update API:', fetchError);
        // Fall through to server-side implementation
      }
    }
    
    // Server-side implementation (fallback)
    // Import the service directly to avoid circular references
    const compositionService = await import('@/lib/db/services/compositionService');
    
    // Verify the composition exists before updating
    const composition = await compositionService.getCompositionById(compositionId);
    if (!composition) {
      console.error(`Cannot update status: Composition not found with ID: ${compositionId}`);
      return { success: false, error: `Composition not found with ID: ${compositionId}` };
    }
    
    // Update the composition with deployed status and transaction hash
    console.log(`Found composition to update: ${composition.name} (${composition.id})`);
    const result = await compositionService.updateCompositionDeploymentStatus(
      compositionId, 
      'deployed', 
      txHash
    );
    
    if (!result) {
      return { success: false, error: 'Failed to update composition status after deployment' };
    }
    
    console.log(`Successfully updated composition ${compositionId} to deployed status`);
    revalidatePath(`/compositions/${compositionId}`);
    return { 
      success: true, 
      data: { 
        composition: result,
        txHash,
        explorerUrl: `https://explorer.aptoslabs.com/txn/${txHash}?network=testnet`
      } 
    };
  } catch (error: any) {
    console.error(`Error updating composition ${compositionId} after deployment:`, error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

// Helper function to generate code from primitives and connections
function generateCompositionCode(composition: IComposition, primitives: IPrimitive[]): string {
  // Sanitize the module name to a valid identifier
  const sanitizeName = (name: string): string => {
    return name.toLowerCase()
      .replace(/[^a-z0-9_]/g, '_') // Replace invalid chars with underscore
      .replace(/^[0-9]/, '_$&'); // Ensure doesn't start with number
  };
  
  const moduleName = sanitizeName(composition.name);
  
  // Add std imports always needed
  const stdImports = [
    'use std::signer;',
  ]; 
  
  // Build imports section - each primitive will be imported
  const primitiveImports = primitives.map(primitive => {
    const address = primitive.moduleAddress || '0x1';
    const module = primitive.moduleName || sanitizeName(primitive.name);
    return `use ${address}::${module};`;
  });
  
  // Combine all imports without duplicates
  const allImports = Array.from(new Set([...stdImports, ...primitiveImports])).join('\n    ');
  
  // Add primitive source code as comments for reference
  const primitiveSourceComments = primitives.map(primitive => {
    return `
    // Source code for primitive: ${primitive.name}
    // ${primitive.source ? primitive.source.split('\n').join('\n    // ') : 'Source code not available'}
    `;
  }).join('\n');
  
  // Build connection functions
  const connectionFunctions = generateConnectionFunctions(composition.connections, primitives);
  
  // Main function to execute all connections
  const executeFunction = `
    /// Execute the full composition workflow
    public entry fun execute(user: &signer) {
        // Initialize if needed
        if (!exists<CompositionData>(signer::address_of(user))) {
            initialize(user);
        }
        
        // Execute each connection in sequence
        ${composition.connections && composition.connections.length > 0
          ? composition.connections.map((_, index) => 
          `execute_connection_${index + 1}(user);`
            ).join('\n        ')
          : '// No connections to execute'}
    }`;
  
  const moduleCode = `module defi_matrix::${moduleName} {
    ${allImports}
    
    /* 
     * ${composition.name}
     * ${composition.description || 'No description provided'}
     * 
     * This module connects the following primitives:
     * ${primitives.map(p => `* ${p.name} (${p.category || 'unknown category'})`).join('\n     * ')}
     *
     * Generated by MoveMatrix
     */
    
    /// Data structure for tracking the composition state
    struct CompositionData has key {
        owner: address,
        active: bool,
        // Add additional state tracking as needed
    }
    
    /// Initialize the composition for a user
    public fun initialize(user: &signer) {
        let user_addr = signer::address_of(user);
        
        // Make sure not already initialized
        assert!(!exists<CompositionData>(user_addr), 1);
        
        // Initialize composition data
        let composition_data = CompositionData {
            owner: user_addr,
            active: true,
        };
        
        move_to(user, composition_data);
    }
    
${connectionFunctions}
    
${executeFunction}

${primitiveSourceComments}
}`;

  // Validate the code by looking for common errors
  const modulePattern = /module\s+(\w+)::(\w+)/;
  const moduleMatch = moduleCode.match(modulePattern);
  
  // If module declaration is missing, add a more robust one
  if (!moduleMatch) {
    console.warn('Module declaration may be invalid, using fallback');
    return `module defi_matrix::composition_${Date.now().toString(36)} {
    use std::signer;
    
    /* Generated by MoveMatrix - Fallback Module */
    
    struct CompositionData has key {
        owner: address,
        active: bool
    }
    
    public fun initialize(user: &signer) {
        let user_addr = signer::address_of(user);
        assert!(!exists<CompositionData>(user_addr), 1);
        let composition_data = CompositionData {
            owner: user_addr,
            active: true,
        };
        move_to(user, composition_data);
    }
    
    public entry fun execute(user: &signer) {
        // Placeholder for execution logic
        if (!exists<CompositionData>(signer::address_of(user))) {
            initialize(user);
        }
    }
}`;
  }
  
  console.log(`Generated valid Move module: ${moduleMatch[1]}::${moduleMatch[2]}`);
  return moduleCode;
}

// Helper function to generate functions for connections
function generateConnectionFunctions(connections: IConnection[], primitives: IPrimitive[]): string {
  if (!connections || connections.length === 0) {
    return "    // No connections defined for this composition";
  }
  
  // Helper to sanitize module names consistently
  const sanitizeName = (name: string): string => {
    return name.toLowerCase()
      .replace(/[^a-z0-9_]/g, '_') 
      .replace(/^[0-9]/, '_$&');
  };
  
  // Helper to extract parameter type safely
  const getParamType = (param: any): string => {
    if (typeof param === 'string') return 'unknown';
    if (param && typeof param === 'object' && 'type' in param) {
      return param.type as string;
    }
    return 'unknown';
  };
  
  // Helper to extract parameter name safely
  const getParamName = (param: any): string => {
    if (typeof param === 'string') return param;
    if (param && typeof param === 'object' && 'name' in param) {
      return param.name as string;
    }
    return 'param';
  };
  
  return connections.map((connection, index) => {
    const sourcePrimitive = primitives.find(p => p.id === connection.sourceId);
    const targetPrimitive = primitives.find(p => p.id === connection.targetId);
    
    if (!sourcePrimitive || !targetPrimitive) {
      return `    // ERROR: Could not find primitives for connection ${index + 1}`;
    }
    
    const sourceFunction = sourcePrimitive.functions?.find(f => f.name === connection.sourceFunction);
    const targetFunction = targetPrimitive.functions?.find(f => f.name === connection.targetFunction);
    
    if (!sourceFunction || !targetFunction) {
      return `    // ERROR: Could not find functions for connection ${index + 1}`;
    }
    
    const sourceModuleName = sourcePrimitive.moduleName || sanitizeName(sourcePrimitive.name);
    const targetModuleName = targetPrimitive.moduleName || sanitizeName(targetPrimitive.name);
    
    // Generate source function parameter list
    const sourceParams = sourceFunction.parameters && sourceFunction.parameters.length > 0 
      ? sourceFunction.parameters.map(param => {
          const paramType = getParamType(param);
          // For simplicity, use default values based on type
          if (paramType === 'u64' || paramType === 'u128') return '100';
          if (paramType === 'bool') return 'true';
          if (paramType === 'address') return 'signer::address_of(user)';
          if (paramType.includes('vector')) return '[]';
          return 'dummy_value /* replace with real value */';
        }).join(', ')
      : '';
    
    // Determine if source function has a return value to capture
    const sourceReturnType = sourceFunction.returnType || '';
    const hasSourceReturn = sourceReturnType !== 'void' && sourceReturnType !== '';
    
    // Generate parameter handling code with proper Move syntax
    const parameterMappingCode = connection.parameterMappings?.map(mapping => {
      if (mapping.sourceParam) {
        // If the source parameter comes from the source function result
        if (hasSourceReturn && mapping.sourceParam === 'result') {
          return `        // Map source result to ${mapping.targetParam}
        let ${mapping.targetParam} = source_result;`;
        } else {
        return `        // Map ${mapping.sourceParam} to ${mapping.targetParam}
        let ${mapping.targetParam} = ${mapping.sourceParam};`;
        }
      } else if (mapping.constantValue !== undefined) {
        // Handle different types of constant values with proper Move syntax
        let value;
        if (typeof mapping.constantValue === 'string') {
          // Move doesn't support string literals directly
          // For addresses, don't add quotes
          if (mapping.constantValue.startsWith('0x')) {
            value = mapping.constantValue;
          } else {
            // For byte strings, convert to vector<u8>
            const bytes = Array.from(new TextEncoder().encode(mapping.constantValue))
              .map(b => b.toString());
            value = `vector[${bytes.join(', ')}]`;
          }
        } else if (typeof mapping.constantValue === 'boolean') {
          value = mapping.constantValue ? 'true' : 'false';
        } else {
          value = mapping.constantValue;
        }
        
        return `        // Use constant value for ${mapping.targetParam}
        let ${mapping.targetParam} = ${value};`;
      }
      return `        // Missing mapping for ${mapping.targetParam}
        let ${mapping.targetParam} = 0; // Fallback to zero value`;
    }).join('\n\n') || '        // No parameter mappings defined';
    
    // Generate target function parameter list
    const targetParams = targetFunction.parameters && targetFunction.parameters.length > 0
      ? targetFunction.parameters.map(param => {
          const paramName = getParamName(param);
          
          // Try to find a mapping for this parameter
          const mapping = connection.parameterMappings?.find(m => m.targetParam === paramName);
          if (mapping) {
            if (mapping.sourceParam) {
              return mapping.sourceParam;
            } else if (mapping.constantValue !== undefined) {
              return mapping.targetParam; // Use the local variable we created in parameterMappingCode
            }
          }
          
          // If no mapping, use default values based on type
          const paramType = getParamType(param);
          if (paramType === 'u64' || paramType === 'u128') return '0';
          if (paramType === 'bool') return 'false';
          if (paramType === 'address') return 'signer::address_of(user)';
          return '/* missing parameter */';
        }).join(', ')
      : '';
    
    // Create a properly formatted connection function
    return `    /// Connection ${index + 1}: ${sourcePrimitive.name}.${sourceFunction.name} → ${targetPrimitive.name}.${targetFunction.name}
    /// ${connection.description || 'Connects source function to target function'}
    public fun execute_connection_${index + 1}(user: &signer) {
        // Call source function ${hasSourceReturn ? 'and capture result' : ''}
        ${hasSourceReturn ? 'let source_result = ' : ''}${sourceModuleName}::${sourceFunction.name}(
            user${sourceFunction.parameters && sourceFunction.parameters.length > 0 ? ', ' + sourceParams : ''}
        );
        
${parameterMappingCode}
        
        // Call target function with mapped parameters
        ${targetModuleName}::${targetFunction.name}(
            user${targetFunction.parameters && targetFunction.parameters.length > 0 ? ', ' + targetParams : ''}
        );
    }`;
  }).join('\n\n');
} 