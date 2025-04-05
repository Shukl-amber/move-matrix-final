import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
// Import the compileMoveCode function from the script
import { compileMoveCode } from '@/scripts/compile-move';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { code, walletAddress } = data;
    
    if (!code) {
      return NextResponse.json(
        { error: 'Move code is required' }, 
        { status: 400 }
      );
    }
    
    // Create a unique directory name for this compilation
    const compilationId = uuidv4();
    const tmpDir = path.join(process.cwd(), 'tmp', compilationId);
    
    try {
      // Create the directory
      fs.mkdirSync(tmpDir, { recursive: true });
      
      // Compile the Move code with the wallet address if provided
      const result = await Promise.resolve(compileMoveCode(code, tmpDir, walletAddress));
      
      // Clean up
      fs.rmSync(tmpDir, { recursive: true, force: true });
      
      return NextResponse.json(result);
    } catch (compilationError: any) {
      console.error('Compilation error:', compilationError);
      
      // Clean up
      fs.rmSync(tmpDir, { recursive: true, force: true });
      
      return NextResponse.json(
        { 
          error: 'Compilation failed', 
          details: compilationError.message
        },
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