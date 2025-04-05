import { NextResponse } from 'next/server';
import { getAllPrimitives } from '@/lib/db/services/primitiveService';

export async function GET() {
  try {
    console.log('API: Fetching primitives...');
    
    // Fetch primitives from the database
    const primitives = await getAllPrimitives();
    
    console.log(`API: Successfully fetched ${primitives.length} primitives`);
    
    if (primitives.length === 0) {
      console.warn('API: No primitives found in the database. You may need to seed the database.');
    }
    
    return NextResponse.json({
      success: true,
      primitives
    });
  } catch (error: any) {
    console.error('API: Error fetching primitives:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 