import { z } from 'zod';

/**
 * DB Memory Service Response Schemas
 * Messages sent from dbmemory CLI service back to agents
 */

// Memory set response schema
export const MemorySetResponseSchema = z.object({
  type: z.literal('memorySetResponse'),
  requestId: z.string(),
  key: z.string().optional(),
  value: z.any().optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
  timestamp: z.string().optional(),
  action: z.string().optional()
});

// Memory get response schema
export const MemoryGetResponseSchema = z.object({
  type: z.literal('memoryGetResponse'),
  requestId: z.string(),
  key: z.string().optional(),
  value: z.any().optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
  timestamp: z.string().optional(),
  action: z.string().optional()
});

// DB Memory error response schema
export const DbMemoryServiceErrorResponseSchema = z.object({
  type: z.literal('error'),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
  timestamp: z.string().optional(),
  requestId: z.string().optional()
});

// Union of all dbmemory service response schemas
export const DBMemoryServiceResponseSchema = z.union([
  MemorySetResponseSchema,
  MemoryGetResponseSchema,
  DbMemoryServiceErrorResponseSchema
]);

// Export with the expected name for the index file
export const dbMemoryServiceResponseSchema = DBMemoryServiceResponseSchema;

// Type exports
export type MemorySetResponse = z.infer<typeof MemorySetResponseSchema>;
export type MemoryGetResponse = z.infer<typeof MemoryGetResponseSchema>;
export type DbMemoryServiceErrorResponse = z.infer<typeof DbMemoryServiceErrorResponseSchema>;
export type DbMemoryServiceResponse = z.infer<typeof DBMemoryServiceResponseSchema>; 