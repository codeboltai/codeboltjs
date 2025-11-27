import { z } from 'zod';

/**
 * JS Tree Parser Event Schemas for Agent-to-App Communication
 * Based on CodeBolt jsTreeParser.cli.ts operations
 */

// Base js tree parser message schema
export const jsTreeParserEventBaseSchema = z.object({
    type: z.literal('jsTreeParserEvent'),
    action: z.string(),
    requestId: z.string(),
    agentId: z.string().optional(),
    threadId: z.string().optional(),
    agentInstanceId: z.string().optional(),
    parentAgentInstanceId: z.string().optional(),
    parentId: z.string().optional(),
});

// Get Tree Options Schema
export const getTreeOptionsSchema = z.object({
    filePath: z.string(),
});

// Get Tree Event Schema
export const getTreeEventSchema = jsTreeParserEventBaseSchema.extend({
    action: z.literal('getTree'),
    message: getTreeOptionsSchema,
});

// Union of all js tree parser event schemas
export const jsTreeParserEventSchema = getTreeEventSchema;

// Inferred TypeScript types for events
export type JsTreeParserEventBase = z.infer<typeof jsTreeParserEventBaseSchema>;
export type GetTreeOptions = z.infer<typeof getTreeOptionsSchema>;

export type GetTreeEvent = z.infer<typeof getTreeEventSchema>;
export type JsTreeParserEvent = z.infer<typeof jsTreeParserEventSchema>;
