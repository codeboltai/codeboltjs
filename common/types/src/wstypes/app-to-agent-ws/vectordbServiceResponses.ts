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
  error: z.string().optional()
});

// Add vector item response schema
export const AddVectorItemResponseSchema = z.object({
  type: z.literal('addVectorItemResponse'),
  item: z.any().optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional()
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
  error: z.string().optional()
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
  error: z.string().optional()
});

// Union of all vectordb service response schemas
export const VectorDBServiceResponseSchema = z.union([
  GetVectorResponseSchema,
  AddVectorItemResponseSchema,
  QueryVectorItemResponseSchema,
  QueryVectorItemsResponseSchema
]);

// Export with the expected name for the index file
export const vectordbServiceResponseSchema = VectorDBServiceResponseSchema;

// Type exports
export type GetVectorResponse = z.infer<typeof GetVectorResponseSchema>;
export type AddVectorItemResponse = z.infer<typeof AddVectorItemResponseSchema>;
export type QueryVectorItemResponse = z.infer<typeof QueryVectorItemResponseSchema>;
export type QueryVectorItemsResponse = z.infer<typeof QueryVectorItemsResponseSchema>;
export type VectorDBServiceResponse = z.infer<typeof VectorDBServiceResponseSchema>; 