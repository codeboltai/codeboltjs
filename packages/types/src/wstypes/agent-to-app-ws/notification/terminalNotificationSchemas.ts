import { z } from 'zod';
import { AgentMessageBaseSchema } from './baseSchemas';

/**
 * Terminal Notification Schemas for Agent-to-App Communication
 * Based on notification types in src/types/notification/terminal.ts
 */

// Base terminal notification schema
export const terminalNotificationBaseSchema = AgentMessageBaseSchema.extend({
  toolUseId: z.string(),
  type: z.literal('terminalnotify'),
  action: z.string(),
});

// Command Execution Request
export const commandExecutionRequestNotificationSchema = terminalNotificationBaseSchema.extend({
  action: z.literal('executeCommandRequest'),
  data: z.object({
    command: z.string(),
    returnEmptyStringOnSuccess: z.boolean().optional(),
    executeInMain: z.boolean().optional(),
  }),
});

// Command Execution Response
export const commandExecutionResponseNotificationSchema = terminalNotificationBaseSchema.extend({
  action: z.literal('executeCommandResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
});

// Union of all terminal notification schemas
export const terminalNotificationSchema = z.union([
  commandExecutionRequestNotificationSchema,
  commandExecutionResponseNotificationSchema,
]);

// Inferred TypeScript types
export type TerminalNotificationBase = z.infer<typeof terminalNotificationBaseSchema>;
export type CommandExecutionRequestNotification = z.infer<typeof commandExecutionRequestNotificationSchema>;
export type CommandExecutionResponseNotification = z.infer<typeof commandExecutionResponseNotificationSchema>;

// Union types for convenience
export type TerminalNotification = z.infer<typeof terminalNotificationSchema>; 