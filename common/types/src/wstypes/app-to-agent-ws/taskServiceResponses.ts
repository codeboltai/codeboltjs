import { z } from 'zod';

/**
 * Task Service Response Schemas
 * Messages sent from task CLI service back to agents
 * Based on task-service.cli.ts response structure
 */

// Task Status enum
export const taskStatusSchema = z.enum([
  'created',
  'planned',
  'pending',
  'in_progress',
  'waiting_user',
  'review',
  'completed',
  'cancelled',
  'failed',
  'active'
]);

// Task Priority enum
export const taskPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);

// Base Task schema
export const taskSchema = z.object({
  id: z.number().optional(),
  taskId: z.string(),
  projectId: z.number().optional(),
  projectPath: z.string().optional(),
  projectName: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  dueDate: z.union([z.date(), z.string()]).optional(),
  status: taskStatusSchema,
  completed: z.boolean(),
  groupId: z.string(),
  dependsOnTaskId: z.string().optional(),
  dependsOnTaskName: z.string().optional(),
  assignedTo: z.string().optional(),
  priority: taskPrioritySchema,
  parentTaskId: z.string().optional(),
  order: z.number().optional(),
  flowData: z.any().optional(),
  tags: z.array(z.string()).optional(),
  errorMessage: z.string().optional(),
  cancellationReason: z.string().optional(),
  statusUpdatedAt: z.union([z.date(), z.string()]).optional(),
  completedAt: z.union([z.date(), z.string()]).optional(),
  createdAt: z.union([z.date(), z.string()]).optional(),
  updatedAt: z.union([z.date(), z.string()]).optional(),
  mentionedFiles: z.array(z.string()).optional(),
  mentionedFolders: z.array(z.string()).optional(),
  mentionedMultiFile: z.array(z.string()).optional(),
  mentionedMCPs: z.array(z.string()).optional(),
  uploadedImages: z.array(z.string()).optional(),
  mentionedAgents: z.array(z.any()).optional(),
  mentionedDocs: z.array(z.any()).optional(),
  controlFiles: z.array(z.any()).optional(),
  links: z.array(z.string()).optional(),
  selectedAgent: z.any().optional(),
  selection: z.any().optional(),
  children: z.array(z.any()).optional(),
  messages: z.array(z.any()).optional(),
});

// Create task response (for addTask/createTask operations)
export const createTaskResponseSchema = z.object({
  type: z.literal('createTaskResponse'),
  success: z.boolean(),
  task: taskSchema.nullable(),
  error: z.string().optional(),
});

// Update task response
export const updateTaskResponseSchema = z.object({
  type: z.literal('updateTaskResponse'),
  success: z.boolean(),
  task: taskSchema.nullable(),
  error: z.string().optional(),
});

// Delete task response
export const deleteTaskResponseSchema = z.object({
  type: z.literal('deleteTaskResponse'),
  success: z.boolean(),
  taskId: z.string(),
  deleted: z.boolean(),
  error: z.string().optional(),
});

// Get task response
export const getTaskResponseSchema = z.object({
  type: z.literal('getTaskResponse'),
  success: z.boolean(),
  task: taskSchema.nullable(),
  taskId: z.string(),
  error: z.string().optional(),
});

// List tasks response
export const listTasksResponseSchema = z.object({
  type: z.literal('listTasksResponse'),
  success: z.boolean(),
  tasks: z.array(taskSchema),
  totalCount: z.number(),
  error: z.string().optional(),
});

// Assign agent response
export const assignAgentResponseSchema = z.object({
  type: z.literal('assignAgentResponse'),
  success: z.boolean(),
  task: taskSchema.nullable(),
  taskId: z.string(),
  agentId: z.string(),
  error: z.string().optional(),
});

// Start task with agent response
export const startTaskWithAgentResponseSchema = z.object({
  type: z.literal('startTaskWithAgentResponse'),
  success: z.boolean(),
  task: taskSchema.nullable(),
  taskId: z.string(),
  agentId: z.string(),
  activityId: z.string().optional(),
  error: z.string().optional(),
});

