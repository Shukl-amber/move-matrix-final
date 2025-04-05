// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { MongoClient } = require('mongodb');

// Use the MongoDB URI from environment variable or hardcoded fallback
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://suyogp0607:prVJc7eQNK53J69D@cluster0.t7m4spr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Connection URL
const url = MONGODB_URI;
const client = new MongoClient(url);

// Database Name
const dbName = 'movematrix';

async function testConnection() {
  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log('Connected successfully to MongoDB server');
    
    // List all databases
    const adminDb = client.db('admin');
    const dbs = await adminDb.admin().listDatabases();
    console.log('Available databases:');
    dbs.databases.forEach(db => {
      console.log(`- ${db.name}`);
    });
    
    // Use the movematrix database
    const db = client.db(dbName);
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log(`\nCollections in ${dbName} database:`);
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Check primitives collection
    const primitivesCollection = db.collection('primitives');
    const primitiveCount = await primitivesCollection.countDocuments();
    console.log(`\nNumber of primitives: ${primitiveCount}`);
    
    if (primitiveCount > 0) {
      const primitives = await primitivesCollection.find({}).limit(2).toArray();
      console.log('\nSample primitives:');
      primitives.forEach(primitive => {
        console.log(`- ${primitive.name} (ID: ${primitive.id})`);
      });
    }
    
    // Check compositions collection if it exists
    if (collections.some(c => c.name === 'compositions')) {
      const compositionsCollection = db.collection('compositions');
      const compositionCount = await compositionsCollection.countDocuments();
      console.log(`\nNumber of compositions: ${compositionCount}`);
      
      if (compositionCount > 0) {
        const compositions = await compositionsCollection.find({}).limit(2).toArray();
        console.log('\nSample compositions:');
        compositions.forEach(composition => {
          console.log(`- ${composition.name} (ID: ${composition._id})`);
        });
      }
    }
  } catch (error) {
    console.error('Error testing database connection:', error);
  } finally {
    await client.close();
    console.log('\nDatabase connection closed');
  }
}

testConnection(); 