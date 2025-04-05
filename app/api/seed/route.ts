import { NextResponse } from 'next/server';
import { mockPrimitives } from '@/lib/types/primitives';
import { createPrimitive, getAllPrimitives } from '@/lib/db/services/primitiveService';

export async function GET() {
  try {
    // Check if primitives already exist
    const existingPrimitives = await getAllPrimitives();
    
    if (existingPrimitives.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Database already seeded with primitives',
        count: existingPrimitives.length,
        primitives: existingPrimitives
      });
    }
    
    // Seed the database with mock primitives
    const results = await Promise.all(
      mockPrimitives.map(async (primitive) => {
        return await createPrimitive(primitive);
      })
    );
    
    return NextResponse.json({
      success: true,
      message: `Successfully seeded database with ${results.length} primitives`,
      primitives: results
    });
  } catch (error: any) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
} 