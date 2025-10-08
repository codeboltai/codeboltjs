import { z } from 'zod';
import { baseMessageSchema } from './coreMessageSchemas';

/**
 * Browser Service Message Schemas
 * Based on browserService.ts
 */

// Browser response schemas
export const newPageResponseSchema = z.object({
  type: z.literal('newPageResponse'),
});

export const browserErrorResponseSchema = z.object({
  type: z.literal('error'),
  message: z.string(),
});

export const browserActionResponseSchema = z.object({
  event: z.literal('browserActionResponse'),
  eventId: z.string(),
  payload: z.object({
    content: z.any(),
    viewport: z.object({
      width: z.number(),
      height: z.number(),
    }),
    currentUrl: z.string().optional(),
    currentMousePosition: z.object({
      x: z.number(),
      y: z.number(),
    }).optional(),
  }),
});

// Browser MCP tool execution schemas
export const browserMcpToolConfirmationSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('browser'),
    toolName: z.string(),
    serverName: z.literal('codebolt-browser'),
    params: z.any(),
    stateEvent: z.literal('ASK_FOR_CONFIRMATION'),
  }),
});

export const browserMcpToolExecutingSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('browser'),
    toolName: z.string(),
    serverName: z.literal('codebolt-browser'),
    params: z.any(),
    stateEvent: z.literal('EXECUTING'),
  }),
});

export const browserMcpToolSuccessSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('browser'),
    toolName: z.string(),
    serverName: z.literal('codebolt-browser'),
    params: z.any(),
    result: z.any(),
    stateEvent: z.literal('EXECUTION_SUCCESS'),
  }),
});

export const browserMcpToolErrorSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('browser'),
    toolName: z.string(),
    serverName: z.literal('codebolt-browser'),
    params: z.any(),
    result: z.string(),
    stateEvent: z.literal('EXECUTION_ERROR'),
  }),
});

export const browserMcpToolRejectedSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('browser'),
    toolName: z.string(),
    serverName: z.literal('codebolt-browser'),
    params: z.any(),
    stateEvent: z.literal('REJECTED'),
  }),
});

// Browser action enum schema
export const browserActionEnumSchema = z.enum([
  'launch',
  'click',
  'type',
  'scroll_down',
  'scroll_up',
  'close',
  'getHtml',
  'getContent',
  'getMarkdown',
  'screenshot',
  'extractText',
  'browserEnter',
  'getPdf',
]);

// Browser action message schema
export const browserActionMessageSchema = z.object({
  type: z.literal('browser'),
  action: browserActionEnumSchema,
  url: z.string().optional(),
  selector: z.string().optional(),
  text: z.string().optional(),
  coordinate: z.string().optional(),
  fullPage: z.boolean().optional(),
  timeout: z.number().optional(),
  key: z.string().optional(),
  threadId: z.string().optional(),
  messageId: z.string().optional(),
});

// Union of all browser service schemas
export const browserServiceMessageSchema = z.union([
  newPageResponseSchema,
  browserErrorResponseSchema,
  browserActionResponseSchema,
  browserMcpToolConfirmationSchema,
  browserMcpToolExecutingSchema,
  browserMcpToolSuccessSchema,
  browserMcpToolErrorSchema,
  browserMcpToolRejectedSchema,
  browserActionMessageSchema,
]);

// TypeScript types
export type NewPageResponse = z.infer<typeof newPageResponseSchema>;
export type BrowserErrorResponse = z.infer<typeof browserErrorResponseSchema>;
export type BrowserActionResponse = z.infer<typeof browserActionResponseSchema>;
export type BrowserMcpToolConfirmation = z.infer<typeof browserMcpToolConfirmationSchema>;
export type BrowserMcpToolExecuting = z.infer<typeof browserMcpToolExecutingSchema>;
export type BrowserMcpToolSuccess = z.infer<typeof browserMcpToolSuccessSchema>;
export type BrowserMcpToolError = z.infer<typeof browserMcpToolErrorSchema>;
export type BrowserMcpToolRejected = z.infer<typeof browserMcpToolRejectedSchema>;
export type BrowserActionEnum = z.infer<typeof browserActionEnumSchema>;
export type BrowserActionMessage = z.infer<typeof browserActionMessageSchema>;
export type BrowserServiceMessage = z.infer<typeof browserServiceMessageSchema>; 