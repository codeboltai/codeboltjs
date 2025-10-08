import { z } from 'zod';
import { baseMessageSchema } from './coreMessageSchemas';

/**
 * Project Service Message Schemas
 * Based on projectService.ts
 */

// Project response schemas
export const getProjectPathResponseSchema = z.object({
  type: z.literal('getProjectPathResponse'),
  success: z.literal(true),
  message: z.string(),
  projectPath: z.string(),
});

export const getProjectSettingsResponseSchema = z.object({
  type: z.literal('getProjectSettingsResponse'),
  success: z.literal(true),
  message: z.string(),
  projectSettings: z.any(),
});

export const getRepoMapResponseSchema = z.object({
  type: z.literal('getRepoMapResponse'),
  success: z.literal(true),
  message: z.string(),
  repoMap: z.any(),
});

// Project MCP tool execution schemas
export const projectMcpToolConfirmationSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('project'),
    toolName: z.string(),
    serverName: z.literal('codebolt-project'),
    params: z.any(),
    stateEvent: z.literal('ASK_FOR_CONFIRMATION'),
  }),
});

export const projectMcpToolExecutingSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('project'),
    toolName: z.string(),
    serverName: z.literal('codebolt-project'),
    params: z.any(),
    stateEvent: z.literal('EXECUTING'),
  }),
});

export const projectMcpToolSuccessSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('project'),
    toolName: z.string(),
    serverName: z.literal('codebolt-project'),
    params: z.any(),
    result: z.any(),
    stateEvent: z.literal('EXECUTION_SUCCESS'),
  }),
});

export const projectMcpToolErrorSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('project'),
    toolName: z.string(),
    serverName: z.literal('codebolt-project'),
    params: z.any(),
    result: z.string(),
    stateEvent: z.literal('EXECUTION_ERROR'),
  }),
});

export const projectMcpToolRejectedSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('project'),
    toolName: z.string(),
    serverName: z.literal('codebolt-project'),
    params: z.any(),
    stateEvent: z.literal('REJECTED'),
  }),
});


export const projectErrorResponseSchema = z.object({
  type: z.literal('error'),
  message: z.string(),
});
// Union of all project service schemas
export const projectServiceMessageSchema = z.union([
  projectErrorResponseSchema,
  getProjectPathResponseSchema,
  getProjectSettingsResponseSchema,
  getRepoMapResponseSchema,
  projectMcpToolConfirmationSchema,
  projectMcpToolExecutingSchema,
  projectMcpToolSuccessSchema,
  projectMcpToolErrorSchema,
  projectMcpToolRejectedSchema,
]);

// TypeScript types
export type GetProjectPathResponse = z.infer<typeof getProjectPathResponseSchema>;
export type ProjectErrorResponse = z.infer<typeof projectErrorResponseSchema>;export type GetProjectSettingsResponse = z.infer<typeof getProjectSettingsResponseSchema>;
export type ProjectErrorResponse = z.infer<typeof projectErrorResponseSchema>;export type GetRepoMapResponse = z.infer<typeof getRepoMapResponseSchema>;
export type ProjectErrorResponse = z.infer<typeof projectErrorResponseSchema>;export type ProjectMcpToolConfirmation = z.infer<typeof projectMcpToolConfirmationSchema>;
export type ProjectErrorResponse = z.infer<typeof projectErrorResponseSchema>;export type ProjectMcpToolExecuting = z.infer<typeof projectMcpToolExecutingSchema>;
export type ProjectErrorResponse = z.infer<typeof projectErrorResponseSchema>;export type ProjectMcpToolSuccess = z.infer<typeof projectMcpToolSuccessSchema>;
export type ProjectErrorResponse = z.infer<typeof projectErrorResponseSchema>;export type ProjectMcpToolError = z.infer<typeof projectMcpToolErrorSchema>;
export type ProjectErrorResponse = z.infer<typeof projectErrorResponseSchema>;export type ProjectMcpToolRejected = z.infer<typeof projectMcpToolRejectedSchema>;
export type ProjectErrorResponse = z.infer<typeof projectErrorResponseSchema>;export type ProjectServiceMessage = z.infer<typeof projectServiceMessageSchema>; 