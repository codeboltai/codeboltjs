import { z } from 'zod';
import { AgentMessageBaseSchema } from './baseSchemas';

/**
 * MCP Notification Schemas for Agent-to-App Communication
 * Based on notification types in src/types/notification/mcp.ts
 */

// Base MCP notification schema
export const mcpNotificationBaseSchema = AgentMessageBaseSchema.extend({
  toolUseId: z.string(),
  type: z.literal('mcpnotify'),
  action: z.string(),
});

// Get Enabled MCP Servers Request
export const getEnabledMCPServersRequestNotificationSchema = mcpNotificationBaseSchema.extend({
  action: z.literal('getEnabledMCPServersRequest'),
  data: z.object({}),
});

// Get Enabled MCP Servers Response
export const getEnabledMCPServersResultNotificationSchema = mcpNotificationBaseSchema.extend({
  action: z.literal('getEnabledMCPServersResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
});

// List Tools from MCP Servers Request
export const listToolsFromMCPServersRequestNotificationSchema = mcpNotificationBaseSchema.extend({
  action: z.literal('listToolsFromMCPServersRequest'),
  data: z.object({
    toolboxes: z.array(z.string()),
  }),
});

// List Tools from MCP Servers Response
export const listToolsFromMCPServersResultNotificationSchema = mcpNotificationBaseSchema.extend({
  action: z.literal('listToolsFromMCPServersResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
});

// Get Tools Request
export const getToolsRequestNotificationSchema = mcpNotificationBaseSchema.extend({
  action: z.literal('getToolsRequest'),
  data: z.object({
    tools: z.array(z.object({
      toolbox: z.string(),
      toolName: z.string(),
    })),
  }),
});

// Get Tools Response
export const getToolsResultNotificationSchema = mcpNotificationBaseSchema.extend({
  action: z.literal('getToolsResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
});

// Execute Tool Request
export const executeToolRequestNotificationSchema = mcpNotificationBaseSchema.extend({
  action: z.literal('executeToolRequest'),
  data: z.object({
    toolbox: z.string(),
    toolName: z.string(),
    params: z.any(),
  }),
});

// Execute Tool Response
export const executeToolResultNotificationSchema = mcpNotificationBaseSchema.extend({
  action: z.literal('executeToolResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
});

// Union of all MCP notification schemas
export const mcpNotificationSchema = z.union([
  getEnabledMCPServersRequestNotificationSchema,
  getEnabledMCPServersResultNotificationSchema,
  listToolsFromMCPServersRequestNotificationSchema,
  listToolsFromMCPServersResultNotificationSchema,
  getToolsRequestNotificationSchema,
  getToolsResultNotificationSchema,
  executeToolRequestNotificationSchema,
  executeToolResultNotificationSchema,
]);

// Inferred TypeScript types
export type McpNotificationBase = z.infer<typeof mcpNotificationBaseSchema>;
export type GetEnabledMCPServersRequestNotification = z.infer<typeof getEnabledMCPServersRequestNotificationSchema>;
export type GetEnabledMCPServersResultNotification = z.infer<typeof getEnabledMCPServersResultNotificationSchema>;
export type ListToolsFromMCPServersRequestNotification = z.infer<typeof listToolsFromMCPServersRequestNotificationSchema>;
export type ListToolsFromMCPServersResultNotification = z.infer<typeof listToolsFromMCPServersResultNotificationSchema>;
export type GetToolsRequestNotification = z.infer<typeof getToolsRequestNotificationSchema>;
export type GetToolsResultNotification = z.infer<typeof getToolsResultNotificationSchema>;
export type ExecuteToolRequestNotification = z.infer<typeof executeToolRequestNotificationSchema>;
export type ExecuteToolResultNotification = z.infer<typeof executeToolResultNotificationSchema>;

// Union types for convenience
export type McpNotification = z.infer<typeof mcpNotificationSchema>; 