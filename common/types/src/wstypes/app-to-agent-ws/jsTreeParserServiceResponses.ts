import { z } from 'zod';

/**
 * JS Tree Parser Service Response Schemas
 * Messages sent from JS tree parser CLI service back to agents
 */

// Get tree response schema
export const GetTreeResponseSchema = z.object({
    type: z.literal('getTreeResponse'),
    payload: z.array(z.string()).nullable(), // Array of serialized tree strings, or null on error
    success: z.boolean(),
    message: z.string(),
    timestamp: z.string(),
    requestId: z.string()
});

// Error response schema
export const ErrorResponseSchema = z.object({
    type: z.literal('error'),
    success: z.boolean(),
    message: z.string(),
    error: z.string(),
    timestamp: z.string(),
    requestId: z.string()
});

// Union of all JS tree parser service response schemas
export const JSTreeParserServiceResponseSchema = z.union([
    GetTreeResponseSchema,
    ErrorResponseSchema
]);

// Export with the expected name for the index file
export const jsTreeParserServiceResponseSchema = JSTreeParserServiceResponseSchema;

// Type exports
export type GetTreeResponse = z.infer<typeof GetTreeResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type JSTreeParserServiceResponse = z.infer<typeof JSTreeParserServiceResponseSchema>; 