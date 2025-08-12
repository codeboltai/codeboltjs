import { z } from 'zod';

/**
 * JS Tree Parser Service Response Schemas
 * Messages sent from JS tree parser CLI service back to agents
 */

// Get tree response schema
export const GetTreeResponseSchema = z.object({
    type: z.literal('getTreeResponse'),
    payload: z.array(z.string()).nullable() // Array of serialized tree strings, or null on error
});

// Union of all JS tree parser service response schemas
export const JSTreeParserServiceResponseSchema = GetTreeResponseSchema;

// Export with the expected name for the index file
export const jsTreeParserServiceResponseSchema = JSTreeParserServiceResponseSchema;

// Type exports
export type GetTreeResponse = z.infer<typeof GetTreeResponseSchema>;
export type JSTreeParserServiceResponse = z.infer<typeof JSTreeParserServiceResponseSchema>; 