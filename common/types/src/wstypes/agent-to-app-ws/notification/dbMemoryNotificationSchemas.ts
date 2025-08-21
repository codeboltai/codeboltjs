import { z } from 'zod';
import { AgentMessageBaseSchema } from './baseSchemas';

/**
 * Database Memory Notification Schemas for Agent-to-App Communication
 * Based on notification types in src/types/notification/dbmemory.ts
 */

// Base database memory notification schema
export const dbMemoryNotificationBaseSchema = AgentMessageBaseSchema.extend({
  toolUseId: z.string(),
  type: z.literal('dbmemorynotify'),
  action: z.string(),
});

// Add Memory Request
export const addMemoryRequestNotificationSchema = dbMemoryNotificationBaseSchema.extend({
  action: z.literal('addKnowledgeRequest'),
  data: z.object({
    key: z.string(),
    value: z.any(),
  }),
});

// Add Memory Response
export const addMemoryResultNotificationSchema = dbMemoryNotificationBaseSchema.extend({
  action: z.literal('addKnowledgeResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
});

// Get Memory Request
export const getMemoryRequestNotificationSchema = dbMemoryNotificationBaseSchema.extend({
  action: z.literal('getKnowledgeRequest'),
  data: z.object({
    key: z.string(),
  }),
});

// Get Memory Response
export const getMemoryResultNotificationSchema = dbMemoryNotificationBaseSchema.extend({
  action: z.literal('getKnowledgeResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
});

// Union of all database memory notification schemas
export const dbMemoryNotificationSchema = z.union([
  addMemoryRequestNotificationSchema,
  addMemoryResultNotificationSchema,
  getMemoryRequestNotificationSchema,
  getMemoryResultNotificationSchema,
]);

// Inferred TypeScript types
export type DbMemoryNotificationBase = z.infer<typeof dbMemoryNotificationBaseSchema>;
export type AddMemoryRequestNotification = z.infer<typeof addMemoryRequestNotificationSchema>;
export type AddMemoryResultNotification = z.infer<typeof addMemoryResultNotificationSchema>;
export type GetMemoryRequestNotification = z.infer<typeof getMemoryRequestNotificationSchema>;
export type GetMemoryResultNotification = z.infer<typeof getMemoryResultNotificationSchema>;

// Union types for convenience
export type DbMemoryNotification = z.infer<typeof dbMemoryNotificationSchema>; 