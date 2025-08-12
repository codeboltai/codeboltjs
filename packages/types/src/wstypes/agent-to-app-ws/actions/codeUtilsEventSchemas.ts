import { z } from 'zod';

/**
 * CodeUtils Event Schemas
 * Event messages sent from agents to the CodeBolt application for code utility operations
 */

// Get all files as markdown event schema
export const GetAllFilesMarkdownEventSchema = z.object({
    type: z.literal('codeEvent'),
    action: z.literal('getAllFilesMarkdown'),
    requestId: z.string()
});

// Perform match event schema
export const PerformMatchEventSchema = z.object({
    type: z.literal('codeEvent'),
    action: z.literal('performMatch'),
    requestId: z.string(),
    payload: z.object({
        matcherDefinition: z.record(z.any()), // Object with matcher definition
        problemPatterns: z.array(z.any()), // Array of problem patterns
        problems: z.array(z.any()).optional().default([]) // Optional list of pre-existing problems
    })
});

// Get matcher list event schema
export const GetMatcherListEventSchema = z.object({
    type: z.literal('codeEvent'),
    action: z.literal('getMatcherList'),
    requestId: z.string()
});

// Get match detail event schema
export const GetMatchDetailEventSchema = z.object({
    type: z.literal('codeEvent'),
    action: z.literal('getMatchDetail'),
    requestId: z.string(),
    payload: z.object({
        matcher: z.string() // Matcher name or identifier
    })
});

// Union of all codeutils event schemas
export const codeUtilsEventSchema = z.union([
    GetAllFilesMarkdownEventSchema,
    PerformMatchEventSchema,
    GetMatcherListEventSchema,
    GetMatchDetailEventSchema
]);

// Type exports
export type GetAllFilesMarkdownEvent = z.infer<typeof GetAllFilesMarkdownEventSchema>;
export type PerformMatchEvent = z.infer<typeof PerformMatchEventSchema>;
export type GetMatcherListEvent = z.infer<typeof GetMatcherListEventSchema>;
export type GetMatchDetailEvent = z.infer<typeof GetMatchDetailEventSchema>;
export type CodeUtilsEvent = z.infer<typeof codeUtilsEventSchema>;