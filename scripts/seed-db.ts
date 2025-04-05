// Import dependencies using CommonJS
const { mockPrimitives } = require('../lib/types/primitives');
const { createPrimitive, getAllPrimitives } = require('../lib/db/services/primitiveService');
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

async function seedDatabase() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');
    
    // Check if primitives already exist
    const existingPrimitives = await getAllPrimitives();
    
    if (existingPrimitives.length > 0) {
      console.log(`Database already seeded with ${existingPrimitives.length} primitives`);
      await mongoose.disconnect();
      return;
    }
    
    // Seed the database with mock primitives
    console.log(`Seeding database with ${mockPrimitives.length} primitives...`);
    
    const results = await Promise.all(
      mockPrimitives.map(async (primitive) => {
        return await createPrimitive(primitive);
      })
    );
    
    console.log(`Successfully seeded database with ${results.length} primitives`);
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error seeding database:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the seed function
seedDatabase(); 