import { z } from 'zod';
import { baseMessageSchema } from './coreMessageSchemas';

/**
 * JS Tree Parser Service Message Schemas
 * Based on jsTreeParser.cli.ts
 */

// JS tree parser response schema
export const getTreeResponseSchema = z.object({
  type: z.literal('getTreeResponse'),
  payload: z.any(),
});

// JS tree parser MCP tool execution schemas
export const jsTreeParserMcpToolConfirmationSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('tree'),
    toolName: z.string(),
    serverName: z.literal('codebolt-tree'),
    params: z.any(),
    stateEvent: z.literal('ASK_FOR_CONFIRMATION'),
  }),
});

export const jsTreeParserMcpToolExecutingSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('tree'),
    toolName: z.string(),
    serverName: z.literal('codebolt-tree'),
    params: z.any(),
    stateEvent: z.literal('EXECUTING'),
  }),
});

export const jsTreeParserMcpToolSuccessSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('tree'),
    toolName: z.string(),
    serverName: z.literal('codebolt-tree'),
    params: z.any(),
    result: z.any(),
    stateEvent: z.literal('EXECUTION_SUCCESS'),
  }),
});

export const jsTreeParserMcpToolErrorSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('tree'),
    toolName: z.string(),
    serverName: z.literal('codebolt-tree'),
    params: z.any(),
    result: z.string(),
    stateEvent: z.literal('EXECUTION_ERROR'),
  }),
});

export const jsTreeParserMcpToolRejectedSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('tree'),
    toolName: z.string(),
    serverName: z.literal('codebolt-tree'),
    params: z.any(),
    stateEvent: z.literal('REJECTED'),
  }),
});


export const jsTreeParserErrorResponseSchema = z.object({
  type: z.literal('error'),
  message: z.string(),
});
// Union of all JS tree parser service schemas
export const jsTreeParserServiceMessageSchema = z.union([
  jsTreeParserErrorResponseSchema,
  getTreeResponseSchema,
  jsTreeParserMcpToolConfirmationSchema,
  jsTreeParserMcpToolExecutingSchema,
  jsTreeParserMcpToolSuccessSchema,
  jsTreeParserMcpToolErrorSchema,
  jsTreeParserMcpToolRejectedSchema,
]);

// TypeScript types
export type GetTreeResponse = z.infer<typeof getTreeResponseSchema>;
export type JsTreeParserErrorResponse = z.infer<typeof jsTreeParserErrorResponseSchema>;
export type JsTreeParserMcpToolConfirmation = z.infer<typeof jsTreeParserMcpToolConfirmationSchema>;
export type JsTreeParserMcpToolExecuting = z.infer<typeof jsTreeParserMcpToolExecutingSchema>;
export type JsTreeParserMcpToolSuccess = z.infer<typeof jsTreeParserMcpToolSuccessSchema>;
export type JsTreeParserMcpToolError = z.infer<typeof jsTreeParserMcpToolErrorSchema>;
export type JsTreeParserMcpToolRejected = z.infer<typeof jsTreeParserMcpToolRejectedSchema>;
export type JsTreeParserServiceMessage = z.infer<typeof jsTreeParserServiceMessageSchema>; 