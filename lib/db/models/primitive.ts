import mongoose, { Schema, models, model } from 'mongoose';

// Interface for a function parameter
export interface IParameter {
  name: string;
  type: string;
  description: string;
}

// Interface for a function in a primitive
export interface IFunction {
  name: string;
  description: string;
  parameters: string[];
  returnType: string;
}

// Interface for a primitive
export interface IPrimitive {
  id: string;
  name: string;
  category: string;
  description?: string;
  author?: string;
  moduleAddress?: string;
  moduleName?: string;
  functions?: IFunction[];
  createdAt?: Date;
  updatedAt?: Date;
  deploymentAddress?: string;
  source?: string;
}

// Schema for primitive function parameters
const ParameterSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String, required: false },
});

// Schema for primitive functions
const FunctionSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  parameters: [String],
  returnType: { type: String, required: true },
});

// Schema for primitives with looser validation
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
  strict: false // Allow fields not in the schema
});

// Create and export the model with robust error handling
// This is a workaround for NextJS since the model will be imported on the client too
export const Primitive = (typeof window === 'undefined') 
  ? (() => {
      try {
        // Check if model exists to prevent recompilation
        if (models && models.Primitive) {
          console.log('Using existing Primitive model');
          return models.Primitive;
        }
        
        // Create a new model if it doesn't exist
        console.log('Creating new Primitive model');
        return mongoose.model('Primitive', PrimitiveSchema);
      } catch (error) {
        console.error('Error creating Primitive model:', error);
        
        // Try a different approach if the first one fails
        try {
          // Delete the model if it exists but couldn't be accessed properly
          if (mongoose.models && mongoose.models.Primitive) {
            delete mongoose.models.Primitive;
          }
          
          console.log('Retrying Primitive model creation');
          // Re-create the model
          return mongoose.model('Primitive', PrimitiveSchema);
        } catch (retryError) {
          console.error('Failed to create Primitive model on retry:', retryError);
          return null;
        }
      }
    })()
  : null; 