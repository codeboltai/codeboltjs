import { z } from 'zod';

/**
 * Task Service Response Schemas
 * Messages sent from task CLI service back to agents
 */

// Task response schema
export const TaskResponseSchema = z.object({
  type: z.union([
    z.literal('addTaskResponse'),
    z.literal('getTasksResponse'),
    z.literal('updateTasksResponse'),
    z.literal('deleteTaskResponse'),
    z.literal('addSubTaskResponse'),
    z.literal('updateSubTaskResponse'),
    z.literal('getTasksByAgentResponse')
  ]),
  requestId: z.string(),
  task: z.any().optional(),
  tasks: z.array(z.any()).optional(),
  data: z.any().optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  error: z.string().optional()
});

// Add task response schema
export const AddTaskResponseSchema = TaskResponseSchema.extend({
  type: z.literal('addTaskResponse')
});

// Get tasks response schema
export const GetTasksResponseSchema = TaskResponseSchema.extend({
  type: z.literal('getTasksResponse')
});

// Update tasks response schema
export const UpdateTasksResponseSchema = TaskResponseSchema.extend({
  type: z.literal('updateTasksResponse')
});

// Delete task response schema
export const DeleteTaskResponseSchema = TaskResponseSchema.extend({
  type: z.literal('deleteTaskResponse')
});

// Add sub task response schema
export const AddSubTaskResponseSchema = TaskResponseSchema.extend({
  type: z.literal('addSubTaskResponse')
});

// Update sub task response schema
export const UpdateSubTaskResponseSchema = TaskResponseSchema.extend({
  type: z.literal('updateSubTaskResponse')
});

// Get tasks by agent response schema
export const GetTasksByAgentResponseSchema = TaskResponseSchema.extend({
  type: z.literal('getTasksByAgentResponse')
});

// Union of all task service response schemas
export const TaskServiceResponseSchema = z.union([
  AddTaskResponseSchema,
  GetTasksResponseSchema,
  UpdateTasksResponseSchema,
  DeleteTaskResponseSchema,
  AddSubTaskResponseSchema,
  UpdateSubTaskResponseSchema,
  GetTasksByAgentResponseSchema
]);

// Export with the expected name for the index file
export const taskServiceResponseSchema = TaskServiceResponseSchema;

// Type exports
export type TaskResponse = z.infer<typeof TaskResponseSchema>;
export type AddTaskResponse = z.infer<typeof AddTaskResponseSchema>;
export type GetTasksResponse = z.infer<typeof GetTasksResponseSchema>;
export type UpdateTasksResponse = z.infer<typeof UpdateTasksResponseSchema>;
export type DeleteTaskResponse = z.infer<typeof DeleteTaskResponseSchema>;
export type AddSubTaskResponse = z.infer<typeof AddSubTaskResponseSchema>;
export type UpdateSubTaskResponse = z.infer<typeof UpdateSubTaskResponseSchema>;
export type GetTasksByAgentResponse = z.infer<typeof GetTasksByAgentResponseSchema>;
export type TaskServiceResponse = z.infer<typeof TaskServiceResponseSchema>; 