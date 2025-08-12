import { z } from 'zod';
import { AgentMessageBaseSchema } from './baseSchemas';

/**
 * Todo Notification Schemas for Agent-to-App Communication
 * Based on notification types in src/types/notification/todo.ts
 */

// Base todo notification schema
export const todoNotificationBaseSchema = AgentMessageBaseSchema.extend({
  toolUseId: z.string(),
  type: z.literal('tasknotify'),
  action: z.string(),
});

// Add Todo Request
export const addTodoRequestNotificationSchema = todoNotificationBaseSchema.extend({
  action: z.literal('addTaskRequest'),
  data: z.object({
    title: z.string().optional(),
    agentId: z.string().optional(),
    description: z.string().optional(),
    phase: z.string().optional(),
    category: z.string().optional(),
    priority: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

// Add Todo Response
export const addTodoResponseNotificationSchema = todoNotificationBaseSchema.extend({
  action: z.literal('addTaskResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
});

// Get Todo Request
export const getTodoRequestNotificationSchema = todoNotificationBaseSchema.extend({
  action: z.literal('getTasksRequest'),
  data: z.object({
    filters: z.any().optional(),
  }),
});

// Get Todo Response
export const getTodoTasksResponseNotificationSchema = todoNotificationBaseSchema.extend({
  action: z.literal('getTasksResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
});

// Edit Todo Request
export const editTodoTaskRequestNotificationSchema = todoNotificationBaseSchema.extend({
  action: z.literal('updateTaskRequest'),
  data: z.object({
    taskId: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    phase: z.string().optional(),
    category: z.string().optional(),
    priority: z.string().optional(),
    tags: z.array(z.string()).optional(),
    status: z.string().optional(),
  }),
});

// Edit Todo Response
export const editTodoTaskResponseNotificationSchema = todoNotificationBaseSchema.extend({
  action: z.literal('updateTaskResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
});

// Union of all todo notification schemas
export const todoNotificationSchema = z.union([
  addTodoRequestNotificationSchema,
  addTodoResponseNotificationSchema,
  getTodoRequestNotificationSchema,
  getTodoTasksResponseNotificationSchema,
  editTodoTaskRequestNotificationSchema,
  editTodoTaskResponseNotificationSchema,
]);

// Inferred TypeScript types
export type TodoNotificationBase = z.infer<typeof todoNotificationBaseSchema>;
export type AddTodoRequestNotification = z.infer<typeof addTodoRequestNotificationSchema>;
export type AddTodoResponseNotification = z.infer<typeof addTodoResponseNotificationSchema>;
export type GetTodoRequestNotification = z.infer<typeof getTodoRequestNotificationSchema>;
export type GetTodoTasksResponseNotification = z.infer<typeof getTodoTasksResponseNotificationSchema>;
export type EditTodoTaskRequestNotification = z.infer<typeof editTodoTaskRequestNotificationSchema>;
export type EditTodoTaskResponseNotification = z.infer<typeof editTodoTaskResponseNotificationSchema>;

// Union types for convenience
export type TodoNotification = z.infer<typeof todoNotificationSchema>; 