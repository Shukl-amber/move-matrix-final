// Load environment variables
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the same schemas as in the app
const FunctionSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  parameters: [String],
  returnType: { type: String, required: true },
});

const PrimitiveSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
  },
  moduleAddress: { type: String, required: true },
  moduleName: { type: String, required: true },
  functions: [FunctionSchema],
  source: { type: String, required: true },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, {
  timestamps: true,
  collection: 'primitives' // Explicitly set the collection name
});

// Connect to MongoDB
async function testMongoose() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://suyogp0607:prVJc7eQNK53J69D@cluster0.t7m4spr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    console.log('Connecting to MongoDB:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });
    
    console.log('Connected to MongoDB successfully');
    
    // Create a model
    console.log('Creating Primitive model');
    const Primitive = mongoose.model('Primitive', PrimitiveSchema);
    
    // Test finding all primitives
    console.log('Finding all primitives');
    const primitives = await Primitive.find({});
    console.log(`Found ${primitives.length} primitives`);
    
    // Log some details
    if (primitives.length > 0) {
      primitives.forEach(primitive => {
        console.log(`- ${primitive.name} (ID: ${primitive.id})`);
      });
    } else {
      console.log('No primitives found. Checking raw database:');
      
      // Get the raw collection
      const db = mongoose.connection.db;
      const collection = db.collection('primitives');
      
      const rawPrimitives = await collection.find({}).toArray();
      console.log(`Raw query found ${rawPrimitives.length} primitives`);
      
      if (rawPrimitives.length > 0) {
        rawPrimitives.forEach(primitive => {
          console.log(`- ${primitive.name} (ID: ${primitive.id})`);
          console.log('  Full document:', JSON.stringify(primitive, null, 2).substring(0, 300) + '...');
        });
      }
    }
  } catch (error) {
    console.error('Error testing mongoose:', error);
  } finally {
    // Close the connection
    await mongoose.disconnect();
    console.log('Mongoose connection closed');
  }
}

// Run the test
testMongoose(); 