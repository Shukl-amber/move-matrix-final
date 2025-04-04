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
    const result = await createComposition(compositionData);
    revalidatePath('/compositions');
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error creating composition:', error);
    return { success: false, error: error.message };
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
    // Fetch all required primitives
    const primitivePromises = composition.primitiveIds.map(async (primitiveId) => {
      return await getPrimitiveById(primitiveId);
    });
    
    const primitives = await Promise.all(primitivePromises);
    const validPrimitives = primitives.filter((p): p is IPrimitive => p !== null);
    
    // Generate code using the template
    const generatedCode = generateCompositionCode(composition, validPrimitives);
    
    // Update composition with generated code
    const result = await updateCompositionDeploymentStatus(id, 'compiled', undefined, generatedCode);
    
    if (!result) {
      return { success: false, error: 'Composition not found' };
    }
    
    revalidatePath(`/compositions/${id}`);
    return { success: true, data: { code: generatedCode, composition: result } };
  } catch (error: any) {
    console.error('Error generating Move code:', error);
    return { success: false, error: error.message };
  }
}

// Deploy a composition to the blockchain
export async function deployComposition(id: string, userAddress: string) {
  try {
    // In a real implementation, this would:
    // 1. Get the generated code
    // 2. Compile it using the Move compiler
    // 3. Deploy it to the blockchain using the Aptos SDK
    // 4. Update the composition status with the transaction hash
    
    // For now, we'll simulate a successful deployment
    const mockTxHash = `0x${Math.random().toString(16).substring(2, 14)}`;
    
    // Update composition with deployed status
    const result = await updateCompositionDeploymentStatus(id, 'deployed', mockTxHash);
    
    if (!result) {
      return { success: false, error: 'Composition not found' };
    }
    
    revalidatePath(`/compositions/${id}`);
    return { 
      success: true, 
      data: { 
        composition: result,
        txHash: mockTxHash
      } 
    };
  } catch (error: any) {
    console.error('Error deploying composition:', error);
    return { success: false, error: error.message };
  }
}

// Helper function to generate code from primitives and connections
function generateCompositionCode(composition: IComposition, primitives: IPrimitive[]): string {
  const moduleName = composition.name.toLowerCase().replace(/\s+/g, '_');
  
  // Build imports section
  const imports = primitives.map(primitive => 
    `use ${primitive.moduleAddress || '0x1'}::${primitive.moduleName || primitive.name.toLowerCase().replace(/\s+/g, '_')};`
  ).join('\n    ');
  
  // Build connection functions
  const connectionFunctions = generateConnectionFunctions(composition.connections, primitives);
  
  return `module defi_matrix::${moduleName} {
    use std::signer;
    ${imports}
    
    /// Data structure for tracking the composition state
    struct CompositionData has key {
        owner: address,
        active: bool,
        // Add additional state tracking as needed
    }
    
    /// Initialize the composition for a user
    public fun initialize(user: &signer) {
        let user_addr = signer::address_of(user);
        
        // Initialize composition data
        let composition_data = CompositionData {
            owner: user_addr,
            active: true,
        };
        
        move_to(user, composition_data);
    }
    
${connectionFunctions}
    
    /// Execute the full composition workflow
    public fun execute(user: &signer) {
        // Execute the composition steps in sequence
        // Add your composition-specific logic here
    }
}`;
}

// Helper function to generate functions for connections
function generateConnectionFunctions(connections: IConnection[], primitives: IPrimitive[]): string {
  return connections.map((connection, index) => {
    const sourcePrimitive = primitives.find(p => p.id === connection.sourceId);
    const targetPrimitive = primitives.find(p => p.id === connection.targetId);
    
    if (!sourcePrimitive || !targetPrimitive) return '';
    
    const sourceFunction = sourcePrimitive.functions.find(f => f.name === connection.sourceFunction);
    const targetFunction = targetPrimitive.functions.find(f => f.name === connection.targetFunction);
    
    if (!sourceFunction || !targetFunction) return '';
    
    const funcName = `execute_connection_${index + 1}`;
    
    return `    /// Connection from ${sourcePrimitive.name}.${sourceFunction.name} to ${targetPrimitive.name}.${targetFunction.name}
    public fun ${funcName}(user: &signer) {
        // Execute source function
        let source_result = ${sourcePrimitive.moduleName || sourcePrimitive.name.toLowerCase().replace(/\s+/g, '_')}::${sourceFunction.name}(/* parameters */);
        
        // Execute target function with results from source
        ${targetPrimitive.moduleName || targetPrimitive.name.toLowerCase().replace(/\s+/g, '_')}::${targetFunction.name}(/* parameters using source_result */);
    }`;
  }).join('\n\n');
}

// Generate connection function
function generateConnectionFunction(connection: IConnection, primitives: IPrimitive[]): string {
  const sourcePrimitive = primitives.find(p => p.id === connection.sourceId);
  const targetPrimitive = primitives.find(p => p.id === connection.targetId);
  
  if (!sourcePrimitive || !targetPrimitive) {
    throw new Error(`Primitive not found for connection: ${connection.sourceId} -> ${connection.targetId}`);
  }
  
  const sourceFunction = sourcePrimitive.functions.find(f => f.name === connection.sourceFunction);
  const targetFunction = targetPrimitive.functions.find(f => f.name === connection.targetFunction);
  
  if (!sourceFunction || !targetFunction) {
    throw new Error(`Function not found for connection: ${connection.sourceFunction} -> ${connection.targetFunction}`);
  }
  
  const sourceModuleName = sourcePrimitive.moduleName || sourcePrimitive.name.toLowerCase().replace(/\s+/g, '_');
  const targetModuleName = targetPrimitive.moduleName || targetPrimitive.name.toLowerCase().replace(/\s+/g, '_');
  
  const funcName = `execute_${sourceFunction.name}_to_${targetFunction.name}`;
  
  return `
    public fun ${funcName}(user: &signer) {
        // Execute source function
        let source_result = ${sourceModuleName}::${sourceFunction.name}(/* parameters */);
        
        // Execute target function with results from source
        ${targetModuleName}::${targetFunction.name}(/* parameters using source_result */);
    }`;
} 