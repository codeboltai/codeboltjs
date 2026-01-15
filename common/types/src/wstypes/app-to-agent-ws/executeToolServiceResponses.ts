import { z } from 'zod';

/**
 * Execute Tool Service Response Schemas
 * Messages sent from execute tool CLI service back to agents
 */

// Generic success response schema
export const ExecuteToolOperationResponseSchema = z.object({
    type: z.literal('executeToolOperationResponse'),
    success: z.boolean().optional(),
    message: z.string().optional(),
    data: z.any().optional(),
    result: z.any().optional(),
    timestamp: z.string().optional(),
    requestId: z.string().optional()
});

// Generic error response schema
export const ExecuteToolErrorResponseSchema = z.object({
    type: z.literal('error'),
    success: z.boolean().optional(),
    message: z.string().optional(),
    data: z.any().optional(),
    error: z.string().optional(),
    timestamp: z.string().optional(),
    requestId: z.string().optional()
});

// Union of all execute tool service response schemas
export const ExecuteToolServiceResponseSchema = z.union([
    ExecuteToolOperationResponseSchema,
    ExecuteToolErrorResponseSchema
]);

// Export with the expected name for the index file
export const executeToolServiceResponseSchema = ExecuteToolServiceResponseSchema;

// Type exports
export type ExecuteToolOperationResponse = z.infer<typeof ExecuteToolOperationResponseSchema>;
export type ExecuteToolErrorResponse = z.infer<typeof ExecuteToolErrorResponseSchema>;
export type ExecuteToolServiceResponse = z.infer<typeof ExecuteToolServiceResponseSchema>;
