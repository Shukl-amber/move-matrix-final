require('dotenv').config();
const mongoose = require('mongoose');
const { Schema } = mongoose;

async function testPrimitiveModel() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/movematrix';
    console.log(`Connecting to MongoDB at ${MONGODB_URI}...`);
    
    // Extract the database name from the URI or use default
    const dbName = 'movematrix'; // Explicitly use 'movematrix' database name
    
    // Connect with explicit database name
    await mongoose.connect(MONGODB_URI, {
      dbName: dbName
    });
    console.log(`Connected to MongoDB successfully (database: ${dbName})`);

    // Define schemas
    const FunctionSchema = new Schema({
      name: { type: String, required: true },
      description: { type: String, required: true },
      parameters: [String],
      returnType: { type: String, required: true },
    });

    // Define the Primitive model directly in this script with looser validation
    const PrimitiveSchema = new Schema({
      id: { type: String, required: true },
      name: { type: String, required: true },
      category: { type: String, required: true },
      description: { type: String },
      author: { type: String },
      moduleAddress: { type: String },
      moduleName: { type: String },
      functions: [FunctionSchema],
      source: { type: String },
      createdAt: { type: Date },
      updatedAt: { type: Date },
      deploymentAddress: { type: String }
    }, {
      timestamps: true,
      collection: 'primitives',
      strict: false // Allow fields not specified in the schema
    });

    // Create Primitive model
    let PrimitiveModel;
    
    try {
      // Try to use existing model
      if (mongoose.models.Primitive) {
        console.log('Using existing Primitive model');
        PrimitiveModel = mongoose.models.Primitive;
      } else {
        console.log('Creating new Primitive model');
        PrimitiveModel = mongoose.model('Primitive', PrimitiveSchema);
      }
    } catch (error) {
      console.error('Error accessing Primitive model:', error);
      
      // Cleanup and retry
      if (mongoose.models.Primitive) {
        delete mongoose.models.Primitive;
      }
      
      console.log('Retrying Primitive model creation');
      PrimitiveModel = mongoose.model('Primitive', PrimitiveSchema);
    }

    // Attempt to find all primitives
    console.log('Attempting to find primitives...');
    const primitives = await PrimitiveModel.find({});
    
    console.log(`Found ${primitives.length} primitives using Mongoose model`);
    
    if (primitives.length > 0) {
      // Display first primitive as a sample
      console.log('Sample primitive:');
      console.log(JSON.stringify(primitives[0].toObject(), null, 2));
    } else {
      console.log('No primitives found. Checking raw collection...');
      
      // Check raw collection to see if any documents exist
      const db = mongoose.connection.db;
      const collection = db.collection('primitives');
      const count = await collection.countDocuments();
      console.log(`Raw collection has ${count} documents`);
      
      if (count > 0) {
        const samples = await collection.find({}).limit(1).toArray();
        console.log('Sample raw document:');
        console.log(JSON.stringify(samples[0], null, 2));
      }
    }

    // Test directly with the native MongoDB driver
    console.log('\nTesting with native MongoDB driver:');
    const db = mongoose.connection.db;
    const primitivesCollection = db.collection('primitives');
    const nativePrimitives = await primitivesCollection.find({}).toArray();
    console.log(`Found ${nativePrimitives.length} primitives using native driver`);
    
    if (nativePrimitives.length > 0) {
      console.log('Sample primitive from native driver:');
      console.log(JSON.stringify(nativePrimitives[0], null, 2));
    }

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testPrimitiveModel(); 