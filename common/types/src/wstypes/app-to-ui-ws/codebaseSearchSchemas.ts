import { z } from 'zod';
import { baseMessageSchema } from './coreMessageSchemas';

/**
 * Codebase Search Service Message Schemas
 * Based on codebaseSearch.cli.ts
 */

// Codebase search state enum schema
export const codebaseSearchStateEnumSchema = z.enum([
  'ASK_FOR_CONFIRMATION',
  'SEARCHING',
  'SEARCH_COMPLETE',
  'SEARCH_ERROR',
  'REJECTED'
]);

// Codebase search confirmation schema
export const codebaseSearchConfirmationSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('CODEBASESEARCH'),
  templateType: z.literal('CODEBASESEARCH'),
  payload: z.object({
    type: z.literal('codebaseSearch'),
    query: z.string(),
    stateEvent: z.literal('ASK_FOR_CONFIRMATION'),
  }),
});

// Codebase search executing schema
export const codebaseSearchExecutingSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('CODEBASESEARCH'),
  templateType: z.literal('CODEBASESEARCH'),
  payload: z.object({
    type: z.literal('codebaseSearch'),
    query: z.string(),
    stateEvent: z.literal('SEARCHING'),
  }),
});

// Codebase search success schema
export const codebaseSearchSuccessSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('CODEBASESEARCH'),
  templateType: z.literal('CODEBASESEARCH'),
  payload: z.object({
    type: z.literal('codebaseSearch'),
    query: z.string(),
    results: z.array(z.object({
      score: z.number(),
      filePath: z.string(),
      lineStart: z.number(),
      lineEnd: z.number(),
      codeSnippet: z.string().optional(),
      language: z.string().optional(),
      namespace: z.string().optional(),
    })),
    rawResults: z.array(z.object({
      score: z.number(),
      filePath: z.string(),
      lineStart: z.number(),
      lineEnd: z.number(),
      namespace: z.string(),
    })).optional(),
    stateEvent: z.literal('SEARCH_COMPLETE'),
  }),
});

// Codebase search error schema
export const codebaseSearchErrorSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('CODEBASESEARCH'),
  templateType: z.literal('CODEBASESEARCH'),
  payload: z.object({
    type: z.literal('codebaseSearch'),
    query: z.string(),
    error: z.string(),
    stateEvent: z.literal('SEARCH_ERROR'),
  }),
});

// Codebase search rejected schema
export const codebaseSearchRejectedSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('CODEBASESEARCH'),
  templateType: z.literal('CODEBASESEARCH'),
  payload: z.object({
    type: z.literal('codebaseSearch'),
    query: z.string(),
    stateEvent: z.literal('REJECTED'),
  }),
});

// Codebase search MCP tool execution schemas
export const codebaseSearchMcpToolConfirmationSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('codebase'),
    toolName: z.string(),
    serverName: z.literal('codebolt-codebase'),
    params: z.any(),
    stateEvent: z.literal('ASK_FOR_CONFIRMATION'),
  }),
});

export const codebaseSearchMcpToolExecutingSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('codebase'),
    toolName: z.string(),
    serverName: z.literal('codebolt-codebase'),
    params: z.any(),
    stateEvent: z.literal('EXECUTING'),
  }),
});

export const codebaseSearchMcpToolSuccessSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('codebase'),
    toolName: z.string(),
    serverName: z.literal('codebolt-codebase'),
    params: z.any(),
    result: z.any(),
    stateEvent: z.literal('EXECUTION_SUCCESS'),
  }),
});

export const codebaseSearchMcpToolErrorSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('codebase'),
    toolName: z.string(),
    serverName: z.literal('codebolt-codebase'),
    params: z.any(),
    result: z.string(),
    stateEvent: z.literal('EXECUTION_ERROR'),
  }),
});

export const codebaseSearchMcpToolRejectedSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('codebase'),
    toolName: z.string(),
    serverName: z.literal('codebolt-codebase'),
    params: z.any(),
    stateEvent: z.literal('REJECTED'),
  }),
});


export const codebaseSearchErrorResponseSchema = z.object({
  type: z.literal('error'),
  message: z.string(),
});
// Union of all codebase search service schemas
export const codebaseSearchServiceMessageSchema = z.union([
  codebaseSearchErrorResponseSchema,
  codebaseSearchConfirmationSchema,
  codebaseSearchExecutingSchema,
  codebaseSearchSuccessSchema,
  codebaseSearchErrorSchema,
  codebaseSearchRejectedSchema,
  codebaseSearchMcpToolConfirmationSchema,
  codebaseSearchMcpToolExecutingSchema,
  codebaseSearchMcpToolSuccessSchema,
  codebaseSearchMcpToolErrorSchema,
  codebaseSearchMcpToolRejectedSchema,
]);

// TypeScript types
export type CodebaseSearchStateEnum = z.infer<typeof codebaseSearchStateEnumSchema>;
export type CodebaseSearchErrorResponse = z.infer<typeof codebaseSearchErrorResponseSchema>;
export type CodebaseSearchConfirmation = z.infer<typeof codebaseSearchConfirmationSchema>;
export type CodebaseSearchExecuting = z.infer<typeof codebaseSearchExecutingSchema>;
export type CodebaseSearchSuccess = z.infer<typeof codebaseSearchSuccessSchema>;
export type CodebaseSearchError = z.infer<typeof codebaseSearchErrorSchema>;
export type CodebaseSearchRejected = z.infer<typeof codebaseSearchRejectedSchema>;
export type CodebaseSearchMcpToolConfirmation = z.infer<typeof codebaseSearchMcpToolConfirmationSchema>;
export type CodebaseSearchMcpToolExecuting = z.infer<typeof codebaseSearchMcpToolExecutingSchema>;
export type CodebaseSearchMcpToolSuccess = z.infer<typeof codebaseSearchMcpToolSuccessSchema>;
export type CodebaseSearchMcpToolError = z.infer<typeof codebaseSearchMcpToolErrorSchema>;
export type CodebaseSearchMcpToolRejected = z.infer<typeof codebaseSearchMcpToolRejectedSchema>;
export type CodebaseSearchServiceMessage = z.infer<typeof codebaseSearchServiceMessageSchema>; 