import { z } from 'zod';
import { baseMessageSchema } from './coreMessageSchemas';

/**
 * Chat History Service Message Schemas
 * Based on chatHistory.cli.ts
 */

// Chat history response schemas
export const getSummarizeAllResponseSchema = z.object({
  type: z.literal('getSummarizeAllResponse'),
  payload: z.any(),
});

export const getSummarizeResponseSchema = z.object({
  type: z.literal('getSummarizeResponse'),
  payload: z.any(),
});

export const getChatHistoryResponseSchema = z.object({
  type: z.literal('getChatHistoryResponse'),
  chats: z.any(),
});

// Chat history MCP tool execution schemas
export const chatHistoryMcpToolConfirmationSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('chat-history'),
    toolName: z.string(),
    serverName: z.literal('codebolt-chat-history'),
    params: z.any(),
    stateEvent: z.literal('ASK_FOR_CONFIRMATION'),
  }),
});

export const chatHistoryMcpToolExecutingSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('chat-history'),
    toolName: z.string(),
    serverName: z.literal('codebolt-chat-history'),
    params: z.any(),
    stateEvent: z.literal('EXECUTING'),
  }),
});

export const chatHistoryMcpToolSuccessSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('chat-history'),
    toolName: z.string(),
    serverName: z.literal('codebolt-chat-history'),
    params: z.any(),
    result: z.any(),
    stateEvent: z.literal('EXECUTION_SUCCESS'),
  }),
});

export const chatHistoryMcpToolErrorSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('chat-history'),
    toolName: z.string(),
    serverName: z.literal('codebolt-chat-history'),
    params: z.any(),
    result: z.string(),
    stateEvent: z.literal('EXECUTION_ERROR'),
  }),
});

export const chatHistoryMcpToolRejectedSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('chat-history'),
    toolName: z.string(),
    serverName: z.literal('codebolt-chat-history'),
    params: z.any(),
    stateEvent: z.literal('REJECTED'),
  }),
});


export const chatHistoryErrorResponseSchema = z.object({
  type: z.literal('error'),
  message: z.string(),
});
// Union of all chat history service schemas
export const chatHistoryServiceMessageSchema = z.union([
  chatHistoryErrorResponseSchema,
  getSummarizeAllResponseSchema,
  getSummarizeResponseSchema,
  getChatHistoryResponseSchema,
  chatHistoryMcpToolConfirmationSchema,
  chatHistoryMcpToolExecutingSchema,
  chatHistoryMcpToolSuccessSchema,
  chatHistoryMcpToolErrorSchema,
  chatHistoryMcpToolRejectedSchema,
]);

// TypeScript types
export type GetSummarizeAllResponse = z.infer<typeof getSummarizeAllResponseSchema>;
export type GetSummarizeResponse = z.infer<typeof getSummarizeResponseSchema>;
export type GetChatHistoryResponse = z.infer<typeof getChatHistoryResponseSchema>;
export type ChatHistoryMcpToolConfirmation = z.infer<typeof chatHistoryMcpToolConfirmationSchema>;
export type ChatHistoryMcpToolExecuting = z.infer<typeof chatHistoryMcpToolExecutingSchema>;
export type ChatHistoryMcpToolSuccess = z.infer<typeof chatHistoryMcpToolSuccessSchema>;
export type ChatHistoryMcpToolError = z.infer<typeof chatHistoryMcpToolErrorSchema>;
export type ChatHistoryMcpToolRejected = z.infer<typeof chatHistoryMcpToolRejectedSchema>;
export type ChatHistoryErrorResponse = z.infer<typeof chatHistoryErrorResponseSchema>;
export type ChatHistoryServiceMessage = z.infer<typeof chatHistoryServiceMessageSchema>; 