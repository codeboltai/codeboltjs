import { z } from 'zod';

/**
 * Codebase Search Service Response Schemas
 * Messages sent from Codebase Search CLI service back to agents
 */

// Codebase Search Success Response Schema
export const CodebaseSearchResponseSchema = z.object({
    type: z.literal('codebaseSearchResponse'),
    success: z.boolean(),
    message: z.string(),
    results: z.array(z.any()), // Using any for results as structure is complex and variable
    timestamp: z.string().optional(),
    requestId: z.string().optional()
});

// MCP Tool Search Response Schema
export const McpToolSearchResponseSchema = z.object({
    type: z.literal('mcpToolSearchResponse'),
    success: z.boolean(),
    message: z.string(),
    results: z.array(z.any()),
    timestamp: z.string().optional(),
    requestId: z.string().optional()
});

// Codebase Search Operation Error Response Schema
export const CodebaseSearchOperationErrorResponseSchema = z.object({
    type: z.literal('error'),
    success: z.boolean(),
    message: z.string(),
    error: z.string().optional(),
    timestamp: z.string().optional(),
    requestId: z.string().optional()
});

// Codebase Search Operation Success Response Schema (Union of success types)
export const CodebaseSearchOperationSuccessResponseSchema = z.union([
    CodebaseSearchResponseSchema,
    McpToolSearchResponseSchema
]);

// Codebase Search Service Response Schema (Union of all responses)
export const CodebaseSearchServiceResponseSchema = z.union([
    CodebaseSearchResponseSchema,
    McpToolSearchResponseSchema,
    CodebaseSearchOperationErrorResponseSchema
]);

// Export with the expected name for the index file if needed (though not strictly required by the import)
export const codebaseSearchServiceResponseSchema = CodebaseSearchServiceResponseSchema;

// Type exports
export type CodebaseSearchResponse = z.infer<typeof CodebaseSearchResponseSchema>;
export type McpToolSearchResponse = z.infer<typeof McpToolSearchResponseSchema>;
export type CodebaseSearchOperationErrorResponse = z.infer<typeof CodebaseSearchOperationErrorResponseSchema>;
export type CodebaseSearchOperationSuccessResponse = z.infer<typeof CodebaseSearchOperationSuccessResponseSchema>;
export type CodebaseSearchServiceResponse = z.infer<typeof CodebaseSearchServiceResponseSchema>;
