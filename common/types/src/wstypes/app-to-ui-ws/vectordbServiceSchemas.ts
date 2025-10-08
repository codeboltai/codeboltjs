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



// Union of all vector DB service schemas
export const vectordbServiceSchema = z.union([
  vectordbMcpToolConfirmationSchema,
  vectordbMcpToolExecutingSchema,
  vectordbMcpToolSuccessSchema,
  vectordbMcpToolErrorSchema,
  vectordbMcpToolRejectedSchema
]);

// Inferred TypeScript types
export type VectordbMcpToolConfirmation = z.infer<typeof vectordbMcpToolConfirmationSchema>;
export type VectordbMcpToolExecuting = z.infer<typeof vectordbMcpToolExecutingSchema>;
export type VectordbMcpToolSuccess = z.infer<typeof vectordbMcpToolSuccessSchema>;
export type VectordbMcpToolError = z.infer<typeof vectordbMcpToolErrorSchema>;
export type VectordbMcpToolRejected = z.infer<typeof vectordbMcpToolRejectedSchema>;

export type VectordbService = z.infer<typeof vectordbServiceSchema>; 