import { z } from 'zod';
import { baseMessageSchema } from './coreMessageSchemas';

/**
 * Code Utils Service Message Schemas
 * Based on codeUtilsService.cli.ts
 */

// Code utils response schemas
export const getAllFilesMarkdownResponseSchema = z.object({
  type: z.literal('getAllFilesMarkdownResponse'),
  markdown: z.string(),
});

export const getMatcherListTreeResponseSchema = z.object({
  type: z.literal('getMatcherListTreeResponse'),
  payload: z.any(),
});

export const getMatchDetailResponseSchema = z.object({
  type: z.literal('getMatchDetailResponse'),
  payload: z.any(),
});

// Code utils MCP tool execution schemas
export const codeUtilsMcpToolConfirmationSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('code'),
    toolName: z.string(),
    serverName: z.literal('codebolt-code'),
    params: z.any(),
    stateEvent: z.literal('ASK_FOR_CONFIRMATION'),
  }),
});

export const codeUtilsMcpToolExecutingSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('code'),
    toolName: z.string(),
    serverName: z.literal('codebolt-code'),
    params: z.any(),
    stateEvent: z.literal('EXECUTING'),
  }),
});

export const codeUtilsMcpToolSuccessSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('code'),
    toolName: z.string(),
    serverName: z.literal('codebolt-code'),
    params: z.any(),
    result: z.any(),
    stateEvent: z.literal('EXECUTION_SUCCESS'),
  }),
});

export const codeUtilsMcpToolErrorSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('code'),
    toolName: z.string(),
    serverName: z.literal('codebolt-code'),
    params: z.any(),
    result: z.string(),
    stateEvent: z.literal('EXECUTION_ERROR'),
  }),
});

export const codeUtilsMcpToolRejectedSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('code'),
    toolName: z.string(),
    serverName: z.literal('codebolt-code'),
    params: z.any(),
    stateEvent: z.literal('REJECTED'),
  }),
});


export const codeUtilsErrorResponseSchema = z.object({
  type: z.literal('error'),
  message: z.string(),
});
// Union of all code utils service schemas
export const codeUtilsServiceMessageSchema = z.union([
  codeUtilsErrorResponseSchema,
  getAllFilesMarkdownResponseSchema,
  getMatcherListTreeResponseSchema,
  getMatchDetailResponseSchema,
  codeUtilsMcpToolConfirmationSchema,
  codeUtilsMcpToolExecutingSchema,
  codeUtilsMcpToolSuccessSchema,
  codeUtilsMcpToolErrorSchema,
  codeUtilsMcpToolRejectedSchema,
]);

// TypeScript types
export type GetAllFilesMarkdownResponse = z.infer<typeof getAllFilesMarkdownResponseSchema>;
export type CodeUtilsErrorResponse = z.infer<typeof codeUtilsErrorResponseSchema>;export type GetMatcherListTreeResponse = z.infer<typeof getMatcherListTreeResponseSchema>;
export type CodeUtilsErrorResponse = z.infer<typeof codeUtilsErrorResponseSchema>;export type GetMatchDetailResponse = z.infer<typeof getMatchDetailResponseSchema>;
export type CodeUtilsErrorResponse = z.infer<typeof codeUtilsErrorResponseSchema>;export type CodeUtilsMcpToolConfirmation = z.infer<typeof codeUtilsMcpToolConfirmationSchema>;
export type CodeUtilsErrorResponse = z.infer<typeof codeUtilsErrorResponseSchema>;export type CodeUtilsMcpToolExecuting = z.infer<typeof codeUtilsMcpToolExecutingSchema>;
export type CodeUtilsErrorResponse = z.infer<typeof codeUtilsErrorResponseSchema>;export type CodeUtilsMcpToolSuccess = z.infer<typeof codeUtilsMcpToolSuccessSchema>;
export type CodeUtilsErrorResponse = z.infer<typeof codeUtilsErrorResponseSchema>;export type CodeUtilsMcpToolError = z.infer<typeof codeUtilsMcpToolErrorSchema>;
export type CodeUtilsErrorResponse = z.infer<typeof codeUtilsErrorResponseSchema>;export type CodeUtilsMcpToolRejected = z.infer<typeof codeUtilsMcpToolRejectedSchema>;
export type CodeUtilsErrorResponse = z.infer<typeof codeUtilsErrorResponseSchema>;export type CodeUtilsServiceMessage = z.infer<typeof codeUtilsServiceMessageSchema>; 