import { z } from 'zod';
import { AgentMessageBaseSchema } from './baseSchemas';

/**
 * Chat Notification Schemas for Agent-to-App Communication
 * Based on notification types in src/types/notification/chat.ts
 */

// Base chat notification schema
export const chatNotificationBaseSchema = AgentMessageBaseSchema.extend({
  toolUseId: z.string(),
  type: z.literal('chatnotify'),
  action: z.string(),
});

// User Message Request
export const userMessageRequestNotificationSchema = chatNotificationBaseSchema.extend({
  action: z.literal('sendMessageRequest'),
  data: z.object({
    message: z.string(),
    payload: z.any().optional(),
  }),
});

// Agent Text Response
export const agentTextResponseNotificationSchema = chatNotificationBaseSchema.extend({
  action: z.literal('agentTextResponse'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
  data: z.object({
    message: z.string(),
    timestamp: z.string().optional(),
    agentId: z.string().optional(),
    conversationId: z.string().optional(),
  }).optional(),
});

// Get Chat History Request
export const getChatHistoryRequestNotificationSchema = chatNotificationBaseSchema.extend({
  action: z.literal('getChatHistoryRequest'),
  data: z.object({
    sessionId: z.string().optional(),
  }),
});

// Get Chat History Response
export const getChatHistoryResultNotificationSchema = chatNotificationBaseSchema.extend({
  action: z.literal('getChatHistoryResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
});

// Union of all chat notification schemas
export const chatNotificationSchema = z.union([
  userMessageRequestNotificationSchema,
  agentTextResponseNotificationSchema,
  getChatHistoryRequestNotificationSchema,
  getChatHistoryResultNotificationSchema,
]);

// Inferred TypeScript types
export type ChatNotificationBase = z.infer<typeof chatNotificationBaseSchema>;
export type UserMessageRequestNotification = z.infer<typeof userMessageRequestNotificationSchema>;
export type AgentTextResponseNotification = z.infer<typeof agentTextResponseNotificationSchema>;
export type GetChatHistoryRequestNotification = z.infer<typeof getChatHistoryRequestNotificationSchema>;
export type GetChatHistoryResultNotification = z.infer<typeof getChatHistoryResultNotificationSchema>;

// Union types for convenience
export type ChatNotification = z.infer<typeof chatNotificationSchema>; 