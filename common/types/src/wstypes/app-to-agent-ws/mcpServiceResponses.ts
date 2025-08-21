import { z } from 'zod';

/**
 * MCP Service Response Schemas
 * Messages sent from MCP CLI service back to agents
 */

// Get enabled toolboxes response schema
export const GetEnabledToolBoxesResponseSchema = z.object({
  type: z.literal('getEnabledToolBoxesResponse'),
  data: z.array(z.any()).optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  error: z.string().optional()
});

// Get local toolboxes response schema
export const GetLocalToolBoxesResponseSchema = z.object({
  type: z.literal('getLocalToolBoxesResponse'),
  data: z.array(z.any()).optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  error: z.string().optional()
});

// Get available toolboxes response schema
export const GetAvailableToolBoxesResponseSchema = z.object({
  type: z.literal('getAvailableToolBoxesResponse'),
  data: z.array(z.any()).optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  error: z.string().optional()
});

// Search available toolboxes response schema
export const SearchAvailableToolBoxesResponseSchema = z.object({
  type: z.literal('searchAvailableToolBoxesResponse'),
  data: z.record(z.any()).optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  error: z.string().optional()
});

// List tools from toolboxes response schema
export const ListToolsFromToolBoxesResponseSchema = z.object({
  type: z.literal('listToolsFromToolBoxesResponse'),
  data: z.array(z.any()).optional(),
  error: z.string().optional(),
  success: z.boolean().optional(),
  message: z.string().optional()
});

// Configure toolbox response schema
export const ConfigureToolBoxResponseSchema = z.object({
  type: z.literal('configureToolBoxResponse'),
  configuration: z.record(z.any()).optional(),
  data: z.any().optional(),
  error: z.string().optional(),
  success: z.boolean().optional(),
  message: z.string().optional()
});

// Get tools response schema
export const GetToolsResponseSchema = z.object({
  type: z.literal('getToolsResponse'),
  tools: z.array(z.object({
    name: z.string(),
    description: z.string(),
    parameters: z.record(z.any())
  })).optional(),
  serverName: z.string().optional(),
  data: z.array(z.any()).optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  error: z.string().optional()
});

// Execute tool response schema
export const ExecuteToolResponseSchema = z.object({
  type: z.literal('executeToolResponse'),
  toolName: z.string().optional(),
  serverName: z.string().optional(),
  params: z.any().optional(),
  data: z.union([
    z.tuple([z.boolean(), z.any()]),
    z.object({ error: z.string().optional() })
  ]).optional(),
  result: z.any().optional(),
  status: z.enum(['pending', 'executing', 'success', 'error', 'rejected']).optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  error: z.string().optional()
});

// Union of all MCP service response schemas
export const MCPServiceResponseSchema = z.union([
  GetEnabledToolBoxesResponseSchema,
  GetLocalToolBoxesResponseSchema,
  GetAvailableToolBoxesResponseSchema,
  SearchAvailableToolBoxesResponseSchema,
  ListToolsFromToolBoxesResponseSchema,
  ConfigureToolBoxResponseSchema,
  GetToolsResponseSchema,
  ExecuteToolResponseSchema
]);

// Export with the expected name for the index file
export const mcpServiceResponseSchema = MCPServiceResponseSchema;

// Type exports
export type GetEnabledToolBoxesResponse = z.infer<typeof GetEnabledToolBoxesResponseSchema>;
export type GetLocalToolBoxesResponse = z.infer<typeof GetLocalToolBoxesResponseSchema>;
export type GetAvailableToolBoxesResponse = z.infer<typeof GetAvailableToolBoxesResponseSchema>;
export type SearchAvailableToolBoxesResponse = z.infer<typeof SearchAvailableToolBoxesResponseSchema>;
export type ListToolsFromToolBoxesResponse = z.infer<typeof ListToolsFromToolBoxesResponseSchema>;
export type ConfigureToolBoxResponse = z.infer<typeof ConfigureToolBoxResponseSchema>;
export type GetToolsResponse = z.infer<typeof GetToolsResponseSchema>;
export type ExecuteToolResponse = z.infer<typeof ExecuteToolResponseSchema>;
export type MCPServiceResponse = z.infer<typeof MCPServiceResponseSchema>; 