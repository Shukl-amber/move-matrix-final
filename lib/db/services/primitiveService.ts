import connectToDB from '../mongoose';
import { Primitive, IPrimitive } from '../models/primitive';

// Get all primitives
export async function getAllPrimitives(): Promise<IPrimitive[]> {
  await connectToDB();
  
  const primitives = await Primitive.find({})
    .sort({ createdAt: -1 });
  
  return JSON.parse(JSON.stringify(primitives));
}

// Get primitive by ID
export async function getPrimitiveById(id: string): Promise<IPrimitive | null> {
  await connectToDB();
  
  const primitive = await Primitive.findOne({ id: id });
  
  if (!primitive) return null;
  
  return JSON.parse(JSON.stringify(primitive));
}

// Get primitives by category
export async function getPrimitivesByCategory(category: string): Promise<IPrimitive[]> {
  await connectToDB();
  
  const primitives = await Primitive.find({ category })
    .sort({ createdAt: -1 });
  
  return JSON.parse(JSON.stringify(primitives));
}

// Create a new primitive
export async function createPrimitive(primitiveData: IPrimitive): Promise<IPrimitive> {
  await connectToDB();
  
  const newPrimitive = new Primitive(primitiveData);
  await newPrimitive.save();
  
  return JSON.parse(JSON.stringify(newPrimitive));
}

// Update an existing primitive
export async function updatePrimitive(id: string, primitiveData: Partial<IPrimitive>): Promise<IPrimitive | null> {
  await connectToDB();
  
  const updatedPrimitive = await Primitive.findOneAndUpdate(
    { id: id },
    { ...primitiveData, updatedAt: new Date() },
    { new: true }
  );
  
  if (!updatedPrimitive) return null;
  
  return JSON.parse(JSON.stringify(updatedPrimitive));
}

// Delete a primitive
export async function deletePrimitive(id: string): Promise<boolean> {
  await connectToDB();
  
  const result = await Primitive.findOneAndDelete({ id: id });
  
  return !!result;
} 