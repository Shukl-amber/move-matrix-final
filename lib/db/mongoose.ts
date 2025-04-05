import mongoose from 'mongoose';

// This is to avoid reinitialization during development
interface GlobalWithMongoose {
  mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

// Make TypeScript see global as having the mongoose property
const globalWithMongoose = global as unknown as GlobalWithMongoose;

  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://suyogp0607:prVJc7eQNK53J69D@cluster0.t7m4spr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
  const DB_NAME = 'movematrix';

// Initialize the cached object if it doesn't exist
if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = { conn: null, promise: null };
}

// Reference to our cached connection
const cached = globalWithMongoose.mongoose;

export async function connectToDB() {
  // If we already have a connection, reuse it
  if (cached.conn) {
    return cached.conn;
  }

  // If we're already connecting, wait for that promise
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of 30
      maxPoolSize: 10, // Maintain up to 10 socket connections
      dbName: DB_NAME, // Explicitly set the database name
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log("Connected to MongoDB");
        return mongoose;
      })
      .then((mongoose) => {
        console.log(`Connected to MongoDB (database: ${DB_NAME})`);
        return mongoose;
      })
      .catch((err) => {
        console.error("MongoDB connection error:", err);
        
        // Check if the error is related to MongoDB already running
        if (err.message && err.message.includes("Address already in use")) {
          console.log("MongoDB might already be running. Trying to connect to existing server...");
          // Try connecting without starting a new server
          return mongoose.connect(MONGODB_URI, opts);
        }
        
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: any) {
    cached.promise = null;
    console.error("Failed to connect to MongoDB:", e.message);
    // Provide a more specific error message to help debugging
    throw new Error(`MongoDB connection failed: ${e.message}. Please ensure MongoDB is running.`);
  }

  return cached.conn;
}

export default connectToDB; 