import { z } from 'zod';

/**
 * Debug Event Schemas for Agent-to-App Communication
 * Based on codeboltjs/src/modules/debug.ts module operations
 */

// Log type enum schema
export const logTypeSchema = z.enum(['info', 'error', 'warning']);

// Base debug message schema
export const debugEventBaseSchema = z.object({
  type: z.literal('debugEvent'),
  action: z.string(),
  requestId: z.string(),
  message: z.object({}).passthrough(),
});

// Add Log Event Schema
export const addLogEventSchema = debugEventBaseSchema.extend({
  action: z.literal('addLog'),
  message: z.object({
    log: z.string(),
    type: logTypeSchema,
  }),
});

// Open Debug Browser Event Schema
export const openDebugBrowserEventSchema = debugEventBaseSchema.extend({
  action: z.literal('openDebugBrowser'),
  message: z.object({
    url: z.string(),
    port: z.number(),
  }),
});

// Union of all debug event schemas
export const debugEventSchema = z.union([
  addLogEventSchema,
  openDebugBrowserEventSchema,
]);

// Inferred TypeScript types for log type
export type LogType = z.infer<typeof logTypeSchema>;

// Inferred TypeScript types for events
export type DebugEventBase = z.infer<typeof debugEventBaseSchema>;
export type AddLogEvent = z.infer<typeof addLogEventSchema>;
export type OpenDebugBrowserEvent = z.infer<typeof openDebugBrowserEventSchema>;
export type DebugEvent = z.infer<typeof debugEventSchema>;

