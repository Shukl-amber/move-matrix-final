import connectToDB from '../mongoose';
import { Primitive, IPrimitive } from '../models/primitive';

// Get all primitives
export async function getAllPrimitives(): Promise<IPrimitive[]> {
  try {
    console.log('Connecting to MongoDB for getAllPrimitives');
    await connectToDB();
    
    if (!Primitive) {
      console.error('Primitive model not initialized');
      return [];
    }
    
    console.log('Finding all primitives');
    const primitives = await (Primitive as any).find({})
      .sort({ createdAt: -1 });
    
    console.log(`Found ${primitives?.length || 0} primitives`);
    return JSON.parse(JSON.stringify(primitives || []));
  } catch (error) {
    console.error('Error in getAllPrimitives:', error);
    return []; // Return empty array instead of crashing
  }
}

// Get primitive by ID
export async function getPrimitiveById(id: string): Promise<IPrimitive | null> {
  try {
    await connectToDB();
    
    if (!Primitive) {
      console.error('Primitive model not initialized');
      return null;
    }
    
    const primitive = await (Primitive as any).findOne({ id: id });
    
    if (!primitive) return null;
    
    return JSON.parse(JSON.stringify(primitive));
  } catch (error) {
    console.error(`Error in getPrimitiveById for ID ${id}:`, error);
    return null;
  }
}

// Get primitives by category
export async function getPrimitivesByCategory(category: string): Promise<IPrimitive[]> {
  try {
    await connectToDB();
    
    if (!Primitive) {
      console.error('Primitive model not initialized');
      return [];
    }
    
    const primitives = await (Primitive as any).find({ category })
      .sort({ createdAt: -1 });
    
    return JSON.parse(JSON.stringify(primitives));
  } catch (error) {
    console.error(`Error in getPrimitivesByCategory for category ${category}:`, error);
    return [];
  }
}

// Create a new primitive
export async function createPrimitive(primitiveData: IPrimitive): Promise<IPrimitive> {
  try {
    await connectToDB();
    
    if (!Primitive) {
      console.error('Primitive model not initialized');
      throw new Error('Primitive model not initialized');
    }
    
    const newPrimitive = new (Primitive as any)(primitiveData);
    await newPrimitive.save();
    
    return JSON.parse(JSON.stringify(newPrimitive));
  } catch (error) {
    console.error('Error in createPrimitive:', error);
    throw error;
  }
}

// Update an existing primitive
export async function updatePrimitive(id: string, primitiveData: Partial<IPrimitive>): Promise<IPrimitive | null> {
  try {
    await connectToDB();
    
    if (!Primitive) {
      console.error('Primitive model not initialized');
      return null;
    }
    
    const updatedPrimitive = await (Primitive as any).findOneAndUpdate(
      { id: id },
      { ...primitiveData, updatedAt: new Date() },
      { new: true }
    );
    
    if (!updatedPrimitive) return null;
    
    return JSON.parse(JSON.stringify(updatedPrimitive));
  } catch (error) {
    console.error(`Error in updatePrimitive for ID ${id}:`, error);
    return null;
  }
}

// Delete a primitive
export async function deletePrimitive(id: string): Promise<boolean> {
  try {
    await connectToDB();
    
    if (!Primitive) {
      console.error('Primitive model not initialized');
      return false;
    }
    
    const result = await (Primitive as any).findOneAndDelete({ id: id });
    
    return !!result;
  } catch (error) {
    console.error(`Error in deletePrimitive for ID ${id}:`, error);
    return false;
  }
} 