import { z } from 'zod';
import { AgentMessageBaseSchema } from './baseSchemas';

/**
 * LLM Notification Schemas for Agent-to-App Communication
 * Based on notification types in src/types/notification/llm.ts
 */

// Base LLM notification schema
export const llmNotificationBaseSchema = AgentMessageBaseSchema.extend({
  toolUseId: z.string(),
  type: z.literal('llmnotify'),
  action: z.string(),
});

// LLM Request
export const llmRequestNotificationSchema = llmNotificationBaseSchema.extend({
  action: z.literal('inferenceRequest'),
  data: z.object({
    messages: z.array(z.any()).optional(),
    tools: z.array(z.any()).optional(),
    tool_choice: z.string().optional(),
    full: z.boolean().optional(),
    llmrole: z.string().optional(),
    max_tokens: z.number().optional(),
    temperature: z.number().optional(),
    stream: z.boolean().optional(),
    prompt: z.string().optional(),
  }),
});

// LLM Response
export const llmResponseNotificationSchema = llmNotificationBaseSchema.extend({
  action: z.literal('inferenceResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
});

// LLM Get Token Count Request
export const llmGetTokenCountRequestNotificationSchema = llmNotificationBaseSchema.extend({
  action: z.literal('getTokenCountRequest'),
  data: z.object({
    text: z.string(),
    model: z.string().optional(),
    encoding: z.string().optional(),
  }),
});

// LLM Get Token Count Response
export const llmGetTokenCountResponseNotificationSchema = llmNotificationBaseSchema.extend({
  action: z.literal('getTokenCountResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
  data: z.object({
    tokenCount: z.number(),
    model: z.string().optional(),
    encoding: z.string().optional(),
  }).optional(),
});

// Union of all LLM notification schemas
export const llmNotificationSchema = z.union([
  llmRequestNotificationSchema,
  llmResponseNotificationSchema,
  llmGetTokenCountRequestNotificationSchema,
  llmGetTokenCountResponseNotificationSchema,
]);

// Inferred TypeScript types
export type LlmNotificationBase = z.infer<typeof llmNotificationBaseSchema>;
export type LlmRequestNotification = z.infer<typeof llmRequestNotificationSchema>;
export type LlmResponseNotification = z.infer<typeof llmResponseNotificationSchema>;
export type LlmGetTokenCountRequestNotification = z.infer<typeof llmGetTokenCountRequestNotificationSchema>;
export type LlmGetTokenCountResponseNotification = z.infer<typeof llmGetTokenCountResponseNotificationSchema>;

// Union types for convenience
export type LlmNotification = z.infer<typeof llmNotificationSchema>; 