// Error response
export const taskErrorResponseSchema = z.object({
  type: z.literal('errorResponse'),
  success: z.boolean(),
  error: z.string(),
});

// Legacy response schemas for backward compatibility
export const addTaskResponseSchema = z.object({
  type: z.literal('addTaskResponse'),
  success: z.boolean(),
  error: z.string().optional(),
  data: z.any().optional(),
  agentId: z.string().optional(),
});

export const updateTasksResponseSchema = z.object({
  type: z.literal('updateTasksResponse'),
  success: z.boolean(),
  error: z.string().optional(),
  data: z.any().optional(),
  agentId: z.string().optional(),
});

export const addSubTaskResponseSchema = z.object({
  type: z.literal('addSubTaskResponse'),
  success: z.boolean(),
  error: z.string().optional(),
  data: z.any().optional(),
  agentId: z.string().optional(),
});

export const updateSubTaskResponseSchema = z.object({
  type: z.literal('updateSubTaskResponse'),
  success: z.boolean(),
  error: z.string().optional(),
  data: z.any().optional(),
  agentId: z.string().optional(),
});

export const getTasksByCategoryResponseSchema = z.object({
  type: z.literal('getTasksByCategoryResponse'),
  success: z.boolean(),
  error: z.string().optional(),
  data: z.any().optional(),
  agentId: z.string().optional(),
});

export const createTasksFromMarkdownResponseSchema = z.object({
  type: z.literal('createTasksFromMarkdownResponse'),
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  agentId: z.string().optional(),
});

export const exportTasksToMarkdownResponseSchema = z.object({
  type: z.literal('exportTasksToMarkdownResponse'),
  success: z.boolean(),
  data: z.string().optional(),
  agentId: z.string().optional(),
});

// Union of all task service responses
export const taskServiceResponseSchema = z.union([
  createTaskResponseSchema,
  updateTaskResponseSchema,
  deleteTaskResponseSchema,
  getTaskResponseSchema,
  listTasksResponseSchema,
  assignAgentResponseSchema,
  startTaskWithAgentResponseSchema,
  taskErrorResponseSchema,
  // Legacy schemas
  addTaskResponseSchema,
  updateTasksResponseSchema,
  addSubTaskResponseSchema,
  updateSubTaskResponseSchema,
  getTasksByCategoryResponseSchema,
  createTasksFromMarkdownResponseSchema,
  exportTasksToMarkdownResponseSchema,
]);

// TypeScript types
export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type TaskPriority = z.infer<typeof taskPrioritySchema>;
export type Task = z.infer<typeof taskSchema>;
export type CreateTaskResponse = z.infer<typeof createTaskResponseSchema>;
export type UpdateTaskResponse = z.infer<typeof updateTaskResponseSchema>;
export type DeleteTaskResponse = z.infer<typeof deleteTaskResponseSchema>;
export type GetTaskResponse = z.infer<typeof getTaskResponseSchema>;
export type ListTasksResponse = z.infer<typeof listTasksResponseSchema>;
export type AssignAgentResponse = z.infer<typeof assignAgentResponseSchema>;
export type StartTaskWithAgentResponse = z.infer<typeof startTaskWithAgentResponseSchema>;
export type TaskErrorResponse = z.infer<typeof taskErrorResponseSchema>;

// Legacy types
export type AddTaskResponse = z.infer<typeof addTaskResponseSchema>;
export type UpdateTasksResponse = z.infer<typeof updateTasksResponseSchema>;
export type AddSubTaskResponse = z.infer<typeof addSubTaskResponseSchema>;
export type UpdateSubTaskResponse = z.infer<typeof updateSubTaskResponseSchema>;
export type GetTasksByCategoryResponse = z.infer<typeof getTasksByCategoryResponseSchema>;
export type CreateTasksFromMarkdownResponse = z.infer<typeof createTasksFromMarkdownResponseSchema>;
export type ExportTasksToMarkdownResponse = z.infer<typeof exportTasksToMarkdownResponseSchema>;

export type TaskServiceResponse = z.infer<typeof taskServiceResponseSchema>;