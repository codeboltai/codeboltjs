import { z } from 'zod';

/**
 * Memory Event Schemas for Agent-to-App Communication
 * Based on codeboltjs/src/modules/dbmemory.ts module operations
 */

// Base memory message schema
export const memoryEventBaseSchema = z.object({
  type: z.literal('memoryEvent'),
  action: z.string(),
  requestId: z.string(),
});

// Legacy: DB memory set/get events (backward compatibility)
export const memorySetEventSchema = memoryEventBaseSchema.extend({
  action: z.literal('set'),
  key: z.string(),
  value: z.any(),
});

export const memoryGetEventSchema = memoryEventBaseSchema.extend({
  action: z.literal('get'),
  key: z.string(),
});

// New memory service schemas (save/update/delete/list with format)
export const memoryFormatSchema = z.enum(['json', 'markdown', 'todo']);

// Todo item schema
export const todoStatusSchema = z.enum(['pending', 'processing', 'completed']);
export const todoPrioritySchema = z.enum(['low', 'medium', 'high']);

export const todoItemSchema = z.object({
  id: z.string().optional(), // Optional for create operations
  title: z.string(),
  status: todoStatusSchema.optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  priority: todoPrioritySchema.optional(),
  tags: z.array(z.string()).optional(),
});

// Todo data can be a single item or an array of items
export const todoDataSchema = z.union([
  todoItemSchema,
  z.array(todoItemSchema)
]);

export const saveMemoryEventSchema = memoryEventBaseSchema.extend({
  action: z.literal('saveMemory'),
  format: memoryFormatSchema,
  json: z.any().optional(),
  markdown: z.string().optional(),
  todo: todoDataSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
  threadId: z.string().optional() // threadId is used as memoryId for todos
});

export const updateMemoryEventSchema = memoryEventBaseSchema.extend({
  action: z.literal('updateMemory'),
  format: memoryFormatSchema,
  memoryId: z.string(),
  json: z.any().optional(),
  markdown: z.string().optional(),
  todo: todoItemSchema.optional(), // For updates, todo should be a single item with id
  metadata: z.record(z.unknown()).optional()
});

export const deleteMemoryEventSchema = memoryEventBaseSchema.extend({
  action: z.literal('deleteMemory'),
  format: memoryFormatSchema,
  memoryId: z.string()
});

export const listMemoryEventSchema = memoryEventBaseSchema.extend({
  action: z.literal('listMemory'),
  format: memoryFormatSchema,
  filters: z.record(z.unknown()).optional()
});

// Union of all memory event schemas
export const memoryEventSchema = z.union([
  memorySetEventSchema,
  memoryGetEventSchema,
  saveMemoryEventSchema,
  updateMemoryEventSchema,
  deleteMemoryEventSchema,
  listMemoryEventSchema,
]);

// Inferred TypeScript types for events
export type MemoryEventBase = z.infer<typeof memoryEventBaseSchema>;
export type MemorySetEvent = z.infer<typeof memorySetEventSchema>;
export type MemoryGetEvent = z.infer<typeof memoryGetEventSchema>;
export type MemoryEvent = z.infer<typeof memoryEventSchema>;
export type MemoryFormat = z.infer<typeof memoryFormatSchema>;
export type TodoStatus = z.infer<typeof todoStatusSchema>;
export type TodoPriority = z.infer<typeof todoPrioritySchema>;
export type TodoItem = z.infer<typeof todoItemSchema>;
export type TodoData = z.infer<typeof todoDataSchema>;
export type SaveMemoryEvent = z.infer<typeof saveMemoryEventSchema>;
export type UpdateMemoryEvent = z.infer<typeof updateMemoryEventSchema>;
export type DeleteMemoryEvent = z.infer<typeof deleteMemoryEventSchema>;
export type ListMemoryEvent = z.infer<typeof listMemoryEventSchema>;

