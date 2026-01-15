import { z } from 'zod';

/**
 * Execute Tool Event Schemas for Agent-to-App Communication
 * Based on CodeBolt executeToolService.cli.ts operations
 */

// Base execute tool message schema
export const executeToolEventBaseSchema = z.object({
    type: z.literal('executeToolEvent'),
    action: z.string(),
    requestId: z.string(),
    agentId: z.string().optional(),
    threadId: z.string().optional(),
    agentInstanceId: z.string().optional(),
    parentAgentInstanceId: z.string().optional(),
    parentId: z.string().optional(),
});

// Execute Tool Options Schema
const executeToolOptionsSchema = z.object({
    toolName: z.string(),
    params: z.record(z.any()),
});

// Execute Tool Event Schema
export const executeToolEventSchema = executeToolEventBaseSchema.extend({
    action: z.literal('executeTool'),
    message: executeToolOptionsSchema,
});

// Union of all execute tool event schemas
export const executeToolSchema = executeToolEventSchema;

// Inferred TypeScript types for events
export type ExecuteToolEventBase = z.infer<typeof executeToolEventBaseSchema>;
export type ExecuteToolOptions = z.infer<typeof executeToolOptionsSchema>;

export type ExecuteToolEvent = z.infer<typeof executeToolEventSchema>;
export type ExecuteToolSchema = z.infer<typeof executeToolSchema>;
