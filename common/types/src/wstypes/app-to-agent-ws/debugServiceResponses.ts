import { z } from 'zod';

/**
 * Debug Service Response Schemas
 * Messages sent from debug CLI service back to agents
 */

// Debug add log response schema
export const DebugAddLogResponseSchema = z.object({
  type: z.literal('debugAddLogResponse'),
  requestId: z.string(),
  logId: z.string().optional(),
  timestamp: z.string().optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional()
});

// Open debug browser response schema
export const OpenDebugBrowserResponseSchema = z.object({
  type: z.literal('openDebugBrowserResponse'),
  requestId: z.string(),
  url: z.string().optional(),
  port: z.number().optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional()
});

// Get debug logs response schema
export const GetDebugLogsResponseSchema = z.object({
  type: z.literal('debugGetLogsResponse'),
  requestId: z.string(),
  logs: z.array(z.object({
    id: z.string(),
    message: z.string(),
    level: z.string(),
    timestamp: z.string(),
    metadata: z.record(z.any()).optional()
  })).optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional()
});

// Union of all debug service response schemas
export const DebugServiceResponseSchema = z.union([
  DebugAddLogResponseSchema,
  OpenDebugBrowserResponseSchema,
  GetDebugLogsResponseSchema
]);

// Export with the expected name for the index file
export const debugServiceResponseSchema = DebugServiceResponseSchema;

// Type exports
export type DebugAddLogResponse = z.infer<typeof DebugAddLogResponseSchema>;
export type OpenDebugBrowserResponse = z.infer<typeof OpenDebugBrowserResponseSchema>;
export type GetDebugLogsResponse = z.infer<typeof GetDebugLogsResponseSchema>;
export type DebugServiceResponse = z.infer<typeof DebugServiceResponseSchema>; 