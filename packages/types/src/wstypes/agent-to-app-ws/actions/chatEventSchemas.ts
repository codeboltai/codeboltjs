import { z } from 'zod';

/**
 * Chat Event Schemas for Agent-to-App Communication
 * Based on codeboltjs/src/modules/chat.ts module operations
 */

// Base chat message schema
export const chatEventBaseSchema = z.object({
  type: z.string(),
  requestId: z.string()
});

// Get Chat History Event Schema
export const getChatHistoryEventSchema = chatEventBaseSchema.extend({
  type: z.literal('getChatHistory'),
});

// Process Stopped Event Schema
export const processStoppedEventSchema = chatEventBaseSchema.extend({
  type: z.literal('processStoped'),
}).passthrough(); // Allow additional properties via spread operator

// Process Started Event Schema
export const processStartedEventSchema = chatEventBaseSchema.extend({
  type: z.literal('processStarted'),
});

// Process Finished Event Schema
export const processFinishedEventSchema = chatEventBaseSchema.extend({
  type: z.literal('processFinished'),
});

// Send Message Event Schema
export const sendMessageEventSchema = chatEventBaseSchema.extend({
  type: z.literal('sendMessage'),
  message: z.string(),
  payload: z.any().optional(),
});
export const WaitforReplyResponse = chatEventBaseSchema.extend({
  type: z.literal('sendMessage'),
  message: z.string(),
  payload: z.any().optional(),
});

// Wait for Reply Event Schema
export const waitforReplyEventSchema = chatEventBaseSchema.extend({
  type: z.literal('waitforReply'),
  message: z.string(),
});

// Confirmation Request Event Schema
export const confirmationRequestEventSchema = chatEventBaseSchema.extend({
  type: z.literal('confirmationRequest'),
  message: z.string(),
  buttons: z.array(z.string()).optional(),
  withFeedback: z.boolean().optional(),
});

// Notification Event Schema
export const notificationEventSchema = chatEventBaseSchema.extend({
  type: z.literal('notificationEvent'),
  message: z.string(),
  eventType: z.enum(['debug', 'git', 'planner', 'browser', 'editor', 'terminal', 'preview']),
});


// Union of all chat event schemas
export const chatEventSchema = z.union([
  getChatHistoryEventSchema,
  processStoppedEventSchema,
  processStartedEventSchema,
  processFinishedEventSchema,
  sendMessageEventSchema,
  waitforReplyEventSchema,
  confirmationRequestEventSchema,
  notificationEventSchema,
]);

// Inferred TypeScript types for events
export type ChatEventBase = z.infer<typeof chatEventBaseSchema>;
export type GetChatHistoryEvent = z.infer<typeof getChatHistoryEventSchema>;
export type ProcessStoppedEvent = z.infer<typeof processStoppedEventSchema>;
export type ProcessStartedEvent = z.infer<typeof processStartedEventSchema>;
export type ProcessFinishedEvent = z.infer<typeof processFinishedEventSchema>;
export type SendMessageEvent = z.infer<typeof sendMessageEventSchema>;
export type WaitforReplyEvent = z.infer<typeof waitforReplyEventSchema>;
export type ConfirmationRequestEvent = z.infer<typeof confirmationRequestEventSchema>;
export type NotificationEvent = z.infer<typeof notificationEventSchema>;
export type ChatEvent = z.infer<typeof chatEventSchema>;
