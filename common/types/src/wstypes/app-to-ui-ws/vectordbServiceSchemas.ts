import { z } from 'zod';
import { baseMessageSchema } from './coreMessageSchemas';

/**
 * Vector Database Service Message Schemas
 * Based on vectordbService.cli.ts
 */

// Vector DB MCP tool execution schemas
export const vectordbMcpToolConfirmationSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('vectordb'),
    toolName: z.string(),
    serverName: z.literal('codebolt-vectordb'),
    params: z.any(),
    stateEvent: z.literal('ASK_FOR_CONFIRMATION'),
  }),
});

export const vectordbMcpToolExecutingSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('vectordb'),
    toolName: z.string(),
    serverName: z.literal('codebolt-vectordb'),
    params: z.any(),
    stateEvent: z.literal('EXECUTING'),
  }),
});

export const vectordbMcpToolSuccessSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('vectordb'),
    toolName: z.string(),
    serverName: z.literal('codebolt-vectordb'),
    params: z.any(),
    result: z.any(),
    stateEvent: z.literal('EXECUTION_SUCCESS'),
  }),
});

export const vectordbMcpToolErrorSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('vectordb'),
    toolName: z.string(),
    serverName: z.literal('codebolt-vectordb'),
    params: z.any(),
    result: z.string(),
    stateEvent: z.literal('EXECUTION_ERROR'),
  }),
});

export const vectordbMcpToolRejectedSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('vectordb'),
    toolName: z.string(),
    serverName: z.literal('codebolt-vectordb'),
    params: z.any(),
    stateEvent: z.literal('REJECTED'),
  }),
});

// Vector DB service response schemas
export const addVectorItemResponseSchema = z.object({
  type: z.literal('addVectorItemResponse'),
  message: z.literal('success'),
});

export const getVectorResponseSchema = z.object({
  type: z.literal('getVectorResponse'),
  vector: z.any(),
});

export const queryVectorItemResponseSchema = z.object({
  type: z.literal('queryVectorItemResponse'),
  item: z.any(),
});

export const deleteVectorItemResponseSchema = z.object({
  type: z.literal('deleteVectorItemResponse'),
  success: z.boolean(),
  message: z.string(),
  error: z.string().optional(),
});

export const updateVectorItemResponseSchema = z.object({
  type: z.literal('updateVectorItemResponse'),
  success: z.boolean(),
  message: z.string(),
  error: z.string().optional(),
});

export const listVectorItemsResponseSchema = z.object({
  type: z.literal('listVectorItemsResponse'),
  items: z.array(z.any()),
  error: z.string().optional(),
});

export const searchVectorItemsResponseSchema = z.object({
  type: z.literal('searchVectorItemsResponse'),
  results: z.array(z.any()),
  error: z.string().optional(),
});

export const getVectorStatsResponseSchema = z.object({
  type: z.literal('getVectorStatsResponse'),
  stats: z.object({
    totalItems: z.number(),
    dimensions: z.number(),
    indexSize: z.number(),
    lastUpdated: z.string(),
  }),
  error: z.string().optional(),
});

export const clearVectorDatabaseResponseSchema = z.object({
  type: z.literal('clearVectorDatabaseResponse'),
  success: z.boolean(),
  message: z.string(),
  error: z.string().optional(),
});

// Union of all vector DB service schemas
export const vectordbServiceSchema = z.union([
  vectordbMcpToolConfirmationSchema,
  vectordbMcpToolExecutingSchema,
  vectordbMcpToolSuccessSchema,
  vectordbMcpToolErrorSchema,
  vectordbMcpToolRejectedSchema,
  addVectorItemResponseSchema,
  getVectorResponseSchema,
  queryVectorItemResponseSchema,
  deleteVectorItemResponseSchema,
  updateVectorItemResponseSchema,
  listVectorItemsResponseSchema,
  searchVectorItemsResponseSchema,
  getVectorStatsResponseSchema,
  clearVectorDatabaseResponseSchema,
]);

// Inferred TypeScript types
export type VectordbMcpToolConfirmation = z.infer<typeof vectordbMcpToolConfirmationSchema>;
export type VectordbMcpToolExecuting = z.infer<typeof vectordbMcpToolExecutingSchema>;
export type VectordbMcpToolSuccess = z.infer<typeof vectordbMcpToolSuccessSchema>;
export type VectordbMcpToolError = z.infer<typeof vectordbMcpToolErrorSchema>;
export type VectordbMcpToolRejected = z.infer<typeof vectordbMcpToolRejectedSchema>;
export type AddVectorItemResponse = z.infer<typeof addVectorItemResponseSchema>;
export type GetVectorResponse = z.infer<typeof getVectorResponseSchema>;
export type QueryVectorItemResponse = z.infer<typeof queryVectorItemResponseSchema>;
export type DeleteVectorItemResponse = z.infer<typeof deleteVectorItemResponseSchema>;
export type UpdateVectorItemResponse = z.infer<typeof updateVectorItemResponseSchema>;
export type ListVectorItemsResponse = z.infer<typeof listVectorItemsResponseSchema>;
export type SearchVectorItemsResponse = z.infer<typeof searchVectorItemsResponseSchema>;
export type GetVectorStatsResponse = z.infer<typeof getVectorStatsResponseSchema>;
export type ClearVectorDatabaseResponse = z.infer<typeof clearVectorDatabaseResponseSchema>;
export type VectordbService = z.infer<typeof vectordbServiceSchema>; 