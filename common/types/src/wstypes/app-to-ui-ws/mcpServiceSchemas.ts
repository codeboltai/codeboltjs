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

// MCP service response schemas
export const getEnabledToolBoxesResponseSchema = z.object({
  type: z.literal('getEnabledToolBoxesResponse'),
  data: z.record(z.any()),
});

export const getAvailableToolBoxesResponseSchema = z.object({
  type: z.literal('getAvailableToolBoxesResponse'),
  data: z.record(z.any()),
});

export const getLocalToolBoxesResponseSchema = z.object({
  type: z.literal('getLocalToolBoxesResponse'),
  data: z.record(z.any()),
});

export const executeToolResponseSchema = z.object({
  type: z.literal('executeToolResponse'),
  data: z.array(z.any()),
});

export const installToolBoxResponseSchema = z.object({
  type: z.literal('installToolBoxResponse'),
  success: z.boolean(),
  message: z.string(),
  error: z.string().optional(),
});

export const uninstallToolBoxResponseSchema = z.object({
  type: z.literal('uninstallToolBoxResponse'),
  success: z.boolean(),
  message: z.string(),
  error: z.string().optional(),
});

export const enableToolBoxResponseSchema = z.object({
  type: z.literal('enableToolBoxResponse'),
  success: z.boolean(),
  message: z.string(),
  error: z.string().optional(),
});

export const disableToolBoxResponseSchema = z.object({
  type: z.literal('disableToolBoxResponse'),
  success: z.boolean(),
  message: z.string(),
  error: z.string().optional(),
});

export const getToolBoxConfigResponseSchema = z.object({
  type: z.literal('getToolBoxConfigResponse'),
  config: z.record(z.any()),
  error: z.string().optional(),
});

export const updateToolBoxConfigResponseSchema = z.object({
  type: z.literal('updateToolBoxConfigResponse'),
  success: z.boolean(),
  message: z.string(),
  error: z.string().optional(),
});

export const getToolBoxStatusResponseSchema = z.object({
  type: z.literal('getToolBoxStatusResponse'),
  status: z.object({
    enabled: z.boolean(),
    running: z.boolean(),
    version: z.string(),
    lastUpdate: z.string().optional(),
  }),
  error: z.string().optional(),
});

// Union of all MCP service schemas
export const mcpServiceSchema = z.union([
  mcpToolConfirmationSchema,
  mcpToolExecutingSchema,
  mcpToolSuccessSchema,
  mcpToolErrorSchema,
  mcpToolRejectedSchema,
  getEnabledToolBoxesResponseSchema,
  getAvailableToolBoxesResponseSchema,
  getLocalToolBoxesResponseSchema,
  executeToolResponseSchema,
  installToolBoxResponseSchema,
  uninstallToolBoxResponseSchema,
  enableToolBoxResponseSchema,
  disableToolBoxResponseSchema,
  getToolBoxConfigResponseSchema,
  updateToolBoxConfigResponseSchema,
  getToolBoxStatusResponseSchema,
]);

// Additional TypeScript types
export type GetEnabledToolBoxesResponse = z.infer<typeof getEnabledToolBoxesResponseSchema>;
export type GetAvailableToolBoxesResponse = z.infer<typeof getAvailableToolBoxesResponseSchema>;
export type GetLocalToolBoxesResponse = z.infer<typeof getLocalToolBoxesResponseSchema>;
export type ExecuteToolResponse = z.infer<typeof executeToolResponseSchema>;
export type InstallToolBoxResponse = z.infer<typeof installToolBoxResponseSchema>;
export type UninstallToolBoxResponse = z.infer<typeof uninstallToolBoxResponseSchema>;
export type EnableToolBoxResponse = z.infer<typeof enableToolBoxResponseSchema>;
export type DisableToolBoxResponse = z.infer<typeof disableToolBoxResponseSchema>;
export type GetToolBoxConfigResponse = z.infer<typeof getToolBoxConfigResponseSchema>;
export type UpdateToolBoxConfigResponse = z.infer<typeof updateToolBoxConfigResponseSchema>;
export type GetToolBoxStatusResponse = z.infer<typeof getToolBoxStatusResponseSchema>;
export type McpService = z.infer<typeof mcpServiceSchema>; 