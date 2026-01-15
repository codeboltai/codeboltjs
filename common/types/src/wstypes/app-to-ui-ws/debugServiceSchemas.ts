import { z } from 'zod';
import { baseMessageSchema } from './coreMessageSchemas';

/**
 * Debug Service Message Schemas
 * Based on debugService.cli.ts
 */

// Debug response schemas
export const debugAddLogResponseSchema = z.object({
  type: z.literal('debugAddLogResponse'),
  succes: z.literal(true),
});

export const openDebugBrowserResponseSchema = z.object({
  type: z.literal('openDebugBrowserResponse'),
  succes: z.literal(true),
});

// Debug MCP tool execution schemas
export const debugMcpToolConfirmationSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('debug'),
    toolName: z.string(),
    serverName: z.literal('codebolt-debug'),
    params: z.any(),
    stateEvent: z.literal('ASK_FOR_CONFIRMATION'),
  }),
});

export const debugMcpToolExecutingSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('debug'),
    toolName: z.string(),
    serverName: z.literal('codebolt-debug'),
    params: z.any(),
    stateEvent: z.literal('EXECUTING'),
  }),
});

export const debugMcpToolSuccessSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('debug'),
    toolName: z.string(),
    serverName: z.literal('codebolt-debug'),
    params: z.any(),
    result: z.any(),
    stateEvent: z.literal('EXECUTION_SUCCESS'),
  }),
});

export const debugMcpToolErrorSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('debug'),
    toolName: z.string(),
    serverName: z.literal('codebolt-debug'),
    params: z.any(),
    result: z.string(),
    stateEvent: z.literal('EXECUTION_ERROR'),
  }),
});

export const debugMcpToolRejectedSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('debug'),
    toolName: z.string(),
    serverName: z.literal('codebolt-debug'),
    params: z.any(),
    stateEvent: z.literal('REJECTED'),
  }),
});

// Union of all debug service schemas
export const debugServiceSchema = z.union([
  debugAddLogResponseSchema,
  openDebugBrowserResponseSchema,
  debugMcpToolConfirmationSchema,
  debugMcpToolExecutingSchema,
  debugMcpToolSuccessSchema,
  debugMcpToolErrorSchema,
  debugMcpToolRejectedSchema,
]);

// Inferred TypeScript types
export type DebugAddLogResponse = z.infer<typeof debugAddLogResponseSchema>;
export type OpenDebugBrowserResponse = z.infer<typeof openDebugBrowserResponseSchema>;
export type DebugMcpToolConfirmation = z.infer<typeof debugMcpToolConfirmationSchema>;
export type DebugMcpToolExecuting = z.infer<typeof debugMcpToolExecutingSchema>;
export type DebugMcpToolSuccess = z.infer<typeof debugMcpToolSuccessSchema>;
export type DebugMcpToolError = z.infer<typeof debugMcpToolErrorSchema>;
export type DebugMcpToolRejected = z.infer<typeof debugMcpToolRejectedSchema>;
export type DebugService = z.infer<typeof debugServiceSchema>; 