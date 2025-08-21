import { z } from 'zod';

/**
 * History/Chat Summary Event Schemas for Agent-to-App Communication
 * Based on codeboltjs/src/modules/history.ts module operations
 */

// Log type enum schema (deprecated in history.ts but kept for compatibility)
export const logTypeSchema = z.enum(['info', 'error', 'warning']);

// Base chat summary message schema
export const chatSummaryEventBaseSchema = z.object({
  type: z.literal('chatSummaryEvent'),
  action: z.string(),
  requestId: z.string(),
});

// Summarize All Event Schema
export const summarizeAllEventSchema = chatSummaryEventBaseSchema.extend({
  action: z.literal('summarizeAll'),
});

// Summarize Event Schema
export const summarizeEventSchema = chatSummaryEventBaseSchema.extend({
  action: z.literal('summarize'),
  messages: z.array(z.object({
    role: z.string(),
    content: z.string(),
  })),
  depth: z.number(),
});

// Union of all history event schemas
export const historyEventSchema = z.union([
  summarizeAllEventSchema,
  summarizeEventSchema,
]);

// Inferred TypeScript types for enums
export type LogType = z.infer<typeof logTypeSchema>;

// Inferred TypeScript types for events
export type ChatSummaryEventBase = z.infer<typeof chatSummaryEventBaseSchema>;
export type SummarizeAllEvent = z.infer<typeof summarizeAllEventSchema>;
export type SummarizeEvent = z.infer<typeof summarizeEventSchema>;
export type HistoryEvent = z.infer<typeof historyEventSchema>;

