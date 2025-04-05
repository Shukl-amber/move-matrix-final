const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Gets the wallet address from the .aptos/config.yaml file
 * @returns {string|null} The wallet address or null if not found
 */
function getWalletAddress() {
  try {
    const aptosConfigPath = path.join(process.cwd(), '.aptos', 'config.yaml');
    if (fs.existsSync(aptosConfigPath)) {
      const configContent = fs.readFileSync(aptosConfigPath, 'utf8');
      
      // Extract account address using regex
      const accountMatch = configContent.match(/account\s*:\s*([0-9a-fA-Fx]+)/);
      if (accountMatch && accountMatch[1]) {
        return accountMatch[1].trim();
      }
    }
    return null;
  } catch (error) {
    console.warn(`Warning: Could not read wallet address from .aptos config: ${error.message}`);
    return null;
  }
}

/**
 * Compiles Move code using the Aptos CLI
 * @param {string} code The Move code to compile
 * @param {string} tempDir The temporary directory to use for compilation
 * @param {string} walletAddress Optional wallet address to use in the Move.toml file
 * @returns {Object} The compilation result containing metadata and module bytecode
 */
function compileMoveCode(code, tempDir, walletAddress = null) {
  // Extract module name from the code
  const moduleMatch = code.match(/module\s+([^{:]+)::([^{:]+)\s*{/);
  if (!moduleMatch) {
    throw new Error('Invalid module format. Could not extract module name.');
  }
  
  const moduleAddress = moduleMatch[1].trim();
  const moduleName = moduleMatch[2].trim();
  
  console.log(`Compiling module ${moduleAddress}::${moduleName}`);
  
  // Create the directory structure
  const sourcesDir = path.join(tempDir, 'sources');
  fs.mkdirSync(sourcesDir, { recursive: true });
  
  // Write the Move code to a file
  fs.writeFileSync(path.join(sourcesDir, `${moduleName}.move`), code);
  
  // If no wallet address is provided, try to get it from the .aptos config
  if (!walletAddress) {
    const configWalletAddress = getWalletAddress();
    if (configWalletAddress) {
      walletAddress = configWalletAddress;
      console.log(`Using wallet address from .aptos config: ${walletAddress}`);
    } else {
      // Use a default address if no wallet address is available
      walletAddress = "0x8cb99aca7a600522d56386b57ff7171d9e6dd9cf28c297a13a95d5a5f094b7ff";
      console.log(`No wallet address provided or found in config. Using default address: ${walletAddress}`);
    }
  }
  
  // Create Move.toml file with the wallet address
  const moveToml = `[package]
name = "${moduleName}Package"
version = "0.0.1"

[addresses]
token_addr = "${walletAddress}"
${moduleAddress} = "${walletAddress}"

[dependencies]
AptosFramework = { local = "../aptos-core/aptos-move/framework/aptos-framework" }`;
  
  fs.writeFileSync(path.join(tempDir, 'Move.toml'), moveToml);
  
  try {
    // Run the Aptos CLI to compile the Move code
    const stdout = execSync(`cd ${tempDir} && aptos move compile --save-metadata`, { encoding: 'utf8' });
    console.log(stdout);
    
    // Check if compilation was successful
    const buildDir = path.join(tempDir, `build/${moduleName}Package`);

    
    console.log(buildDir);
    if (!fs.existsSync(buildDir)) {
      throw new Error('Compilation failed: build directory not created');
    }
    
    // Read the compiled bytecode
    const metadataPath = path.join(buildDir, 'package-metadata.bcs');
    const modulesDir = path.join(buildDir, 'bytecode_modules');
    
    if (!fs.existsSync(metadataPath) || !fs.existsSync(modulesDir)) {
      throw new Error('Compilation output files not found');
    }
    
    const metadata = fs.readFileSync(metadataPath);
    const metadataHex = '0x' + metadata.toString('hex');
    
    // Get all module files
    const modules = [];
    const moduleFiles = fs.readdirSync(modulesDir);
    
    for (const file of moduleFiles) {
      if (file.endsWith('.mv')) {
        const module = fs.readFileSync(path.join(modulesDir, file));
        modules.push('0x' + module.toString('hex'));
      }
    }
    
    return {
      success: true,
      metadataHex,
      moduleHexes: modules,
      moduleName,
      tempDir // Return the temp directory so it can be used for deployment
    };
  } catch (error) {
    console.error('Compilation error:', error.message);
    throw new Error(`Compilation failed: ${error.message}`);
  }
}

/**
 * Deploys compiled Move code using the Aptos CLI
 * @param {string} tempDir The temporary directory containing the compiled code
 * @returns {Object} The deployment result containing the transaction hash
 */
function deployMoveCode(tempDir) {
  try {
    console.log(`Deploying from directory: ${tempDir}`);
    
    // Check for wallet address
    const walletAddress = getWalletAddress();
    if (walletAddress) {
      console.log(`Using wallet address: ${walletAddress}`);
    } else {
      console.warn('Warning: Could not determine wallet address from .aptos config');
    }
    
    // Create and copy the .aptos directory from project root to the temporary directory
    // This contains the wallet configuration needed for deployment
    const rootAptosPath = path.join(process.cwd(), '.aptos');
    const tempAptosPath = path.join(tempDir, '.aptos');

    if (fs.existsSync(rootAptosPath)) {
      // Create the .aptos directory in the temp folder
      console.log(`Creating .aptos directory at ${tempAptosPath}`);
      fs.mkdirSync(tempAptosPath, { recursive: true });
      
      // Read and copy each file in the .aptos directory
      const aptosFiles = fs.readdirSync(rootAptosPath);
      console.log(`Found ${aptosFiles.length} files in .aptos directory`);
      
      for (const file of aptosFiles) {
        const srcFile = path.join(rootAptosPath, file);
        const destFile = path.join(tempAptosPath, file);
        
        // Check if it's a regular file (not a directory, socket, etc.)
        const stats = fs.statSync(srcFile);
        if (stats.isFile()) {
          console.log(`Copying ${file} to temporary .aptos directory`);
          fs.copyFileSync(srcFile, destFile);
        } else {
          console.log(`Skipping non-file ${file} in .aptos directory`);
        }
      }
    } else {
      throw new Error('.aptos directory not found in project root. Deployment cannot proceed without wallet credentials.');
    }
    
    try {
      // Run the Aptos CLI to publish the Move code
      // Using --assume-yes to automatically answer yes to the gas fee prompt
      const stdout = execSync(`cd ${tempDir} && aptos move publish --assume-yes`, { encoding: 'utf8', stdio: 'pipe' });
      console.log(stdout);
      
      // Extract transaction hash from the output
      const txHashMatch = stdout.match(/transaction_hash":\s*"(0x[a-f0-9]+)"/);
      if (!txHashMatch) {
        throw new Error('Could not extract transaction hash from deployment output. Check CLI output for details.');
      }
      
      const txHash = txHashMatch[1];
      console.log(`Deployment successful. Transaction hash: ${txHash}`);
      
      // Extract network from output (testnet/mainnet)
      const networkMatch = stdout.match(/explorer\.aptoslabs\.com\/txn\/[^?]+\?network=([a-z]+)/);
      const network = networkMatch ? networkMatch[1] : 'testnet';
      
      return {
        success: true,
        txHash,
        network,
        explorerUrl: `https://explorer.aptoslabs.com/txn/${txHash}?network=${network}`
      };
    } catch (cliError) {
      // Try to extract more meaningful error information from the CLI output
      let errorMessage = cliError.message || '';
      let details = '';
      
      // Extract error details from stderr if available
      if (cliError.stderr) {
        const stderrStr = cliError.stderr.toString();
        details = stderrStr;
        
        // Look for common error patterns
        if (stderrStr.includes('Insufficient balance')) {
          errorMessage = 'Insufficient balance in the wallet for deployment transaction.';
        } else if (stderrStr.includes('Failed to parse profile')) {
          errorMessage = 'Failed to parse Aptos profile. The .aptos file may be invalid.';
        } else if (stderrStr.includes('Invalid key')) {
          errorMessage = 'Invalid private key in the Aptos profile.';
        }
      }
      
      // Throw a more detailed error
      throw new Error(`Deployment failed: ${errorMessage}\nDetails: ${details}`);
    }
  } catch (error) {
    console.error('Deployment error:', error.message);
    throw new Error(`Deployment failed: ${error.message}`);
  }
}

module.exports = { compileMoveCode, deployMoveCode, getWalletAddress }; 