import { z } from 'zod';
import { AgentMessageBaseSchema } from './baseSchemas';

/**
 * System Notification Schemas for Agent-to-App Communication
 * Based on notification types in src/types/notification/system.ts
 */

// Base system notification schema (using chatnotify type as per original)
export const systemNotificationBaseSchema = AgentMessageBaseSchema.extend({
  toolUseId: z.string(),
  type: z.literal('chatnotify'),
  action: z.string(),
});

// Agent Init Notification
export const agentInitNotificationSchema = systemNotificationBaseSchema.extend({
  action: z.literal('processStartedRequest'),
  data: z.object({
    onStopClicked: z.boolean().optional(),
  }),
});

// Agent Completion Notification
export const agentCompletionNotificationSchema = systemNotificationBaseSchema.extend({
  action: z.literal('processStoppedRequest'),
  data: z.object({
    sessionId: z.string().optional(),
    duration: z.string(),
    result: z.object({
      resultString: z.string(),
    }),
  }),
});

// Union of all system notification schemas
export const systemNotificationSchema = z.union([
  agentInitNotificationSchema,
  agentCompletionNotificationSchema,
]);

// Inferred TypeScript types
export type SystemNotificationBase = z.infer<typeof systemNotificationBaseSchema>;
export type AgentInitNotification = z.infer<typeof agentInitNotificationSchema>;
export type AgentCompletionNotification = z.infer<typeof agentCompletionNotificationSchema>;

// Union types for convenience
export type SystemNotification = z.infer<typeof systemNotificationSchema>; 