import mongoose, { Schema, models, model } from 'mongoose';

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
  parameters: [ParameterSchema],
  returnType: { type: String, required: true },
});

// Schema for primitives
const PrimitiveSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['lending', 'swap', 'staking', 'options', 'custom']
  },
  moduleAddress: { type: String, required: true },
  moduleName: { type: String, required: true },
  functions: [FunctionSchema],
  source: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, {
  timestamps: true
});

// Create and export the model
export const Primitive = models.Primitive || model('Primitive', PrimitiveSchema);

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
  description: string;
  author: string;
  moduleAddress: string;
  moduleName: string;
  functions: IFunction[];
  createdAt: Date;
  updatedAt: Date;
  deploymentAddress?: string;
} 