import { z } from 'zod';

/**
 * MCP (Model Context Protocol) Event Schemas for Agent-to-App Communication
 * Based on codeboltjs/src/modules/mcp.ts module operations
 */

// Base MCP message schema
export const mcpEventBaseSchema = z.object({
  type: z.literal('codebolttools'),
  action: z.string(),
  requestId: z.string(),
});

// Get Enabled ToolBoxes Event Schema
export const getEnabledToolBoxesEventSchema = mcpEventBaseSchema.extend({
  action: z.literal('getEnabledToolBoxes'),
});

// Get Local ToolBoxes Event Schema
export const getLocalToolBoxesEventSchema = mcpEventBaseSchema.extend({
  action: z.literal('getLocalToolBoxes'),
});

// Get Available ToolBoxes Event Schema
export const getAvailableToolBoxesEventSchema = mcpEventBaseSchema.extend({
  action: z.literal('getAvailableToolBoxes'),
});

// Search Available ToolBoxes Event Schema
export const searchAvailableToolBoxesEventSchema = mcpEventBaseSchema.extend({
  action: z.literal('searchAvailableToolBoxes'),
  query: z.string(),
});

// List Tools From ToolBoxes Event Schema
export const listToolsFromToolBoxesEventSchema = mcpEventBaseSchema.extend({
  action: z.literal('listToolsFromToolBoxes'),
  toolBoxes: z.array(z.string()),
});

// Configure ToolBox Event Schema
export const configureToolBoxEventSchema = mcpEventBaseSchema.extend({
  action: z.literal('configureToolBox'),
  mcpName: z.string(),
  config: z.any(),
});

// Get Tools Event Schema
export const getToolsEventSchema = mcpEventBaseSchema.extend({
  action: z.literal('getTools'),
  toolboxes: z.array(z.object({
    toolbox: z.string(),
    toolName: z.string(),
  })),
});

// Execute Tool Event Schema
export const executeToolEventSchema = mcpEventBaseSchema.extend({
  action: z.literal('executeTool'),
  toolName: z.string(),
  params: z.any(),
});

// Union of all MCP event schemas
export const mcpEventSchema = z.union([
  getEnabledToolBoxesEventSchema,
  getLocalToolBoxesEventSchema,
  getAvailableToolBoxesEventSchema,
  searchAvailableToolBoxesEventSchema,
  listToolsFromToolBoxesEventSchema,
  configureToolBoxEventSchema,
  getToolsEventSchema,
  executeToolEventSchema,
]);

// Inferred TypeScript types for events
export type McpEventBase = z.infer<typeof mcpEventBaseSchema>;
export type GetEnabledToolBoxesEvent = z.infer<typeof getEnabledToolBoxesEventSchema>;
export type GetLocalToolBoxesEvent = z.infer<typeof getLocalToolBoxesEventSchema>;
export type GetAvailableToolBoxesEvent = z.infer<typeof getAvailableToolBoxesEventSchema>;
export type SearchAvailableToolBoxesEvent = z.infer<typeof searchAvailableToolBoxesEventSchema>;
export type ListToolsFromToolBoxesEvent = z.infer<typeof listToolsFromToolBoxesEventSchema>;
export type ConfigureToolBoxEvent = z.infer<typeof configureToolBoxEventSchema>;
export type GetToolsEvent = z.infer<typeof getToolsEventSchema>;
export type ExecuteToolEvent = z.infer<typeof executeToolEventSchema>;
export type McpEvent = z.infer<typeof mcpEventSchema>;

