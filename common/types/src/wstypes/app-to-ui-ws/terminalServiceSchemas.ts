import { z } from 'zod';
import { baseMessageSchema } from './coreMessageSchemas';

/**
 * Terminal Service Message Schemas
 * Based on terminalService.cli.ts
 */

// Terminal MCP tool execution schemas
export const terminalMcpToolConfirmationSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('terminal'),
    toolName: z.string(),
    serverName: z.literal('codebolt-terminal'),
    params: z.any(),
    stateEvent: z.literal('ASK_FOR_CONFIRMATION'),
  }),
});

export const terminalMcpToolExecutingSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('terminal'),
    toolName: z.string(),
    serverName: z.literal('codebolt-terminal'),
    params: z.any(),
    stateEvent: z.literal('EXECUTING'),
  }),
});

export const terminalMcpToolSuccessSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('terminal'),
    toolName: z.string(),
    serverName: z.literal('codebolt-terminal'),
    params: z.any(),
    result: z.any(),
    stateEvent: z.literal('EXECUTION_SUCCESS'),
  }),
});

export const terminalMcpToolErrorSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('terminal'),
    toolName: z.string(),
    serverName: z.literal('codebolt-terminal'),
    params: z.any(),
    result: z.string(),
    stateEvent: z.literal('EXECUTION_ERROR'),
  }),
});

export const terminalMcpToolRejectedSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('terminal'),
    toolName: z.string(),
    serverName: z.literal('codebolt-terminal'),
    params: z.any(),
    stateEvent: z.literal('REJECTED'),
  }),
});


// Union of all terminal service schemas
export const terminalServiceSchema = z.union([
  terminalMcpToolConfirmationSchema,
  terminalMcpToolExecutingSchema,
  terminalMcpToolSuccessSchema,
  terminalMcpToolErrorSchema,
  terminalMcpToolRejectedSchema
]);

// Inferred TypeScript types
export type TerminalMcpToolConfirmation = z.infer<typeof terminalMcpToolConfirmationSchema>;
export type TerminalMcpToolExecuting = z.infer<typeof terminalMcpToolExecutingSchema>;
export type TerminalMcpToolSuccess = z.infer<typeof terminalMcpToolSuccessSchema>;
export type TerminalMcpToolError = z.infer<typeof terminalMcpToolErrorSchema>;
export type TerminalMcpToolRejected = z.infer<typeof terminalMcpToolRejectedSchema>;

export type TerminalService = z.infer<typeof terminalServiceSchema>; 