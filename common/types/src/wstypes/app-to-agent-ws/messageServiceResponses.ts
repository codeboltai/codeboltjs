import { z } from 'zod';

/**
 * Message Service Response Schemas
 * Messages sent from message CLI service back to agents
 */

// Generic success response schema
export const MessageOperationSuccessResponseSchema = z.object({
    type: z.literal('messageOperationSuccessResponse'),
    success: z.boolean().optional(),
    message: z.string().optional(),
    data: z.any().optional(),
    timestamp: z.string().optional(),
    requestId: z.string().optional()
});

// Generic error response schema
export const MessageOperationErrorResponseSchema = z.object({
    type: z.literal('error'),
    success: z.boolean().optional(),
    message: z.string().optional(),
    data: z.any().optional(),
    error: z.string().optional(),
    timestamp: z.string().optional(),
    requestId: z.string().optional()
});

// Union of all message service response schemas
export const MessageServiceResponseSchema = z.union([
    MessageOperationSuccessResponseSchema,
    MessageOperationErrorResponseSchema
]);

// Export with the expected name for the index file
export const messageServiceResponseSchema = MessageServiceResponseSchema;

// Type exports
export type MessageOperationSuccessResponse = z.infer<typeof MessageOperationSuccessResponseSchema>;
export type MessageOperationErrorResponse = z.infer<typeof MessageOperationErrorResponseSchema>;
export type MessageServiceResponse = z.infer<typeof MessageServiceResponseSchema>;
