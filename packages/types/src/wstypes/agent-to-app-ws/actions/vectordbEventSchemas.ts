import { z } from 'zod';

/**
 * Vector Database Event Schemas for Agent-to-App Communication
 * Based on codeboltjs/src/modules/vectordb.ts module operations
 */

// Base vector database message schema
export const vectordbEventBaseSchema = z.object({
  type: z.literal('vectordbEvent'),
  action: z.string(),
  requestId: z.string(),
  message: z.object({}).passthrough(),
});

// Get Vector Event Schema
export const getVectorEventSchema = vectordbEventBaseSchema.extend({
  action: z.literal('getVector'),
  message: z.object({
    item: z.string(),
  }),
});

// Add Vector Item Event Schema
export const addVectorItemEventSchema = vectordbEventBaseSchema.extend({
  action: z.literal('addVectorItem'),
  message: z.object({
    item: z.any(),
  }),
});

// Query Vector Item Event Schema
export const queryVectorItemEventSchema = vectordbEventBaseSchema.extend({
  action: z.literal('queryVectorItem'),
  message: z.object({
    item: z.string(),
  }),
});

// Query Vector Items Event Schema
export const queryVectorItemsEventSchema = vectordbEventBaseSchema.extend({
  action: z.literal('queryVectorItems'),
  message: z.object({
    items: z.array(z.any()),
    dbPath: z.string(),
  }),
});

// Union of all vector database event schemas
export const vectordbEventSchema = z.union([
  getVectorEventSchema,
  addVectorItemEventSchema,
  queryVectorItemEventSchema,
  queryVectorItemsEventSchema,
]);

// Inferred TypeScript types for events
export type VectordbEventBase = z.infer<typeof vectordbEventBaseSchema>;
export type GetVectorEvent = z.infer<typeof getVectorEventSchema>;
export type AddVectorItemEvent = z.infer<typeof addVectorItemEventSchema>;
export type QueryVectorItemEvent = z.infer<typeof queryVectorItemEventSchema>;
export type QueryVectorItemsEvent = z.infer<typeof queryVectorItemsEventSchema>;
export type VectordbEvent = z.infer<typeof vectordbEventSchema>;

