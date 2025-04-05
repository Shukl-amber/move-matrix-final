import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { CompositionStatus } from '@/lib/db/models/composition';
import connectToDB from '@/lib/db/mongoose';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { compositionId, txHash } = data;
    
    if (!compositionId || !txHash) {
      return NextResponse.json(
        { error: 'Composition ID and transaction hash are required' }, 
        { status: 400 }
      );
    }
    
    try {
      // Connect to MongoDB using the centralized connection utility
      const db = await connectToDB();
      
      // Convert string ID to ObjectId if needed
      const id = compositionId.startsWith('0x') ? compositionId : new mongoose.Types.ObjectId(compositionId);
      
      // Get the compositions collection
      const compositionsCollection = db.connection.collection('compositions');
      
      // Update the composition status
      const result = await compositionsCollection.updateOne(
        { $or: [{ _id: id }, { id: id }] },
        { 
          $set: { 
            status: CompositionStatus.DEPLOYED,
            deploymentTxHash: txHash,
            updatedAt: new Date()
          } 
        }
      );
      
      if (result.matchedCount === 0) {
        return NextResponse.json(
          { error: 'Composition not found' }, 
          { status: 404 }
        );
      }
      
      console.log(`Successfully updated composition ${compositionId} deployment status with transaction hash ${txHash}`);
      
      return NextResponse.json({
        success: true,
        message: 'Composition deployment status updated'
      });
      
    } catch (dbError: any) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Database error', details: dbError.message },
        { status: 500 }
      );
    }
    
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
} 