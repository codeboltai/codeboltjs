import { z } from 'zod';

/**
 * Core Message Schemas for App-to-UI Communication
 * Based on src/main/server/utils/messages.ts and common message patterns
 */

// Template enum schema
export const templateEnumSchema = z.enum([
  'AGENT',
  'CODEVIEWINEDITOR',
  'CODECONFIRMATION',
  'INFOWITHLINK',
  'READFILE',
  'WRITEFILE',
  'CODEBASESEARCH',
  'MCP_TOOL',
  'CONFIRMATION',
  'MEMORY_CONFIRMATION',
  'BROWSER_CONFIRMATION',
  'NOTIFICATION',
  "agentChat"
]);

// Sender enum schema
export const senderEnumSchema = z.enum([
  'agent',
  'user',
  'system'
]);

// WebSocket message type schema
export const webSocketMessageTypeSchema = z.enum([
  'sendMessage',
  'processStoped',
  'processFinished',
  'waitforReply',
  'confirmationRequest',
  'fileReadWriteRequest',
  'confirmationWithFeedback',
  'processStarted',
  'crawlerEvent',
  'browserEvent',
  'fsEvent',
  'executeCommand',
  'executeCommandRunUnitlInterrupt',
  'executeCommandRunUntilError',
  'executeCommandWithStream',
  'sendInterruptToTerminal',
  'settingEvent',
  'inference',
  'gitEvent',
  'memoryEvent',
  'getChatHistory',
  'getAppState',
  'projectStateEvent',
  'taskEvent',
  'vectordbEvent',
  'debugEvent',
  'tokenizerEvent',
  'codeEvent',
  'problemMatchEvent',
  'treeSitterEvent',
  'agentStateEvent',
  'notificationEvent',
  'chatSummaryEvent',
  'codebolttools',
  'agentEvent',
  'agentResponse'
]);

// Component type schema
export const componentTypeSchema = z.enum([
  'Planner',
  'Editor',
  'Terminal',
  'Browser',
  'Preview',
  'Git',
  'Debug'
]);

// Base message schema
export const baseMessageSchema = z.object({
  type: z.string(),
  actionType: webSocketMessageTypeSchema.optional(),
  sender: senderEnumSchema.optional(),
  messageId: z.string(),
  threadId: z.string(),
  templateType: templateEnumSchema.optional(),
  timestamp: z.union([z.number(), z.string()]).optional(),
  agentInstanceId: z.string().optional(),
  agentId: z.string().optional(),
  parentAgentInstanceId: z.string().optional(),
  parentId: z.string().optional(),
  parentAgentId: z.string().optional(),
});

// Button option schema
export const buttonOptionSchema = z.object({
  text: z.string(),
  value: z.string(),
  buttonClickedText: z.string().optional(),
});

// Payload schema for different message types
export const messagePayloadSchema = z.object({
  type: z.string().optional(),
  path: z.string().optional(),
  content: z.string().optional(),
  command: z.string().optional(),
  actionType: z.string().optional(),
  processId: z.number().optional(),
  stateEvent: z.string().optional(),
  toolName: z.string().optional(),
  serverName: z.string().optional(),
  params: z.record(z.any()).optional(),
}).passthrough();

// Data schema for message content
export const messageDataSchema = z.object({
  text: z.string(),
  payload: messagePayloadSchema.optional(),
  linkUrl: componentTypeSchema.optional(),
  task: z.string().optional(),
}).passthrough();

// Core message schema
export const coreMessageSchema = baseMessageSchema.extend({
  content: z.union([z.string(), z.object({}).passthrough()]),
  data: messageDataSchema.optional(),
  payload: messagePayloadSchema.optional(),
  buttons: z.array(buttonOptionSchema).optional(),
});

// Send message schema
export const sendMessageSchema = coreMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('sendMessage'),
  templateType: templateEnumSchema,
});

// Process started schema
export const processStartedSchema = coreMessageSchema.extend({
  type: z.literal('processStarted'),
  actionType: webSocketMessageTypeSchema,
  templateType: z.literal('INFOWITHLINK'),
  data: z.object({
    text: z.string(),
    linkUrl: componentTypeSchema,
  }),
});

// Process stopped schema
export const processStoppedSchema = coreMessageSchema.extend({
  type: z.literal('processStoped'),
  actionType: z.literal('processStoped'),
  templateType: z.literal('INFOWITHLINK'),
  data: z.object({
    text: z.string(),
    linkUrl: componentTypeSchema,
  }),
});

// Wait for reply schema
export const waitForReplySchema = coreMessageSchema.extend({
  actionType: z.literal('waitforReply'),
  buttons: z.array(buttonOptionSchema),
});

// Confirmation request schema
export const confirmationRequestSchema = coreMessageSchema.extend({
  actionType: z.literal('confirmationRequest'),
  templateType: z.literal('CONFIRMATION'),
  buttons: z.array(buttonOptionSchema),
});

// Info with link schema
export const infoWithLinkSchema = coreMessageSchema.extend({
  templateType: z.literal('INFOWITHLINK'),
  data: z.object({
    text: z.string(),
    linkUrl: componentTypeSchema,
  }),
});

// Code view in editor schema
export const codeViewInEditorSchema = coreMessageSchema.extend({
  templateType: z.literal('CODEVIEWINEDITOR'),
  payload: z.object({
    type: z.literal('file'),
    path: z.string(),
    content: z.string(),
  }),
});

// Code confirmation schema
export const codeConfirmationSchema = coreMessageSchema.extend({
  templateType: z.literal('CODECONFIRMATION'),
  payload: z.object({
    type: z.literal('command'),
    command: z.string(),
  }),
  buttons: z.array(buttonOptionSchema),
});

// Union of all core message schemas
export const allCoreMessagesSchema = z.union([
  sendMessageSchema,
  processStartedSchema,
  processStoppedSchema,
  waitForReplySchema,
  confirmationRequestSchema,
  infoWithLinkSchema,
  codeViewInEditorSchema,
  codeConfirmationSchema,
]);

// Inferred TypeScript types
export type TemplateEnum = z.infer<typeof templateEnumSchema>;
export type SenderEnum = z.infer<typeof senderEnumSchema>;
export type WebSocketMessageType = z.infer<typeof webSocketMessageTypeSchema>;
export type ComponentType = z.infer<typeof componentTypeSchema>;
export type BaseMessage = z.infer<typeof baseMessageSchema>;
export type ButtonOption = z.infer<typeof buttonOptionSchema>;
export type MessagePayload = z.infer<typeof messagePayloadSchema>;
export type MessageData = z.infer<typeof messageDataSchema>;
export type CoreMessage = z.infer<typeof coreMessageSchema>;
export type SendMessage = z.infer<typeof sendMessageSchema>;
export type ProcessStarted = z.infer<typeof processStartedSchema>;
export type ProcessStopped = z.infer<typeof processStoppedSchema>;
export type WaitForReply = z.infer<typeof waitForReplySchema>;
export type ConfirmationRequest = z.infer<typeof confirmationRequestSchema>;
export type InfoWithLink = z.infer<typeof infoWithLinkSchema>;
export type CodeViewInEditor = z.infer<typeof codeViewInEditorSchema>;
export type CodeConfirmation = z.infer<typeof codeConfirmationSchema>;
export type AllCoreMessages = z.infer<typeof allCoreMessagesSchema>; 