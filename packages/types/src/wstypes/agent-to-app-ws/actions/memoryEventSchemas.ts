import { z } from 'zod';

/**
 * Memory Event Schemas for Agent-to-App Communication
 * Based on codeboltjs/src/modules/dbmemory.ts module operations
 */

// Base memory message schema
export const memoryEventBaseSchema = z.object({
  type: z.literal('memoryEvent'),
  action: z.string(),
  requestId: z.string(),
});

// Memory Set Event Schema
export const memorySetEventSchema = memoryEventBaseSchema.extend({
  action: z.literal('set'),
  key: z.string(),
  value: z.any(),
});

// Memory Get Event Schema
export const memoryGetEventSchema = memoryEventBaseSchema.extend({
  action: z.literal('get'),
  key: z.string(),
});

// Union of all memory event schemas
export const memoryEventSchema = z.union([
  memorySetEventSchema,
  memoryGetEventSchema,
]);

// Inferred TypeScript types for events
export type MemoryEventBase = z.infer<typeof memoryEventBaseSchema>;
export type MemorySetEvent = z.infer<typeof memorySetEventSchema>;
export type MemoryGetEvent = z.infer<typeof memoryGetEventSchema>;
export type MemoryEvent = z.infer<typeof memoryEventSchema>;

