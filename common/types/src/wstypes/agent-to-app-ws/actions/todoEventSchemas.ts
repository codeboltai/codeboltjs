import { z } from 'zod';

/**
 * Todo Event Schemas for Agent-to-App Communication
 * Based on CodeBolt todoService.cli.ts operations
 */

// Base todo message schema
export const todoEventBaseSchema = z.object({
    type: z.literal('todoEvent'),
    action: z.string(),
    requestId: z.string(),
    agentId: z.string().optional(),
    threadId: z.string().optional(),
    agentInstanceId: z.string().optional(),
    parentAgentInstanceId: z.string().optional(),
    parentId: z.string().optional(),
});

// Todo Item Schema
export const todoItemSchema = z.object({
    id: z.string(),
    title: z.string(),
    status: z.enum(['pending', 'processing', 'completed', 'failed']),
    threadId: z.string(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    tags: z.array(z.string()).optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});

// Add Todo List Options Schema
export const addTodoListOptionsSchema = z.object({
    threadId: z.string(),
    title: z.string().optional(),
});

// Read Todo List Options Schema
export const readTodoListOptionsSchema = z.object({
    threadId: z.string().optional(),
});

// Create Todo List Options Schema
export const createTodoListOptionsSchema = z.object({
    threadId: z.string(),
    title: z.string().optional(),
    todos: z.array(z.object({
        title: z.string(),
        priority: z.enum(['low', 'medium', 'high']).optional(),
        tags: z.array(z.string()).optional(),
    })).optional(),
});

// Update Todo List Options Schema
export const updateTodoListOptionsSchema = z.object({
    threadId: z.string(),
    title: z.string().optional(),
    archived: z.boolean().optional(),
});

// Add Todo Item Options Schema
export const addTodoItemOptionsSchema = z.object({
    threadId: z.string(),
    title: z.string(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    tags: z.array(z.string()).optional(),
});

// Change Todo Item Status Options Schema
export const changeTodoItemStatusOptionsSchema = z.object({
    todoId: z.string(),
    status: z.enum(['pending', 'processing', 'completed', 'failed']),
});

// Get Todo Stats Options Schema
export const getTodoStatsOptionsSchema = z.object({
    threadId: z.string().optional(),
});

// Delete Todo Item Options Schema
export const deleteTodoItemOptionsSchema = z.object({
    todoId: z.string(),
});

// Archive Todo List Options Schema
export const archiveTodoListOptionsSchema = z.object({
    threadId: z.string(),
    archive: z.boolean().optional(),
});

// Unarchive Todo List Options Schema
export const unarchiveTodoListOptionsSchema = z.object({
    threadId: z.string(),
});

// Delete Completed Todos Options Schema
export const deleteCompletedTodosOptionsSchema = z.object({
    threadId: z.string().optional(),
});

// Response Schemas

// Todo List Schema (re-defined here for response usage if needed, or reuse existing if available)
export const todoListSchema = z.object({
    id: z.string(),
    title: z.string().optional(),
    toDos: z.array(todoItemSchema),
    archived: z.boolean().optional()
});

export const addTaskResponseSchema = z.object({
    type: z.literal('addTaskResponse'),
    success: z.boolean(),
    message: z.string(),
    error: z.object({
        code: z.string(),
        details: z.string()
    }).optional(),
    timestamp: z.string(),
    requestId: z.string().optional(),
    task: todoItemSchema.optional(), // Mapping TodoItem to task for compatibility or specific response field
    todoList: todoListSchema.optional()
});

export const getTasksResponseSchema = z.object({
    type: z.literal('getTasksResponse'),
    success: z.boolean(),
    message: z.string(),
    error: z.object({
        code: z.string(),
        details: z.string()
    }).optional(),
    timestamp: z.string(),
    requestId: z.string().optional(),
    tasks: z.array(todoItemSchema).optional(),
    todoList: todoListSchema.optional(),
    threads: z.record(todoListSchema).optional(),
    stats: z.object({
        total: z.number(),
        completed: z.number(),
        pending: z.number(),
        processing: z.number()
    }).optional()
});

export const updateTasksResponseSchema = z.object({
    type: z.literal('updateTasksResponse'),
    success: z.boolean(),
    message: z.string(),
    error: z.object({
        code: z.string(),
        details: z.string()
    }).optional(),
    timestamp: z.string(),
    requestId: z.string().optional(),
    task: todoItemSchema.optional(),
    todoList: todoListSchema.optional(),
    deleted: z.boolean().optional(),
    archived: z.boolean().optional(),
    deletedCount: z.number().optional()
});

export const todoServiceResponseSchema = z.union([
    addTaskResponseSchema,
    getTasksResponseSchema,
    updateTasksResponseSchema,
    z.object({
        type: z.literal('error'),
        success: z.boolean(),
        message: z.string(),
        error: z.string().optional(),
        timestamp: z.string(),
        requestId: z.string().optional()
    })
]);

// Response Types
export type TodoList = z.infer<typeof todoListSchema>;
export type AddTaskResponse = z.infer<typeof addTaskResponseSchema>;
export type GetTasksResponse = z.infer<typeof getTasksResponseSchema>;
export type UpdateTasksResponse = z.infer<typeof updateTasksResponseSchema>;
export type TodoServiceResponse = z.infer<typeof todoServiceResponseSchema>;

// Export Todos Options Schema
export const exportTodosOptionsSchema = z.object({
    threadId: z.string().optional(),
});

// Import Todos Options Schema
export const importTodosOptionsSchema = z.object({
    todos: z.array(todoItemSchema),
    threadId: z.string(),
    overwrite: z.boolean().optional(),
});

// Add Todo List Event Schema
export const addTodoListEventSchema = todoEventBaseSchema.extend({
    action: z.literal('addTodoList'),
    message: addTodoListOptionsSchema,
});

// Read Todo List Event Schema
export const readTodoListEventSchema = todoEventBaseSchema.extend({
    action: z.literal('readTodoList'),
    message: readTodoListOptionsSchema,
});

// Create Todo List Event Schema
export const createTodoListEventSchema = todoEventBaseSchema.extend({
    action: z.literal('createTodoList'),
    message: createTodoListOptionsSchema,
});

// Update Todo List Event Schema
export const updateTodoListEventSchema = todoEventBaseSchema.extend({
    action: z.literal('updateTodoList'),
    message: updateTodoListOptionsSchema,
});

// Add Todo Item Event Schema
export const addTodoItemEventSchema = todoEventBaseSchema.extend({
    action: z.literal('addTodoItem'),
    message: addTodoItemOptionsSchema,
});

// Change Todo Item Status Event Schema
export const changeTodoItemStatusEventSchema = todoEventBaseSchema.extend({
    action: z.literal('changeTodoItemStatus'),
    message: changeTodoItemStatusOptionsSchema,
});

// Get Todo Stats Event Schema
export const getTodoStatsEventSchema = todoEventBaseSchema.extend({
    action: z.literal('getTodoStats'),
    message: getTodoStatsOptionsSchema.optional(),
});

// Delete Todo Item Event Schema
export const deleteTodoItemEventSchema = todoEventBaseSchema.extend({
    action: z.literal('deleteTodoItem'),
    message: deleteTodoItemOptionsSchema,
});

// Archive Todo List Event Schema
export const archiveTodoListEventSchema = todoEventBaseSchema.extend({
    action: z.literal('archiveTodoList'),
    message: archiveTodoListOptionsSchema,
});

// Unarchive Todo List Event Schema
export const unarchiveTodoListEventSchema = todoEventBaseSchema.extend({
    action: z.literal('unarchiveTodoList'),
    message: unarchiveTodoListOptionsSchema,
});

// Delete Completed Todos Event Schema
export const deleteCompletedTodosEventSchema = todoEventBaseSchema.extend({
    action: z.literal('deleteCompletedTodos'),
    message: deleteCompletedTodosOptionsSchema.optional(),
});

// Export Todos Event Schema
export const exportTodosEventSchema = todoEventBaseSchema.extend({
    action: z.literal('exportTodos'),
    message: exportTodosOptionsSchema.optional(),
});

// Import Todos Event Schema
export const importTodosEventSchema = todoEventBaseSchema.extend({
    action: z.literal('importTodos'),
    message: importTodosOptionsSchema,
});

// Union of all todo event schemas
export const todoEventSchema = z.union([
    addTodoListEventSchema,
    readTodoListEventSchema,
    createTodoListEventSchema,
    updateTodoListEventSchema,
    addTodoItemEventSchema,
    changeTodoItemStatusEventSchema,
    getTodoStatsEventSchema,
    deleteTodoItemEventSchema,
    archiveTodoListEventSchema,
    unarchiveTodoListEventSchema,
    deleteCompletedTodosEventSchema,
    exportTodosEventSchema,
    importTodosEventSchema,
]);

// Inferred TypeScript types for events
export type TodoEventBase = z.infer<typeof todoEventBaseSchema>;
export type AddTodoListOptions = z.infer<typeof addTodoListOptionsSchema>;
export type ReadTodoListOptions = z.infer<typeof readTodoListOptionsSchema>;
export type CreateTodoListOptions = z.infer<typeof createTodoListOptionsSchema>;
export type UpdateTodoListOptions = z.infer<typeof updateTodoListOptionsSchema>;
export type AddTodoItemOptions = z.infer<typeof addTodoItemOptionsSchema>;
export type ChangeTodoItemStatusOptions = z.infer<typeof changeTodoItemStatusOptionsSchema>;
export type GetTodoStatsOptions = z.infer<typeof getTodoStatsOptionsSchema>;
export type DeleteTodoItemOptions = z.infer<typeof deleteTodoItemOptionsSchema>;
export type ArchiveTodoListOptions = z.infer<typeof archiveTodoListOptionsSchema>;
export type UnarchiveTodoListOptions = z.infer<typeof unarchiveTodoListOptionsSchema>;
export type DeleteCompletedTodosOptions = z.infer<typeof deleteCompletedTodosOptionsSchema>;
export type ExportTodosOptions = z.infer<typeof exportTodosOptionsSchema>;
export type ImportTodosOptions = z.infer<typeof importTodosOptionsSchema>;

export type AddTodoListEvent = z.infer<typeof addTodoListEventSchema>;
export type ReadTodoListEvent = z.infer<typeof readTodoListEventSchema>;
export type CreateTodoListEvent = z.infer<typeof createTodoListEventSchema>;
export type UpdateTodoListEvent = z.infer<typeof updateTodoListEventSchema>;
export type AddTodoItemEvent = z.infer<typeof addTodoItemEventSchema>;
export type ChangeTodoItemStatusEvent = z.infer<typeof changeTodoItemStatusEventSchema>;
export type GetTodoStatsEvent = z.infer<typeof getTodoStatsEventSchema>;
export type DeleteTodoItemEvent = z.infer<typeof deleteTodoItemEventSchema>;
export type ArchiveTodoListEvent = z.infer<typeof archiveTodoListEventSchema>;
export type UnarchiveTodoListEvent = z.infer<typeof unarchiveTodoListEventSchema>;
export type DeleteCompletedTodosEvent = z.infer<typeof deleteCompletedTodosEventSchema>;
export type ExportTodosEvent = z.infer<typeof exportTodosEventSchema>;
export type ImportTodosEvent = z.infer<typeof importTodosEventSchema>;
export type TodoEvent = z.infer<typeof todoEventSchema>;
