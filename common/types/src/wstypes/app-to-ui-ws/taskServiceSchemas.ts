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

// Task service response schemas
export const addTaskResponseSchema = z.object({
  type: z.literal('addTaskResponse'),
  success: z.boolean(),
  error: z.string().optional(),
  data: z.any().optional(),
});

export const updateTasksResponseSchema = z.object({
  type: z.literal('updateTasksResponse'),
  success: z.boolean(),
  error: z.string().optional(),
  data: z.any().optional(),
  agentId: z.string(),
});

export const addSubTaskResponseSchema = z.object({
  type: z.literal('addSubTaskResponse'),
  success: z.boolean(),
  error: z.string().optional(),
  data: z.any().optional(),
});

export const updateSubTaskResponseSchema = z.object({
  type: z.literal('updateSubTaskResponse'),
  success: z.boolean(),
  error: z.string().optional(),
  data: z.any().optional(),
});

export const deleteTaskResponseSchema = z.object({
  type: z.literal('deleteTaskResponse'),
  success: z.boolean(),
  error: z.string().optional(),
  data: z.any().optional(),
});

export const createTasksFromMarkdownResponseSchema = z.object({
  type: z.literal('createTasksFromMarkdownResponse'),
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  agentId: z.string().optional(),
});

export const getTasksResponseSchema = z.object({
  type: z.literal('getTasksResponse'),
  tasks: z.array(z.any()),
  error: z.string().optional(),
});

export const getTasksByAgentResponseSchema = z.object({
  type: z.literal('getTasksByAgentResponse'),
  tasks: z.array(z.any()),
  agentId: z.string(),
  error: z.string().optional(),
});

export const getTasksByCategoryResponseSchema = z.object({
  type: z.literal('getTasksByCategoryResponse'),
  tasks: z.array(z.any()),
  category: z.string(),
  success: z.boolean().optional(),
  error: z.string().optional(),
});

export const getAllAgentsResponseSchema = z.object({
  type: z.literal('getAllAgentsResponse'),
  agents: z.array(z.any()),
  error: z.string().optional(),
});

export const exportTasksToMarkdownResponseSchema = z.object({
  type: z.literal('exportTasksToMarkdownResponse'),
  success: z.boolean(),
  data: z.string().optional(),
  agentId: z.string().optional(),
  error: z.string().optional(),
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
  addTaskResponseSchema,
  updateTasksResponseSchema,
  addSubTaskResponseSchema,
  updateSubTaskResponseSchema,
  deleteTaskResponseSchema,
  createTasksFromMarkdownResponseSchema,
  getTasksResponseSchema,
  getTasksByAgentResponseSchema,
  getTasksByCategoryResponseSchema,
  getAllAgentsResponseSchema,
  exportTasksToMarkdownResponseSchema,
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
export type AddTaskResponse = z.infer<typeof addTaskResponseSchema>;
export type UpdateTasksResponse = z.infer<typeof updateTasksResponseSchema>;
export type AddSubTaskResponse = z.infer<typeof addSubTaskResponseSchema>;
export type UpdateSubTaskResponse = z.infer<typeof updateSubTaskResponseSchema>;
export type DeleteTaskResponse = z.infer<typeof deleteTaskResponseSchema>;
export type CreateTasksFromMarkdownResponse = z.infer<typeof createTasksFromMarkdownResponseSchema>;
export type GetTasksResponse = z.infer<typeof getTasksResponseSchema>;
export type GetTasksByAgentResponse = z.infer<typeof getTasksByAgentResponseSchema>;
export type GetTasksByCategoryResponse = z.infer<typeof getTasksByCategoryResponseSchema>;
export type GetAllAgentsResponse = z.infer<typeof getAllAgentsResponseSchema>;
export type ExportTasksToMarkdownResponse = z.infer<typeof exportTasksToMarkdownResponseSchema>;
export type TaskErrorResponse = z.infer<typeof taskErrorResponseSchema>;
export type GetTaskByIdResponse = z.infer<typeof getTaskByIdResponseSchema>;
export type CompleteTaskResponse = z.infer<typeof completeTaskResponseSchema>;
export type AssignTaskResponse = z.infer<typeof assignTaskResponseSchema>;
export type GetTaskStatusResponse = z.infer<typeof getTaskStatusResponseSchema>;
export type PrioritizeTaskResponse = z.infer<typeof prioritizeTaskResponseSchema>;
export type TaskService = z.infer<typeof taskServiceSchema>;
export type TaskServiceMessage = z.infer<typeof taskServiceMessageSchema>; 