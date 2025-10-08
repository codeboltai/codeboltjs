import { z } from 'zod';
import { baseMessageSchema } from './coreMessageSchemas';

/**
 * App Service Message Schemas
 * Based on appServerice.cli.ts
 */

// App state response schema
export const getAppStateResponseSchema = z.object({
  type: z.literal('getAppStateResponse'),
  state: z.any(),
});

// App MCP tool execution schemas
export const appMcpToolConfirmationSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('app'),
    toolName: z.string(),
    serverName: z.literal('codebolt-app'),
    params: z.any(),
    stateEvent: z.literal('ASK_FOR_CONFIRMATION'),
  }),
});

export const appMcpToolExecutingSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('app'),
    toolName: z.string(),
    serverName: z.literal('codebolt-app'),
    params: z.any(),
    stateEvent: z.literal('EXECUTING'),
  }),
});

export const appMcpToolSuccessSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('app'),
    toolName: z.string(),
    serverName: z.literal('codebolt-app'),
    params: z.any(),
    result: z.any(),
    stateEvent: z.literal('EXECUTION_SUCCESS'),
  }),
});

export const appMcpToolErrorSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('app'),
    toolName: z.string(),
    serverName: z.literal('codebolt-app'),
    params: z.any(),
    result: z.string(),
    stateEvent: z.literal('EXECUTION_ERROR'),
  }),
});

export const appMcpToolRejectedSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('app'),
    toolName: z.string(),
    serverName: z.literal('codebolt-app'),
    params: z.any(),
    stateEvent: z.literal('REJECTED'),
  }),
});


export const appErrorResponseSchema = z.object({
  type: z.literal('error'),
  message: z.string(),
});
// Union of all app service schemas
export const appServiceMessageSchema = z.union([
  appErrorResponseSchema,
  getAppStateResponseSchema,
  appMcpToolConfirmationSchema,
  appMcpToolExecutingSchema,
  appMcpToolSuccessSchema,
  appMcpToolErrorSchema,
  appMcpToolRejectedSchema,
]);

// TypeScript types
export type GetAppStateResponse = z.infer<typeof getAppStateResponseSchema>;
export type AppErrorResponse = z.infer<typeof appErrorResponseSchema>;export type AppMcpToolConfirmation = z.infer<typeof appMcpToolConfirmationSchema>;
export type AppErrorResponse = z.infer<typeof appErrorResponseSchema>;export type AppMcpToolExecuting = z.infer<typeof appMcpToolExecutingSchema>;
export type AppErrorResponse = z.infer<typeof appErrorResponseSchema>;export type AppMcpToolSuccess = z.infer<typeof appMcpToolSuccessSchema>;
export type AppErrorResponse = z.infer<typeof appErrorResponseSchema>;export type AppMcpToolError = z.infer<typeof appMcpToolErrorSchema>;
export type AppErrorResponse = z.infer<typeof appErrorResponseSchema>;export type AppMcpToolRejected = z.infer<typeof appMcpToolRejectedSchema>;
export type AppErrorResponse = z.infer<typeof appErrorResponseSchema>;export type AppServiceMessage = z.infer<typeof appServiceMessageSchema>; 