import { z } from 'zod';
import { baseMessageSchema } from './coreMessageSchemas';

/**
 * Problem Matcher Service Message Schemas
 * Based on problemMacher.cli.ts
 */

// Problem matcher response schema
export const matchProblemResponseSchema = z.object({
  type: z.literal('matchProblemResponse'),
  payload: z.any(),
});

// Problem matcher MCP tool execution schemas
export const problemMatcherMcpToolConfirmationSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('problem'),
    toolName: z.string(),
    serverName: z.literal('codebolt-problem'),
    params: z.any(),
    stateEvent: z.literal('ASK_FOR_CONFIRMATION'),
  }),
});

export const problemMatcherMcpToolExecutingSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('problem'),
    toolName: z.string(),
    serverName: z.literal('codebolt-problem'),
    params: z.any(),
    stateEvent: z.literal('EXECUTING'),
  }),
});

export const problemMatcherMcpToolSuccessSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('problem'),
    toolName: z.string(),
    serverName: z.literal('codebolt-problem'),
    params: z.any(),
    result: z.any(),
    stateEvent: z.literal('EXECUTION_SUCCESS'),
  }),
});

export const problemMatcherMcpToolErrorSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('problem'),
    toolName: z.string(),
    serverName: z.literal('codebolt-problem'),
    params: z.any(),
    result: z.string(),
    stateEvent: z.literal('EXECUTION_ERROR'),
  }),
});

export const problemMatcherMcpToolRejectedSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('problem'),
    toolName: z.string(),
    serverName: z.literal('codebolt-problem'),
    params: z.any(),
    stateEvent: z.literal('REJECTED'),
  }),
});


export const problemMatcherErrorResponseSchema = z.object({
  type: z.literal('error'),
  message: z.string(),
});
// Union of all problem matcher service schemas
export const problemMatcherServiceMessageSchema = z.union([
  problemMatcherErrorResponseSchema,
  matchProblemResponseSchema,
  problemMatcherMcpToolConfirmationSchema,
  problemMatcherMcpToolExecutingSchema,
  problemMatcherMcpToolSuccessSchema,
  problemMatcherMcpToolErrorSchema,
  problemMatcherMcpToolRejectedSchema,
]);

// TypeScript types
export type MatchProblemResponse = z.infer<typeof matchProblemResponseSchema>;
export type ProblemMatcherErrorResponse = z.infer<typeof problemMatcherErrorResponseSchema>;
export type ProblemMatcherMcpToolConfirmation = z.infer<typeof problemMatcherMcpToolConfirmationSchema>;
export type ProblemMatcherMcpToolExecuting = z.infer<typeof problemMatcherMcpToolExecutingSchema>;
export type ProblemMatcherMcpToolSuccess = z.infer<typeof problemMatcherMcpToolSuccessSchema>;
export type ProblemMatcherMcpToolError = z.infer<typeof problemMatcherMcpToolErrorSchema>;
export type ProblemMatcherMcpToolRejected = z.infer<typeof problemMatcherMcpToolRejectedSchema>;
export type ProblemMatcherServiceMessage = z.infer<typeof problemMatcherServiceMessageSchema>; 