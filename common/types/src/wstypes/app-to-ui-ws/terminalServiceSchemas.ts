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

// Terminal service response schemas
export const executeCommandResponseSchema = z.object({
  type: z.literal('executeCommandResponse'),
  success: z.boolean(),
  output: z.string(),
  error: z.string().optional(),
  exitCode: z.number().optional(),
});

export const executeCommandRunUntilInterruptResponseSchema = z.object({
  type: z.literal('executeCommandRunUntilInterruptResponse'),
  success: z.boolean(),
  output: z.string(),
  error: z.string().optional(),
  processId: z.number().optional(),
});

export const executeCommandRunUntilErrorResponseSchema = z.object({
  type: z.literal('executeCommandRunUntilErrorResponse'),
  success: z.boolean(),
  output: z.string(),
  error: z.string().optional(),
  exitCode: z.number().optional(),
});

export const executeCommandWithStreamResponseSchema = z.object({
  type: z.literal('executeCommandWithStreamResponse'),
  success: z.boolean(),
  output: z.string(),
  error: z.string().optional(),
  streamId: z.string().optional(),
});

export const sendInterruptToTerminalResponseSchema = z.object({
  type: z.literal('sendInterruptToTerminalResponse'),
  success: z.boolean(),
  message: z.string(),
  error: z.string().optional(),
});

export const getTerminalStatusResponseSchema = z.object({
  type: z.literal('getTerminalStatusResponse'),
  status: z.object({
    isActive: z.boolean(),
    currentDirectory: z.string(),
    runningProcesses: z.array(z.object({
      pid: z.number(),
      command: z.string(),
    })),
  }),
  error: z.string().optional(),
});

export const setTerminalDirectoryResponseSchema = z.object({
  type: z.literal('setTerminalDirectoryResponse'),
  success: z.boolean(),
  message: z.string(),
  currentDirectory: z.string().optional(),
  error: z.string().optional(),
});

export const getTerminalHistoryResponseSchema = z.object({
  type: z.literal('getTerminalHistoryResponse'),
  history: z.array(z.object({
    command: z.string(),
    output: z.string(),
    timestamp: z.string(),
    exitCode: z.number().optional(),
  })),
  error: z.string().optional(),
});

export const clearTerminalResponseSchema = z.object({
  type: z.literal('clearTerminalResponse'),
  success: z.boolean(),
  message: z.string(),
  error: z.string().optional(),
});

// Union of all terminal service schemas
export const terminalServiceSchema = z.union([
  terminalMcpToolConfirmationSchema,
  terminalMcpToolExecutingSchema,
  terminalMcpToolSuccessSchema,
  terminalMcpToolErrorSchema,
  terminalMcpToolRejectedSchema,
  executeCommandResponseSchema,
  executeCommandRunUntilInterruptResponseSchema,
  executeCommandRunUntilErrorResponseSchema,
  executeCommandWithStreamResponseSchema,
  sendInterruptToTerminalResponseSchema,
  getTerminalStatusResponseSchema,
  setTerminalDirectoryResponseSchema,
  getTerminalHistoryResponseSchema,
  clearTerminalResponseSchema,
]);

// Inferred TypeScript types
export type TerminalMcpToolConfirmation = z.infer<typeof terminalMcpToolConfirmationSchema>;
export type TerminalMcpToolExecuting = z.infer<typeof terminalMcpToolExecutingSchema>;
export type TerminalMcpToolSuccess = z.infer<typeof terminalMcpToolSuccessSchema>;
export type TerminalMcpToolError = z.infer<typeof terminalMcpToolErrorSchema>;
export type TerminalMcpToolRejected = z.infer<typeof terminalMcpToolRejectedSchema>;
export type ExecuteCommandResponse = z.infer<typeof executeCommandResponseSchema>;
export type ExecuteCommandRunUntilInterruptResponse = z.infer<typeof executeCommandRunUntilInterruptResponseSchema>;
export type ExecuteCommandRunUntilErrorResponse = z.infer<typeof executeCommandRunUntilErrorResponseSchema>;
export type ExecuteCommandWithStreamResponse = z.infer<typeof executeCommandWithStreamResponseSchema>;
export type SendInterruptToTerminalResponse = z.infer<typeof sendInterruptToTerminalResponseSchema>;
export type GetTerminalStatusResponse = z.infer<typeof getTerminalStatusResponseSchema>;
export type SetTerminalDirectoryResponse = z.infer<typeof setTerminalDirectoryResponseSchema>;
export type GetTerminalHistoryResponse = z.infer<typeof getTerminalHistoryResponseSchema>;
export type ClearTerminalResponse = z.infer<typeof clearTerminalResponseSchema>;
export type TerminalService = z.infer<typeof terminalServiceSchema>; 