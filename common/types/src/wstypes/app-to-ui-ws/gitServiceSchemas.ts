import { z } from 'zod';
import { baseMessageSchema } from './coreMessageSchemas';

/**
 * Git Service Message Schemas
 * Based on gitService.cli.ts
 */

// Git response schemas
export const gitInitResponseSchema = z.object({
  type: z.literal('gitInitResponse'),
  success: z.literal(true),
});

export const addResponseSchema = z.object({
  type: z.literal('AddResponse'),
  success: z.literal(true),
  content: z.any(),
});

export const gitCommitResponseSchema = z.object({
  type: z.literal('gitCommitResponse'),
  success: z.literal(true),
  content: z.any(),
});

export const gitPushResponseSchema = z.object({
  type: z.literal('gitPushResponse'),
  success: z.literal(true),
});

export const gitPullResponseSchema = z.object({
  type: z.literal('gitPullResponse'),
  success: z.literal(true),
});

export const gitCheckoutResponseSchema = z.object({
  type: z.literal('gitCheckoutResponse'),
  success: z.literal(true),
  branch: z.any(),
});

export const gitBranchResponseSchema = z.object({
  type: z.literal('gitBranchResponse'),
  success: z.literal(true),
  branch: z.any(),
});

export const gitLogsResponseSchema = z.object({
  type: z.literal('gitLogsResponse'),
  success: z.literal(true),
  data: z.string(),
});

export const gitDiffResponseSchema = z.object({
  type: z.literal('gitDiffResponse'),
  success: z.literal(true),
  data: z.string(),
});

export const gitStatusResponseSchema = z.object({
  type: z.literal('gitStatusResponse'),
  success: z.literal(true),
  data: z.string(),
});

export const gitCloneResponseSchema = z.object({
  type: z.literal('gitCloneResponse'),
  success: z.literal(true),
  url: z.string(),
});

// Git MCP tool execution schemas
export const gitMcpToolConfirmationSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('git'),
    toolName: z.string(),
    serverName: z.literal('codebolt-git'),
    params: z.any(),
    stateEvent: z.literal('ASK_FOR_CONFIRMATION'),
  }),
});

export const gitMcpToolExecutingSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('git'),
    toolName: z.string(),
    serverName: z.literal('codebolt-git'),
    params: z.any(),
    stateEvent: z.literal('EXECUTING'),
  }),
});

export const gitMcpToolSuccessSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('git'),
    toolName: z.string(),
    serverName: z.literal('codebolt-git'),
    params: z.any(),
    result: z.any(),
    stateEvent: z.literal('EXECUTION_SUCCESS'),
  }),
});

export const gitMcpToolErrorSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('git'),
    toolName: z.string(),
    serverName: z.literal('codebolt-git'),
    params: z.any(),
    result: z.string(),
    stateEvent: z.literal('EXECUTION_ERROR'),
  }),
});

export const gitMcpToolRejectedSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('git'),
    toolName: z.string(),
    serverName: z.literal('codebolt-git'),
    params: z.any(),
    stateEvent: z.literal('REJECTED'),
  }),
});


export const gitErrorResponseSchema = z.object({
  type: z.literal('error'),
  message: z.string(),
});
// Union of all git service schemas
export const gitServiceMessageSchema = z.union([
  gitErrorResponseSchema,
  gitInitResponseSchema,
  addResponseSchema,
  gitCommitResponseSchema,
  gitPushResponseSchema,
  gitPullResponseSchema,
  gitCheckoutResponseSchema,
  gitBranchResponseSchema,
  gitLogsResponseSchema,
  gitDiffResponseSchema,
  gitStatusResponseSchema,
  gitCloneResponseSchema,
  gitMcpToolConfirmationSchema,
  gitMcpToolExecutingSchema,
  gitMcpToolSuccessSchema,
  gitMcpToolErrorSchema,
  gitMcpToolRejectedSchema,
]);

// TypeScript types
export type GitInitResponse = z.infer<typeof gitInitResponseSchema>;
export type GitErrorResponse = z.infer<typeof gitErrorResponseSchema>;
export type AddResponse = z.infer<typeof addResponseSchema>;
export type GitCommitResponse = z.infer<typeof gitCommitResponseSchema>;
export type GitPushResponse = z.infer<typeof gitPushResponseSchema>;
export type GitPullResponse = z.infer<typeof gitPullResponseSchema>;
export type GitCheckoutResponse = z.infer<typeof gitCheckoutResponseSchema>;
export type GitBranchResponse = z.infer<typeof gitBranchResponseSchema>;
export type GitLogsResponse = z.infer<typeof gitLogsResponseSchema>;
export type GitDiffResponse = z.infer<typeof gitDiffResponseSchema>;
export type GitStatusResponse = z.infer<typeof gitStatusResponseSchema>;
export type GitCloneResponse = z.infer<typeof gitCloneResponseSchema>;
export type GitMcpToolConfirmation = z.infer<typeof gitMcpToolConfirmationSchema>;
export type GitMcpToolExecuting = z.infer<typeof gitMcpToolExecutingSchema>;
export type GitMcpToolSuccess = z.infer<typeof gitMcpToolSuccessSchema>;
export type GitMcpToolError = z.infer<typeof gitMcpToolErrorSchema>;
export type GitMcpToolRejected = z.infer<typeof gitMcpToolRejectedSchema>;
export type GitServiceMessage = z.infer<typeof gitServiceMessageSchema>; 