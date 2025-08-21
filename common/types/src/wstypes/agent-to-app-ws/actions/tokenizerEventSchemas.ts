import { z } from 'zod';

/**
 * Tokenizer Event Schemas for Agent-to-App Communication
 * Based on codeboltjs/src/modules/tokenizer.ts module operations
 */

// Base tokenizer message schema
export const tokenizerEventBaseSchema = z.object({
  type: z.literal('tokenizerEvent'),
  action: z.string(),
  requestId: z.string(),
  message: z.object({
    item: z.string(),
  }),
});

// Add Token Event Schema
export const addTokenEventSchema = tokenizerEventBaseSchema.extend({
  action: z.literal('addToken'),
  message: z.object({
    item: z.string(),
  }),
});

// Get Token Event Schema
export const getTokenEventSchema = tokenizerEventBaseSchema.extend({
  action: z.literal('getToken'),
  message: z.object({
    item: z.string(),
  }),
});

// Union of all tokenizer event schemas
export const tokenizerEventSchema = z.union([
  addTokenEventSchema,
  getTokenEventSchema,
]);

// Inferred TypeScript types for events
export type TokenizerEventBase = z.infer<typeof tokenizerEventBaseSchema>;
export type AddTokenEvent = z.infer<typeof addTokenEventSchema>;
export type GetTokenEvent = z.infer<typeof getTokenEventSchema>;
export type TokenizerEvent = z.infer<typeof tokenizerEventSchema>;

