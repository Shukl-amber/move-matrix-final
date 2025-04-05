import connectToDB from '../mongoose';
import { Composition, IComposition, CompositionStatus } from '../models/composition';

// Get all compositions
export async function getAllCompositions(): Promise<IComposition[]> {
  await connectToDB();
  
  if (!Composition) {
    throw new Error('Composition model not initialized');
  }
  
  const compositions = await Composition.find({})
    .sort({ createdAt: -1 });
  
  return JSON.parse(JSON.stringify(compositions));
}

// Get compositions by creator address
export async function getCompositionsByCreator(creatorAddress: string): Promise<IComposition[]> {
  await connectToDB();
  
  if (!Composition) {
    throw new Error('Composition model not initialized');
  }
  
  const compositions = await Composition.find({ creatorAddress })
    .sort({ createdAt: -1 });
  
  return JSON.parse(JSON.stringify(compositions));
}

// Get composition by ID
export async function getCompositionById(id: string | undefined): Promise<IComposition | null> {
  await connectToDB();
  
  if (!Composition) {
    throw new Error('Composition model not initialized');
  }
  
  // Return null if id is undefined or not a valid ObjectId
  if (!id || id === 'undefined') {
    console.log('Invalid composition ID:', id);
    return null;
  }
  
  try {
    const composition = await Composition.findById(id);
    
    if (!composition) return null;
    
    return JSON.parse(JSON.stringify(composition));
  } catch (error) {
    console.error('Error fetching composition:', error);
    return null;
  }
}

// Create a new composition
export async function createComposition(compositionData: IComposition): Promise<IComposition> {
  await connectToDB();
  
  if (!Composition) {
    throw new Error('Composition model not initialized');
  }
  
  // Map ownerId to creatorAddress as expected by the schema
  const compositionToSave = {
    ...compositionData,
    creatorAddress: compositionData.ownerId, // Map ownerId to creatorAddress
    deploymentStatus: compositionData.status // Map status to deploymentStatus
  };
  
  const newComposition = new Composition(compositionToSave);
  await newComposition.save();
  
  return JSON.parse(JSON.stringify(newComposition));
}

// Update an existing composition
export async function updateComposition(id: string, compositionData: Partial<IComposition>): Promise<IComposition | null> {
  await connectToDB();
  
  if (!Composition) {
    throw new Error('Composition model not initialized');
  }
  
  const updatedComposition = await Composition.findByIdAndUpdate(
    id,
    { ...compositionData, updatedAt: new Date() },
    { new: true }
  );
  
  if (!updatedComposition) return null;
  
  return JSON.parse(JSON.stringify(updatedComposition));
}

// Update composition deployment status
export async function updateCompositionDeploymentStatus(
  id: string, 
  status: 'draft' | 'compiled' | 'deployed',
  txHash?: string,
  generatedCode?: string
): Promise<IComposition | null> {
  await connectToDB();
  
  if (!Composition) {
    throw new Error('Composition model not initialized');
  }
  
  const updateData: any = { 
    deploymentStatus: status,
    updatedAt: new Date()
  };
  
  if (txHash) updateData.deploymentTxHash = txHash;
  if (generatedCode) updateData.generatedCode = generatedCode;
  
  const updatedComposition = await Composition.findByIdAndUpdate(
    id,
    updateData,
    { new: true }
  );
  
  if (!updatedComposition) return null;
  
  return JSON.parse(JSON.stringify(updatedComposition));
}

// Delete a composition
export async function deleteComposition(id: string): Promise<boolean> {
  await connectToDB();
  
  if (!Composition) {
    throw new Error('Composition model not initialized');
  }
  
  const result = await Composition.findByIdAndDelete(id);
  
  return !!result;
} 