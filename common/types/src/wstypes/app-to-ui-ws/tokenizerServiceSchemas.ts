import { z } from 'zod';
import { baseMessageSchema } from './coreMessageSchemas';

/**
 * Tokenizer Service Message Schemas
 * Based on tokenizerService.cli.ts
 */



// Tokenizer MCP tool execution schemas
export const tokenizerMcpToolConfirmationSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('tokenizer'),
    toolName: z.string(),
    serverName: z.literal('codebolt-tokenizer'),
    params: z.any(),
    stateEvent: z.literal('ASK_FOR_CONFIRMATION'),
  }),
});

export const tokenizerMcpToolExecutingSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('tokenizer'),
    toolName: z.string(),
    serverName: z.literal('codebolt-tokenizer'),
    params: z.any(),
    stateEvent: z.literal('EXECUTING'),
  }),
});

export const tokenizerMcpToolSuccessSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('tokenizer'),
    toolName: z.string(),
    serverName: z.literal('codebolt-tokenizer'),
    params: z.any(),
    result: z.any(),
    stateEvent: z.literal('EXECUTION_SUCCESS'),
  }),
});

export const tokenizerMcpToolErrorSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('tokenizer'),
    toolName: z.string(),
    serverName: z.literal('codebolt-tokenizer'),
    params: z.any(),
    result: z.string(),
    stateEvent: z.literal('EXECUTION_ERROR'),
  }),
});

export const tokenizerMcpToolRejectedSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('tokenizer'),
    toolName: z.string(),
    serverName: z.literal('codebolt-tokenizer'),
    params: z.any(),
    stateEvent: z.literal('REJECTED'),
  }),
});


export const tokenizerErrorResponseSchema = z.object({
  type: z.literal('error'),
  message: z.string(),
});
// Union of all tokenizer service schemas
export const tokenizerServiceMessageSchema = z.union([
  tokenizerErrorResponseSchema,
  tokenizerMcpToolConfirmationSchema,
  tokenizerMcpToolExecutingSchema,
  tokenizerMcpToolSuccessSchema,
  tokenizerMcpToolErrorSchema,
  tokenizerMcpToolRejectedSchema,
]);

// TypeScript types
export type TokenizerMcpToolConfirmation = z.infer<typeof tokenizerMcpToolConfirmationSchema>;
export type TokenizerMcpToolExecuting = z.infer<typeof tokenizerMcpToolExecutingSchema>;
export type TokenizerMcpToolSuccess = z.infer<typeof tokenizerMcpToolSuccessSchema>;
export type TokenizerMcpToolError = z.infer<typeof tokenizerMcpToolErrorSchema>;
export type TokenizerMcpToolRejected = z.infer<typeof tokenizerMcpToolRejectedSchema>;
export type TokenizerErrorResponse = z.infer<typeof tokenizerErrorResponseSchema>;
export type TokenizerServiceMessage = z.infer<typeof tokenizerServiceMessageSchema>;

