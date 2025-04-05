// Example script for using Google's Gemini API to refine Move code
// Run this with 'node scripts/gemini-example.js'

require('dotenv').config({ path: '.env.local' });

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Configuration for Gemini API
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = "gemini-2.0-flash";

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Example Move code to refine
const sampleMoveCode = `
module example::basic_defi {
    use std::signer;
    
    // This is a placeholder for a DeFi function
    public fun deposit(account: &signer, amount: u64): bool {
        // TODO: Implement deposit logic
        true
    }
    
    // This is a placeholder for a withdrawal function
    public fun withdraw(account: &signer, amount: u64): bool {
        // TODO: Implement withdrawal logic
        true
    }
}
`;

// System prompt with instructions for Gemini
const SYSTEM_PROMPT = `
You are an expert Move language developer. Please refine and improve the provided Move code to make it more efficient, secure, and complete. Implement the placeholder functions with realistic functionality.

IMPORTANT: Return ONLY a JSON object with a single field called "code" containing the refined Move code as a string.
Format your response exactly as follows: {"code": "module example::refined { ... }"}
`;

// Main function to run the example
async function main() {
    if (!GEMINI_API_KEY) {
        console.error('Error: GEMINI_API_KEY not found in environment variables');
        console.log('Please add GEMINI_API_KEY to your .env.local file');
        process.exit(1);
    }

    console.log('Input Move code:');
    console.log(sampleMoveCode);
    console.log('\nSending to Gemini for refinement...');

    try {
        // Get the Gemini model
        const model = genAI.getGenerativeModel({
            model: GEMINI_MODEL,
            systemInstruction: SYSTEM_PROMPT,
        });

        // Create the prompt for code refinement
        const prompt = `
        Please refine and complete this Move code:
        
        \`\`\`move
        ${sampleMoveCode}
        \`\`\`
        
        Implement the deposit and withdraw functions realistically, add proper error handling, 
        and ensure the code follows best practices.
        
        INSTRUCTIONS FOR OUTPUT FORMAT:
        Return ONLY a JSON object with a single field called "code" containing the complete refined Move code as a string. 
        Do not include any explanations, markdown formatting, or additional text outside the JSON object.
        
        Example response format:
        {"code": "module example::refined_module { ... }"}
        `;

        // Generate refined code
        const response = await model.generateContent(prompt);
        const refinedCode = response.response.text();
        
        console.log('\nRaw response:');
        console.log(refinedCode);
        
        console.log('\nRefined Move code:');
        // Extract code from JSON or markdown if needed
        const extractedCode = extractCodeFromJsonOrMarkdown(refinedCode);
        console.log(extractedCode);
    } catch (error) {
        console.error('Error during code refinement:', error);
    }
}

// Helper function to extract code from JSON or markdown formatted text
function extractCodeFromJsonOrMarkdown(text) {
    try {
        // First, try to parse as JSON
        const trimmedText = text.trim();
        const jsonObject = JSON.parse(trimmedText);
        
        // If it's a valid JSON with a code property, return the code
        if (jsonObject && typeof jsonObject.code === 'string') {
            return jsonObject.code.trim();
        }
    } catch (e) {
        // If JSON parsing fails, try extracting from markdown
        console.log('Response was not valid JSON, attempting to extract code from markdown...');
    }
    
    // Extract content between ```move and ``` tags
    const moveCodeRegex = /```move\s*([\s\S]*?)\s*```/;
    const codeMatch = text.match(moveCodeRegex);
    
    if (codeMatch && codeMatch[1]) {
        return codeMatch[1].trim();
    }
    
    // If no ```move tag, try generic code block
    const genericCodeRegex = /```\s*([\s\S]*?)\s*```/;
    const genericMatch = text.match(genericCodeRegex);
    
    if (genericMatch && genericMatch[1]) {
        return genericMatch[1].trim();
    }
    
    // If no code blocks found, return the original text
    return text;
}

// Run the main function
main().catch(console.error); 