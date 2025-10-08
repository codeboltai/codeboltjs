import { z } from 'zod';
import { baseMessageSchema } from './coreMessageSchemas';

/**
 * MCP Service Message Schemas
 * Based on mcpService.cli.ts
 */

// MCP tool execution schemas for the main MCP service
export const mcpToolConfirmationSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('mcp'),
    toolName: z.string(),
    serverName: z.literal('codebolt'),
    params: z.any(),
    stateEvent: z.literal('ASK_FOR_CONFIRMATION'),
  }),
});

export const mcpToolExecutingSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('mcp'),
    toolName: z.string(),
    serverName: z.literal('codebolt'),
    params: z.any(),
    stateEvent: z.literal('EXECUTING'),
  }),
});

export const mcpToolSuccessSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('mcp'),
    toolName: z.string(),
    serverName: z.literal('codebolt'),
    params: z.any(),
    result: z.any(),
    stateEvent: z.literal('EXECUTION_SUCCESS'),
  }),
});

export const mcpToolErrorSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('mcp'),
    toolName: z.string(),
    serverName: z.literal('codebolt'),
    params: z.any(),
    result: z.string(),
    stateEvent: z.literal('EXECUTION_ERROR'),
  }),
});

export const mcpToolRejectedSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('mcp'),
    toolName: z.string(),
    serverName: z.literal('codebolt'),
    params: z.any(),
    stateEvent: z.literal('REJECTED'),
  }),
});

// Type exports for MCP tool execution
export type McpToolConfirmation = z.infer<typeof mcpToolConfirmationSchema>;
export type McpToolExecuting = z.infer<typeof mcpToolExecutingSchema>;
export type McpToolSuccess = z.infer<typeof mcpToolSuccessSchema>;
export type McpToolError = z.infer<typeof mcpToolErrorSchema>;
export type McpToolRejected = z.infer<typeof mcpToolRejectedSchema>;



// Union of all MCP service schemas
export const mcpServiceSchema = z.union([
  mcpToolConfirmationSchema,
  mcpToolExecutingSchema,
  mcpToolSuccessSchema,
  mcpToolErrorSchema,
  mcpToolRejectedSchema,

]);

// Additional TypeScript types

export type McpService = z.infer<typeof mcpServiceSchema>; 