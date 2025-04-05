import mongoose, { Schema, models, model } from 'mongoose';
import { IPrimitive } from './primitive';

// Parameter mapping between source and target functions
export interface IParameterMapping {
  // If null, indicates a constant value is being used instead
  sourceParam: string | null;
  // The parameter in the target function that is being mapped to
  targetParam: string;
  // If sourceParam is null, this contains a constant value
  constantValue?: string;
}

// Connection between two primitives
export interface IConnection {
  sourceId: string;
  sourceFunction: string;
  targetId: string;
  targetFunction: string;
  description: string;
  parameterMappings: IParameterMapping[];
}

// Composition status
export enum CompositionStatus {
  DRAFT = "draft",
  COMPLETE = "complete",
  DEPLOYED = "deployed"
}

// Composition primitive reference
export interface ICompositionPrimitive {
  primitiveId: string;
  position: {
    x: number;
    y: number;
  };
}

// Composition model
export interface IComposition {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  status: CompositionStatus;
  primitiveIds: string[];
  primitives: ICompositionPrimitive[];
  connections: IConnection[];
  deploymentTxHash?: string;
  generatedCode?: string;
}

// Schema for parameter mappings
const ParameterMappingSchema = new Schema({
  sourceParam: { type: String, required: false }, // null if it's a constant
  targetParam: { type: String, required: true },
  constantValue: { type: Schema.Types.Mixed, required: false }, // Used if sourceParam is null
});

// Schema for connections between primitives
const ConnectionSchema = new Schema({
  sourceId: { type: String, required: true },
  sourceFunction: { type: String, required: true },
  targetId: { type: String, required: true },
  targetFunction: { type: String, required: true },
  parameterMappings: [ParameterMappingSchema],
  description: { type: String, required: false },
});

// Schema for primitives within compositions
const CompositionPrimitiveSchema = new Schema({
  primitiveId: { type: String, required: true },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  }
});

// Schema for compositions
const CompositionSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  creatorAddress: { type: String, required: true },
  ownerId: { type: String },
  primitiveIds: { type: [String], default: [] },
  primitives: [CompositionPrimitiveSchema],
  connections: [ConnectionSchema],
  generatedCode: { type: String, required: false },
  deploymentStatus: { 
    type: String, 
    enum: ['draft', 'compiled', 'deployed'],
    default: 'draft'
  },
  status: { type: String },
  deploymentTxHash: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, {
  timestamps: true
});

// Create and export the model
// We need to check if window is undefined to make sure we're on the server
// This is a workaround for NextJS since the model will be imported on the client too
export const Composition = (typeof window === 'undefined') 
  ? (models.Composition || model('Composition', CompositionSchema))
  : null; 