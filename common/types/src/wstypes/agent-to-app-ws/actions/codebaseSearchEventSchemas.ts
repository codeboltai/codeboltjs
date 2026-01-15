import { z } from 'zod';

/**
 * Codebase Search Event Schemas for Agent-to-App Communication
 * Based on CodeBolt codebaseSearch.cli.ts operations
 */

// Base codebase search message schema
export const codebaseSearchEventBaseSchema = z.object({
    type: z.literal('codebaseSearchEvent'),
    action: z.string(),
    requestId: z.string(),
    agentId: z.string().optional(),
    threadId: z.string().optional(),
    agentInstanceId: z.string().optional(),
    parentAgentInstanceId: z.string().optional(),
    parentId: z.string().optional(),
});

// Codebase Search Options Schema
export const codebaseSearchOptionsSchema = z.object({
    query: z.string(),
    target_directories: z.array(z.string()).optional(),
});

// Search MCP Tool Options Schema
export const searchMcpToolOptionsSchema = z.object({
    query: z.string(),
    tags: z.array(z.string()).optional(),
});

// Codebase Search Event Schema
export const codebaseSearchEventSchema = codebaseSearchEventBaseSchema.extend({
    action: z.union([z.literal('codebase_search'), z.literal('codebaseSearch')]),
    message: codebaseSearchOptionsSchema,
});

// Search MCP Tool Event Schema
export const searchMcpToolEventSchema = codebaseSearchEventBaseSchema.extend({
    action: z.literal('search_mcp_tool'),
    message: searchMcpToolOptionsSchema,
});

// Union of all codebase search event schemas
export const codebaseSearchSchema = z.union([
    codebaseSearchEventSchema,
    searchMcpToolEventSchema,
]);

// Inferred TypeScript types for events
export type CodebaseSearchEventBase = z.infer<typeof codebaseSearchEventBaseSchema>;
export type CodebaseSearchOptions = z.infer<typeof codebaseSearchOptionsSchema>;
export type SearchMcpToolOptions = z.infer<typeof searchMcpToolOptionsSchema>;

export type CodebaseSearchEvent = z.infer<typeof codebaseSearchEventSchema>;
export type SearchMcpToolEvent = z.infer<typeof searchMcpToolEventSchema>;
export type CodebaseSearchSchema = z.infer<typeof codebaseSearchSchema>;
