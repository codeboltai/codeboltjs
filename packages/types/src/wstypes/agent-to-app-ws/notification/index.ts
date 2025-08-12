import { z } from 'zod';

// Import all notification schemas
export * from './baseSchemas';
export * from './agentNotificationSchemas';
export * from './browserNotificationSchemas';
export * from './chatNotificationSchemas';
export * from './codeUtilsNotificationSchemas';
export * from './crawlerNotificationSchemas';
export * from './dbMemoryNotificationSchemas';
export * from './fsNotificationSchemas';
export * from './gitNotificationSchemas';
export * from './historyNotificationSchemas';
export * from './llmNotificationSchemas';
export * from './mcpNotificationSchemas';
export * from './searchNotificationSchemas';
export * from './systemNotificationSchemas';
export * from './terminalNotificationSchemas';
export * from './todoNotificationSchemas';

// Import individual schemas for union
import { agentNotificationSchema } from './agentNotificationSchemas';
import { browserNotificationSchema } from './browserNotificationSchemas';
import { chatNotificationSchema } from './chatNotificationSchemas';
import { codeUtilsNotificationSchema } from './codeUtilsNotificationSchemas';
import { crawlerNotificationSchema } from './crawlerNotificationSchemas';
import { dbMemoryNotificationSchema } from './dbMemoryNotificationSchemas';
import { fsNotificationSchema } from './fsNotificationSchemas';
import { gitNotificationSchema } from './gitNotificationSchemas';
import { historyNotificationSchema } from './historyNotificationSchemas';
import { llmNotificationSchema } from './llmNotificationSchemas';
import { mcpNotificationSchema } from './mcpNotificationSchemas';
import { searchNotificationSchema } from './searchNotificationSchemas';
import { systemNotificationSchema } from './systemNotificationSchemas';
import { terminalNotificationSchema } from './terminalNotificationSchemas';
import { todoNotificationSchema } from './todoNotificationSchemas';

/**
 * Union schema for all possible notification types
 * This replaces the 'any' type used throughout the notification services
 */
export const allNotificationSchema = z.union([
  agentNotificationSchema,
  browserNotificationSchema,
  chatNotificationSchema,
  codeUtilsNotificationSchema,
  crawlerNotificationSchema,
  dbMemoryNotificationSchema,
  fsNotificationSchema,
  gitNotificationSchema,
  historyNotificationSchema,
  llmNotificationSchema,
  mcpNotificationSchema,
  searchNotificationSchema,
  systemNotificationSchema,
  terminalNotificationSchema,
  todoNotificationSchema,
]);

/**
 * TypeScript type for all possible notification messages
 * This should be used instead of 'any' for finalMessage parameters
 */
export type NotificationMessage = z.infer<typeof allNotificationSchema>;

/**
 * Type guard to check if a message is a valid notification
 */
export function isValidNotification(message: unknown): message is NotificationMessage {
  return allNotificationSchema.safeParse(message).success;
}

/**
 * Utility function to safely parse notification messages
 */
export function parseNotification(message: unknown): NotificationMessage | null {
  const result = allNotificationSchema.safeParse(message);
  return result.success ? result.data : null;
} 