import { z } from 'zod';
import { baseMessageSchema } from './coreMessageSchemas';

/**
 * Memory Service Message Schemas
 * Based on memoryService.cli.ts
 */

// Memory MCP tool execution schemas
export const memoryMcpToolConfirmationSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('memory'),
    toolName: z.string(),
    serverName: z.literal('codebolt-memory'),
    params: z.any(),
    stateEvent: z.literal('ASK_FOR_CONFIRMATION'),
  }),
});

export const memoryMcpToolExecutingSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('memory'),
    toolName: z.string(),
    serverName: z.literal('codebolt-memory'),
    params: z.any(),
    stateEvent: z.literal('EXECUTING'),
  }),
});

export const memoryMcpToolSuccessSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('memory'),
    toolName: z.string(),
    serverName: z.literal('codebolt-memory'),
    params: z.any(),
    result: z.any(),
    stateEvent: z.literal('EXECUTION_SUCCESS'),
  }),
});

export const memoryMcpToolErrorSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('memory'),
    toolName: z.string(),
    serverName: z.literal('codebolt-memory'),
    params: z.any(),
    result: z.string(),
    stateEvent: z.literal('EXECUTION_ERROR'),
  }),
});

export const memoryMcpToolRejectedSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('memory'),
    toolName: z.string(),
    serverName: z.literal('codebolt-memory'),
    params: z.any(),
    stateEvent: z.literal('REJECTED'),
  }),
});


export const memoryErrorResponseSchema = z.object({
  type: z.literal('error'),
  message: z.string(),
});
// Union of all memory service schemas
export const memoryServiceSchema = z.union([
  memoryMcpToolConfirmationSchema,
  memoryMcpToolExecutingSchema,
  memoryMcpToolSuccessSchema,
  memoryMcpToolErrorSchema,
  memoryMcpToolRejectedSchema,
]);

// Inferred TypeScript types
export type MemoryMcpToolConfirmation = z.infer<typeof memoryMcpToolConfirmationSchema>;
export type MemoryMcpToolExecuting = z.infer<typeof memoryMcpToolExecutingSchema>;
export type MemoryMcpToolSuccess = z.infer<typeof memoryMcpToolSuccessSchema>;
export type MemoryMcpToolError = z.infer<typeof memoryMcpToolErrorSchema>;
export type MemoryMcpToolRejected = z.infer<typeof memoryMcpToolRejectedSchema>;
export type MemoryService = z.infer<typeof memoryServiceSchema>; 