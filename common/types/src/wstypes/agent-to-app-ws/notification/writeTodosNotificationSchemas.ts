import { z } from 'zod';
import { AgentMessageBaseSchema } from './baseSchemas';

/**
 * Write Todos Notification Schemas for Agent-to-App Communication
 * This handles notifications for writing/updating todo lists
 */

// Base write todos notification schema
export const writeTodosNotificationBaseSchema = AgentMessageBaseSchema.extend({
    toolUseId: z.string(),
    type: z.literal('writetodosnotify'),
    action: z.string(),
});

// Write Todos Request
export const writeTodosRequestNotificationSchema = writeTodosNotificationBaseSchema.extend({
    action: z.literal('writeTodosRequest'),
    data: z.object({
        todos: z.array(z.object({
            id: z.string(),
            title: z.string(),
            status: z.string(),
            priority: z.string().optional(),
            tags: z.array(z.string()).optional(),
        })),
    }),
});

// Write Todos Response
export const writeTodosResponseNotificationSchema = writeTodosNotificationBaseSchema.extend({
    action: z.literal('writeTodosResult'),
    content: z.union([z.string(), z.any()]),
    isError: z.boolean().optional(),
});

// Union of all write todos notification schemas
export const writeTodosNotificationSchema = z.union([
    writeTodosRequestNotificationSchema,
    writeTodosResponseNotificationSchema,
]);

// Inferred TypeScript types
export type WriteTodosNotificationBase = z.infer<typeof writeTodosNotificationBaseSchema>;
export type WriteTodosRequestNotification = z.infer<typeof writeTodosRequestNotificationSchema>;
export type WriteTodosResponseNotification = z.infer<typeof writeTodosResponseNotificationSchema>;

// Union types for convenience
export type WriteTodosNotification = z.infer<typeof writeTodosNotificationSchema>;
