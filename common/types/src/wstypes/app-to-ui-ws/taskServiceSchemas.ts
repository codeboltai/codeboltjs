import { z } from 'zod';
import { baseMessageSchema } from './coreMessageSchemas';

/**
 * Task Service Message Schemas
 * Based on taskService.cli.ts
 */

// Task MCP tool execution schemas
export const taskMcpToolConfirmationSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('task'),
    toolName: z.string(),
    serverName: z.literal('codebolt-task'),
    params: z.any(),
    stateEvent: z.literal('ASK_FOR_CONFIRMATION'),
  }),
});

export const taskMcpToolExecutingSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('task'),
    toolName: z.string(),
    serverName: z.literal('codebolt-task'),
    params: z.any(),
    stateEvent: z.literal('EXECUTING'),
  }),
});

export const taskMcpToolSuccessSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('task'),
    toolName: z.string(),
    serverName: z.literal('codebolt-task'),
    params: z.any(),
    result: z.any(),
    stateEvent: z.literal('EXECUTION_SUCCESS'),
  }),
});

export const taskMcpToolErrorSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('task'),
    toolName: z.string(),
    serverName: z.literal('codebolt-task'),
    params: z.any(),
    result: z.string(),
    stateEvent: z.literal('EXECUTION_ERROR'),
  }),
});

export const taskMcpToolRejectedSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('task'),
    toolName: z.string(),
    serverName: z.literal('codebolt-task'),
    params: z.any(),
    stateEvent: z.literal('REJECTED'),
  }),
});


export const taskErrorResponseSchema = z.object({
  type: z.literal('error'),
  message: z.string(),
  error: z.string().optional(),
});

export const getTaskByIdResponseSchema = z.object({
  type: z.literal('getTaskByIdResponse'),
  task: z.any().optional(),
  error: z.string().optional(),
});

export const completeTaskResponseSchema = z.object({
  type: z.literal('completeTaskResponse'),
  success: z.boolean(),
  message: z.string(),
  error: z.string().optional(),
});

export const assignTaskResponseSchema = z.object({
  type: z.literal('assignTaskResponse'),
  success: z.boolean(),
  message: z.string(),
  error: z.string().optional(),
});

export const getTaskStatusResponseSchema = z.object({
  type: z.literal('getTaskStatusResponse'),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled', 'failed']),
  error: z.string().optional(),
});

export const prioritizeTaskResponseSchema = z.object({
  type: z.literal('prioritizeTaskResponse'),
  success: z.boolean(),
  message: z.string(),
  error: z.string().optional(),
});

// Union of all task service schemas
export const taskServiceSchema = z.union([
  taskMcpToolConfirmationSchema,
  taskMcpToolExecutingSchema,
  taskMcpToolSuccessSchema,
  taskMcpToolErrorSchema,
  taskMcpToolRejectedSchema,
  taskErrorResponseSchema,
  getTaskByIdResponseSchema,
  completeTaskResponseSchema,
  assignTaskResponseSchema,
  getTaskStatusResponseSchema,
  prioritizeTaskResponseSchema,
]);

export const taskServiceMessageSchema = taskServiceSchema;

// Inferred TypeScript types
export type TaskMcpToolConfirmation = z.infer<typeof taskMcpToolConfirmationSchema>;
export type TaskMcpToolExecuting = z.infer<typeof taskMcpToolExecutingSchema>;
export type TaskMcpToolSuccess = z.infer<typeof taskMcpToolSuccessSchema>;
export type TaskMcpToolError = z.infer<typeof taskMcpToolErrorSchema>;
export type TaskMcpToolRejected = z.infer<typeof taskMcpToolRejectedSchema>;

export type TaskErrorResponse = z.infer<typeof taskErrorResponseSchema>;
export type GetTaskByIdResponse = z.infer<typeof getTaskByIdResponseSchema>;
export type CompleteTaskResponse = z.infer<typeof completeTaskResponseSchema>;
export type AssignTaskResponse = z.infer<typeof assignTaskResponseSchema>;
export type GetTaskStatusResponse = z.infer<typeof getTaskStatusResponseSchema>;
export type PrioritizeTaskResponse = z.infer<typeof prioritizeTaskResponseSchema>;
export type TaskService = z.infer<typeof taskServiceSchema>;
export type TaskServiceMessage = z.infer<typeof taskServiceMessageSchema>; 