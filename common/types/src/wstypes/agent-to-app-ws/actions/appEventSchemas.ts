import { z } from 'zod';

/**
 * App Event Schemas for Agent-to-App Communication
 * Based on CodeBolt appServerice.cli.ts operations
 */

// Base app message schema
export const appEventBaseSchema = z.object({
    type: z.string(), // WebSocketMessageType
    action: z.string(),
    requestId: z.string(),
    agentId: z.string().optional(),
    threadId: z.string().optional(),
    agentInstanceId: z.string().optional(),
    parentAgentInstanceId: z.string().optional(),
    parentId: z.string().optional(),
});

// Get App State Options Schema
export const getAppStateOptionsSchema = z.object({});

// Get Project State Options Schema
export const getProjectStateOptionsSchema = z.object({});

// Update Project State Options Schema
export const updateProjectStateOptionsSchema = z.object({
    key: z.string(),
    value: z.any(),
});

// Get App State Event Schema
export const getAppStateEventSchema = appEventBaseSchema.extend({
    action: z.literal('getAppState'),
    message: getAppStateOptionsSchema.optional(),
});

// Get Project State Event Schema
export const getProjectStateEventSchema = appEventBaseSchema.extend({
    action: z.literal('getProjectState'),
    message: getProjectStateOptionsSchema.optional(),
});

// Update Project State Event Schema
export const updateProjectStateEventSchema = appEventBaseSchema.extend({
    action: z.literal('updateProjectState'),
    message: updateProjectStateOptionsSchema,
});

// Union of all app event schemas
export const appEventSchema = z.union([
    getAppStateEventSchema,
    getProjectStateEventSchema,
    updateProjectStateEventSchema,
]);

// Inferred TypeScript types for events
export type AppEventBase = z.infer<typeof appEventBaseSchema>;
export type GetAppStateOptions = z.infer<typeof getAppStateOptionsSchema>;
export type GetProjectStateOptions = z.infer<typeof getProjectStateOptionsSchema>;
export type UpdateProjectStateOptions = z.infer<typeof updateProjectStateOptionsSchema>;

export type GetAppStateEvent = z.infer<typeof getAppStateEventSchema>;
export type GetProjectStateEvent = z.infer<typeof getProjectStateEventSchema>;
export type UpdateProjectStateEvent = z.infer<typeof updateProjectStateEventSchema>;
export type AppEvent = z.infer<typeof appEventSchema>;
