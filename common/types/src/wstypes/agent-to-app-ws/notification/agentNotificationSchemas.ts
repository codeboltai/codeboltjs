import { z } from 'zod';
import { AgentMessageBaseSchema } from './baseSchemas';

/**
 * Agent Notification Schemas for Agent-to-App Communication
 * Based on notification types in src/types/notification/agent.ts
 */

// Base agent notification schema
export const agentNotificationBaseSchema = AgentMessageBaseSchema.extend({
  toolUseId: z.string(),
  type: z.literal('agentnotify'),
  action: z.string(),
});

// Start Subagent Task Request
export const startSubagentTaskRequestNotificationSchema = agentNotificationBaseSchema.extend({
  action: z.literal('startSubagentTaskRequest'),
  data: z.object({
    parentAgentId: z.string(),
    subagentId: z.string(),
    task: z.string(),
    priority: z.string().optional(),
    dependencies: z.array(z.string()).optional(),
  }),
});

// Start Subagent Task Response
export const startSubagentTaskResponseNotificationSchema = agentNotificationBaseSchema.extend({
  action: z.literal('startSubagentTaskResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
});

// Subagent Task Completed
export const subagentTaskCompletedNotificationSchema = agentNotificationBaseSchema.extend({
  action: z.literal('subagentTaskCompleted'),
  data: z.object({
    parentAgentId: z.string(),
    subagentId: z.string(),
    taskId: z.string(),
    result: z.any(),
    status: z.string(),
  }),
});

// Union of all agent notification schemas
export const agentNotificationSchema = z.union([
  startSubagentTaskRequestNotificationSchema,
  startSubagentTaskResponseNotificationSchema,
  subagentTaskCompletedNotificationSchema,
]);

// Inferred TypeScript types
export type AgentNotificationBase = z.infer<typeof agentNotificationBaseSchema>;
export type StartSubagentTaskRequestNotification = z.infer<typeof startSubagentTaskRequestNotificationSchema>;
export type StartSubagentTaskResponseNotification = z.infer<typeof startSubagentTaskResponseNotificationSchema>;
export type SubagentTaskCompletedNotification = z.infer<typeof subagentTaskCompletedNotificationSchema>;

// Union types for convenience
export type AgentNotification = z.infer<typeof agentNotificationSchema>; 