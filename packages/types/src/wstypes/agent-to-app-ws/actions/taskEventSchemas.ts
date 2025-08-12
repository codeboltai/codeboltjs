import { z } from 'zod';

/**
 * Task Event Schemas for Agent-to-App Communication
 * Based on codeboltjs/src/modules/task.ts module operations
 */

// Base task message schema
export const taskEventBaseSchema = z.object({
  type: z.literal('taskEvent'),
  action: z.string(),
  requestId: z.string(),
});

// Task create options schema (for modern addTask)
const taskCreateOptionsSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  phase: z.string().optional(),
  category: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  tags: z.array(z.string()).optional(),
});

// Task update options schema
const taskUpdateOptionsSchema = z.object({
  taskId: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  phase: z.string().optional(),
  category: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  agentId: z.string().optional(),
  completed: z.boolean().optional(),
  task: z.string().optional(), // for legacy updateSimpleTask
});

// Task filter options schema
const taskFilterOptionsSchema = z.object({
  agentId: z.string().optional(),
  category: z.string().optional(),
  phase: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  tags: z.array(z.string()).optional(),
});

// SubTask options schema
const addSubTaskOptionsSchema = z.object({
  taskId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
});

const updateSubTaskOptionsSchema = z.object({
  taskId: z.string(),
  subtaskId: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  completed: z.boolean().optional(),
});

// Add Task Event Schema (modern)
export const addTaskEventSchema = taskEventBaseSchema.extend({
  action: z.literal('addTask'),
  agentId: z.string().optional(),
  message: taskCreateOptionsSchema,
});

// Add Simple Task Event Schema (legacy support)
export const addSimpleTaskEventSchema = taskEventBaseSchema.extend({
  action: z.literal('addTask'),
  agentId: z.string().optional(),
  message: z.object({
    task: z.string(),
  }),
});

// Get Tasks Event Schema
export const getTasksEventSchema = taskEventBaseSchema.extend({
  action: z.literal('getTasks'),
  message: taskFilterOptionsSchema.optional(),
});

// Get Tasks By Agent Event Schema
export const getTasksByAgentEventSchema = taskEventBaseSchema.extend({
  action: z.literal('getTasksByAgent'),
  message: z.object({
    agentId: z.string(),
  }),
});

// Get Tasks By Category Event Schema
export const getTasksByCategoryEventSchema = taskEventBaseSchema.extend({
  action: z.literal('getTasksByCategory'),
  message: z.object({
    category: z.string(),
  }),
});

// Get All Agents Event Schema
export const getAllAgentsEventSchema = taskEventBaseSchema.extend({
  action: z.literal('getAllAgents'),
});

// Update Task Event Schema
export const updateTaskEventSchema = taskEventBaseSchema.extend({
  action: z.literal('updateTask'),
  message: taskUpdateOptionsSchema,
});

// Delete Task Event Schema
export const deleteTaskEventSchema = taskEventBaseSchema.extend({
  action: z.literal('deleteTask'),
  message: z.object({
    taskId: z.string(),
  }),
});

// Add SubTask Event Schema
export const addSubTaskEventSchema = taskEventBaseSchema.extend({
  action: z.literal('addSubTask'),
  message: addSubTaskOptionsSchema,
});

// Update SubTask Event Schema
export const updateSubTaskEventSchema = taskEventBaseSchema.extend({
  action: z.literal('updateSubTask'),
  message: updateSubTaskOptionsSchema,
});

// Delete SubTask Event Schema
export const deleteSubTaskEventSchema = taskEventBaseSchema.extend({
  action: z.literal('deleteSubTask'),
  message: z.object({
    taskId: z.string(),
    subtaskId: z.string(),
  }),
});

// Create Tasks From Markdown Event Schema
export const createTasksFromMarkdownEventSchema = taskEventBaseSchema.extend({
  action: z.literal('createTasksFromMarkdown'),
  agentId: z.string().optional(),
  message: z.object({
    markdown: z.string(),
    phase: z.string().optional(),
    category: z.string().optional(),
  }),
});

// Export Tasks To Markdown Event Schema
export const exportTasksToMarkdownEventSchema = taskEventBaseSchema.extend({
  action: z.literal('exportTasksToMarkdown'),
  message: z.object({
    agentId: z.string().optional(),
    phase: z.string().optional(),
    category: z.string().optional(),
  }).optional(),
});

// Union of all task event schemas
export const taskEventSchema = z.union([
  addTaskEventSchema,
  addSimpleTaskEventSchema,
  getTasksEventSchema,
  getTasksByAgentEventSchema,
  getTasksByCategoryEventSchema,
  getAllAgentsEventSchema,
  updateTaskEventSchema,
  deleteTaskEventSchema,
  addSubTaskEventSchema,
  updateSubTaskEventSchema,
  deleteSubTaskEventSchema,
  createTasksFromMarkdownEventSchema,
  exportTasksToMarkdownEventSchema,
]);

// Inferred TypeScript types for events
export type TaskEventBase = z.infer<typeof taskEventBaseSchema>;
export type TaskCreateOptions = z.infer<typeof taskCreateOptionsSchema>;
export type TaskUpdateOptions = z.infer<typeof taskUpdateOptionsSchema>;
export type TaskFilterOptions = z.infer<typeof taskFilterOptionsSchema>;
export type AddSubTaskOptions = z.infer<typeof addSubTaskOptionsSchema>;
export type UpdateSubTaskOptions = z.infer<typeof updateSubTaskOptionsSchema>;

export type AddTaskEvent = z.infer<typeof addTaskEventSchema>;
export type AddSimpleTaskEvent = z.infer<typeof addSimpleTaskEventSchema>;
export type GetTasksEvent = z.infer<typeof getTasksEventSchema>;
export type GetTasksByAgentEvent = z.infer<typeof getTasksByAgentEventSchema>;
export type GetTasksByCategoryEvent = z.infer<typeof getTasksByCategoryEventSchema>;
export type GetAllAgentsEvent = z.infer<typeof getAllAgentsEventSchema>;
export type UpdateTaskEvent = z.infer<typeof updateTaskEventSchema>;
export type DeleteTaskEvent = z.infer<typeof deleteTaskEventSchema>;
export type AddSubTaskEvent = z.infer<typeof addSubTaskEventSchema>;
export type UpdateSubTaskEvent = z.infer<typeof updateSubTaskEventSchema>;
export type DeleteSubTaskEvent = z.infer<typeof deleteSubTaskEventSchema>;
export type CreateTasksFromMarkdownEvent = z.infer<typeof createTasksFromMarkdownEventSchema>;
export type ExportTasksToMarkdownEvent = z.infer<typeof exportTasksToMarkdownEventSchema>;
export type TaskEvent = z.infer<typeof taskEventSchema>;

