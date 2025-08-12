import { z } from 'zod';
import { AgentMessageBaseSchema } from './baseSchemas';

/**
 * History Notification Schemas for Agent-to-App Communication
 * Based on notification types in src/types/notification/history.ts
 */

// Base history notification schema
export const historyNotificationBaseSchema = AgentMessageBaseSchema.extend({
  toolUseId: z.string(),
  type: z.literal('historynotify'),
  action: z.string(),
});

// Summarize Previous Conversation Request
export const summarizePreviousConversationRequestNotificationSchema = historyNotificationBaseSchema.extend({
  action: z.literal('summarizeAllRequest'),
  data: z.object({}),
});

// Summarize Previous Conversation Response
export const summarizePreviousConversationResultNotificationSchema = historyNotificationBaseSchema.extend({
  action: z.literal('summarizeAllResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
});

// Summarize Current Message Request
export const summarizeCurrentMessageRequestNotificationSchema = historyNotificationBaseSchema.extend({
  action: z.literal('summarizeRequest'),
  data: z.object({
    messages: z.array(z.object({
      role: z.string(),
      content: z.string(),
    })),
    depth: z.number(),
  }),
});

// Summarize Current Message Response
export const summarizeCurrentMessageResultNotificationSchema = historyNotificationBaseSchema.extend({
  action: z.literal('summarizeResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
});

// Union of all history notification schemas
export const historyNotificationSchema = z.union([
  summarizePreviousConversationRequestNotificationSchema,
  summarizePreviousConversationResultNotificationSchema,
  summarizeCurrentMessageRequestNotificationSchema,
  summarizeCurrentMessageResultNotificationSchema,
]);

// Inferred TypeScript types
export type HistoryNotificationBase = z.infer<typeof historyNotificationBaseSchema>;
export type SummarizePreviousConversationRequestNotification = z.infer<typeof summarizePreviousConversationRequestNotificationSchema>;
export type SummarizePreviousConversationResultNotification = z.infer<typeof summarizePreviousConversationResultNotificationSchema>;
export type SummarizeCurrentMessageRequestNotification = z.infer<typeof summarizeCurrentMessageRequestNotificationSchema>;
export type SummarizeCurrentMessageResultNotification = z.infer<typeof summarizeCurrentMessageResultNotificationSchema>;

// Union types for convenience
export type HistoryNotification = z.infer<typeof historyNotificationSchema>; 