import { z } from 'zod';

/**
 * VectorDB Service Response Schemas
 * Messages sent from vectordb CLI service back to agents
 */

// Get vector response schema
export const GetVectorResponseSchema = z.object({
  type: z.literal('getVectorResponse'),
  vector: z.array(z.number()).optional(),
  item: z.any().optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
  timestamp: z.string().optional(),
  requestId: z.string().optional()
});

// Add vector item response schema
export const AddVectorItemResponseSchema = z.object({
  type: z.literal('addVectorItemResponse'),
  item: z.any().optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
  timestamp: z.string().optional(),
  requestId: z.string().optional()
});

// Query vector item response schema
export const QueryVectorItemResponseSchema = z.object({
  type: z.union([
    z.literal('qeryVectorItemResponse'),
    z.literal('queryVectorItemResponse')
  ]),
  item: z.any().optional(),
  results: z.any().optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
  timestamp: z.string().optional(),
  requestId: z.string().optional()
});

// Query vector items response schema
export const QueryVectorItemsResponseSchema = z.object({
  type: z.union([
    z.literal('qeryVectorItemsResponse'),
    z.literal('queryVectorItemsResponse')
  ]),
  items: z.array(z.any()).optional(),
  results: z.any().optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
  timestamp: z.string().optional(),
  requestId: z.string().optional()
});

// VectorDB error response schema
export const VectordbServiceErrorResponseSchema = z.object({
  type: z.literal('error'),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
  timestamp: z.string().optional(),
  requestId: z.string().optional()
});

// Generic success response schema
export const VectorOperationSuccessResponseSchema = z.object({
  type: z.literal('vectorOperationSuccessResponse'),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  timestamp: z.string().optional(),
  requestId: z.string().optional()
});

// Union of all vectordb service response schemas
export const VectorDBServiceResponseSchema = z.union([
  GetVectorResponseSchema,
  AddVectorItemResponseSchema,
  QueryVectorItemResponseSchema,
  QueryVectorItemsResponseSchema,
  VectordbServiceErrorResponseSchema,
  VectorOperationSuccessResponseSchema
]);

// Export with the expected name for the index file
export const vectordbServiceResponseSchema = VectorDBServiceResponseSchema;

// Type exports
export type GetVectorResponse = z.infer<typeof GetVectorResponseSchema>;
export type AddVectorItemResponse = z.infer<typeof AddVectorItemResponseSchema>;
export type QueryVectorItemResponse = z.infer<typeof QueryVectorItemResponseSchema>;
export type QueryVectorItemsResponse = z.infer<typeof QueryVectorItemsResponseSchema>;
export type VectordbServiceErrorResponse = z.infer<typeof VectordbServiceErrorResponseSchema>;
export type VectorOperationSuccessResponse = z.infer<typeof VectorOperationSuccessResponseSchema>;
export type VectorOperationErrorResponse = VectordbServiceErrorResponse;
export type VectordbServiceResponse = z.infer<typeof VectorDBServiceResponseSchema>; 