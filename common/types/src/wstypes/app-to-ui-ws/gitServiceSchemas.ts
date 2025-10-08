import { z } from 'zod';
import { baseMessageSchema } from './coreMessageSchemas';


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


// Union of all git service schemas
export const gitServiceMessageSchema = z.union([

 
  gitMcpToolConfirmationSchema,
  gitMcpToolExecutingSchema,
  gitMcpToolSuccessSchema,
  gitMcpToolErrorSchema,
  gitMcpToolRejectedSchema,
]);

// TypeScript types

export type GitMcpToolConfirmation = z.infer<typeof gitMcpToolConfirmationSchema>;
export type GitMcpToolExecuting = z.infer<typeof gitMcpToolExecutingSchema>;
export type GitMcpToolSuccess = z.infer<typeof gitMcpToolSuccessSchema>;
export type GitMcpToolError = z.infer<typeof gitMcpToolErrorSchema>;
export type GitMcpToolRejected = z.infer<typeof gitMcpToolRejectedSchema>;
export type GitServiceMessage = z.infer<typeof gitServiceMessageSchema>; 