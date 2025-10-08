import { z } from 'zod';
import { baseMessageSchema } from './coreMessageSchemas';

/**
 * Message Service Message Schemas
 * Based on messageService.cli.ts
 */

// Message MCP tool execution schemas
export const messageMcpToolConfirmationSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('message'),
    toolName: z.string(),
    serverName: z.literal('codebolt-message'),
    params: z.any(),
    stateEvent: z.literal('ASK_FOR_CONFIRMATION'),
  }),
});

export const messageMcpToolExecutingSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('message'),
    toolName: z.string(),
    serverName: z.literal('codebolt-message'),
    params: z.any(),
    stateEvent: z.literal('EXECUTING'),
  }),
});

export const messageMcpToolSuccessSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('message'),
    toolName: z.string(),
    serverName: z.literal('codebolt-message'),
    params: z.any(),
    result: z.any(),
    stateEvent: z.literal('EXECUTION_SUCCESS'),
  }),
});

export const messageMcpToolErrorSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('message'),
    toolName: z.string(),
    serverName: z.literal('codebolt-message'),
    params: z.any(),
    result: z.string(),
    stateEvent: z.literal('EXECUTION_ERROR'),
  }),
});

export const messageMcpToolRejectedSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('message'),
    toolName: z.string(),
    serverName: z.literal('codebolt-message'),
    params: z.any(),
    stateEvent: z.literal('REJECTED'),
  }),
});

// Standard message schemas for different template types
export const agentMessageSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  content: z.string(),
  actionType: z.string(),
  templateType: z.literal('AGENT'),
  sender: z.literal('agent').optional(),
  data: z.object({
    text: z.string(),
    payload: z.any().optional(),
  }),
});

export const infoWithLinkMessageSchema = baseMessageSchema.extend({
  type: z.union([z.literal('processStarted'), z.literal('processStoped'), z.literal('infoWithLink')]),
  content: z.string(),
  actionType: z.string(),
  templateType: z.string(), // Can be various ComponentType values
  sender: z.literal('agent').optional(),
  data: z.object({
    text: z.string(),
    linkUrl: z.string(),
    payload: z.any().optional(),
  }),
});

export const codeViewInEditorMessageSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  content: z.string(),
  actionType: z.string(),
  templateType: z.literal('CODEVIEWINEDITOR'),
  sender: z.literal('agent').optional(),
  payload: z.object({
    type: z.literal('file'),
    path: z.string(),
    content: z.string(),
  }),
});

export const codeConfirmationMessageSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  content: z.string(),
  actionType: z.string(),
  templateType: z.literal('CODECONFIRMATION'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('command'),
    command: z.string(),
  }),
});

// Message service response schemas
export const sendMessageResponseSchema = z.object({
  type: z.literal('sendMessageResponse'),
  success: z.boolean(),
  message: z.string(),
  messageId: z.string(),
  error: z.string().optional(),
});

export const waitForReplyResponseSchema = z.object({
  type: z.literal('waitForReplyResponse'),
  response: z.string(),
  text: z.string(),
  images: z.array(z.any()),
  messageId: z.string(),
  threadId: z.string(),
});

export const confirmationRequestResponseSchema = z.object({
  type: z.literal('confirmationRequestResponse'),
  response: z.string(),
  text: z.string(),
  images: z.array(z.any()),
  messageId: z.string(),
  threadId: z.string(),
});

export const fileReadWriteRequestResponseSchema = z.object({
  type: z.literal('fileReadWriteRequestResponse'),
  response: z.string(),
  text: z.string(),
  images: z.array(z.any()),
  messageId: z.string(),
  threadId: z.string(),
});

export const confirmationWithFeedbackResponseSchema = z.object({
  type: z.literal('confirmationWithFeedbackResponse'),
  response: z.string(),
  text: z.string(),
  images: z.array(z.any()),
  messageId: z.string(),
  threadId: z.string(),
});

// Union of all message service schemas
export const messageServiceSchema = z.union([
  messageMcpToolConfirmationSchema,
  messageMcpToolExecutingSchema,
  messageMcpToolSuccessSchema,
  messageMcpToolErrorSchema,
  messageMcpToolRejectedSchema,
  agentMessageSchema,
  infoWithLinkMessageSchema,
  codeViewInEditorMessageSchema,
  codeConfirmationMessageSchema,
  sendMessageResponseSchema,
  waitForReplyResponseSchema,
  confirmationRequestResponseSchema,
  fileReadWriteRequestResponseSchema,
  confirmationWithFeedbackResponseSchema,
]);

// Inferred TypeScript types
export type MessageMcpToolConfirmation = z.infer<typeof messageMcpToolConfirmationSchema>;
export type MessageMcpToolExecuting = z.infer<typeof messageMcpToolExecutingSchema>;
export type MessageMcpToolSuccess = z.infer<typeof messageMcpToolSuccessSchema>;
export type MessageMcpToolError = z.infer<typeof messageMcpToolErrorSchema>;
export type MessageMcpToolRejected = z.infer<typeof messageMcpToolRejectedSchema>;
export type AgentMessage = z.infer<typeof agentMessageSchema>;
export type InfoWithLinkMessage = z.infer<typeof infoWithLinkMessageSchema>;
export type CodeViewInEditorMessage = z.infer<typeof codeViewInEditorMessageSchema>;
export type CodeConfirmationMessage = z.infer<typeof codeConfirmationMessageSchema>;
export type SendMessageResponse = z.infer<typeof sendMessageResponseSchema>;
export type WaitForReplyResponse = z.infer<typeof waitForReplyResponseSchema>;
export type ConfirmationRequestResponse = z.infer<typeof confirmationRequestResponseSchema>;
export type FileReadWriteRequestResponse = z.infer<typeof fileReadWriteRequestResponseSchema>;
export type ConfirmationWithFeedbackResponse = z.infer<typeof confirmationWithFeedbackResponseSchema>;
export type MessageService = z.infer<typeof messageServiceSchema>; 