import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
// Import the compile and deploy functions from the script
import { compileMoveCode, deployMoveCode } from '@/scripts/compile-move';

// Define types for compilation and deployment results
interface CompilationResult {
  success: boolean;
  metadataHex: string;
  moduleHexes: string[];
  moduleName: string;
  tempDir: string;
}

interface DeploymentResult {
  success: boolean;
  txHash: string;
  network: string;
  explorerUrl: string;
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { code, walletAddress, compositionId } = data;
    
    if (!code) {
      return NextResponse.json(
        { error: 'Move code is required' }, 
        { status: 400 }
      );
    }
    
    // Create a unique directory name for this compilation and deployment
    const deploymentId = uuidv4();
    const tmpDir = path.join(process.cwd(), 'tmp', deploymentId);
    
    try {
      // Create the directory
      fs.mkdirSync(tmpDir, { recursive: true });
      
      console.log(`Compiling code for composition ${compositionId} with wallet address ${walletAddress || 'default'}`);
      
      // Step 1: Compile the Move code
      const compilationResult = await Promise.resolve(compileMoveCode(code, tmpDir, walletAddress)) as CompilationResult;
      
      if (!compilationResult.success) {
        throw new Error('Compilation failed');
      }
      
      console.log('Compilation successful, proceeding to deployment');
      
      // Step 2: Deploy the compiled code
      const deploymentResult = await Promise.resolve(deployMoveCode(tmpDir)) as DeploymentResult;
      
      // Clean up
      fs.rmSync(tmpDir, { recursive: true, force: true });
      
      return NextResponse.json({
        success: true,
        txHash: deploymentResult.txHash,
        explorerUrl: deploymentResult.explorerUrl,
        moduleName: compilationResult.moduleName,
        network: deploymentResult.network,
        compositionId
      });
    } catch (error: any) {
      console.error('Deployment error:', error);
      
      // Clean up
      fs.rmSync(tmpDir, { recursive: true, force: true });
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Deployment failed', 
          details: error.message
        },
        { status: 500 }
      );
    }
    
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error', 
        details: error.message
      },
      { status: 500 }
    );
  }
} 