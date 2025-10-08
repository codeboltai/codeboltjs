import { z } from 'zod';
import { baseMessageSchema } from './coreMessageSchemas';

/**
 * Notification Message Schemas for App-to-UI Communication
 * Based on notification patterns in CLI services
 */

// Notification MCP tool execution schemas
export const notificationMcpToolConfirmationSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('notification'),
    toolName: z.string(),
    serverName: z.literal('codebolt-notification'),
    params: z.any(),
    stateEvent: z.literal('ASK_FOR_CONFIRMATION'),
  }),
});

export const notificationMcpToolExecutingSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('notification'),
    toolName: z.string(),
    serverName: z.literal('codebolt-notification'),
    params: z.any(),
    stateEvent: z.literal('EXECUTING'),
  }),
});

export const notificationMcpToolSuccessSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('notification'),
    toolName: z.string(),
    serverName: z.literal('codebolt-notification'),
    params: z.any(),
    result: z.any(),
    stateEvent: z.literal('EXECUTION_SUCCESS'),
  }),
});

export const notificationMcpToolErrorSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('notification'),
    toolName: z.string(),
    serverName: z.literal('codebolt-notification'),
    params: z.any(),
    result: z.string(),
    stateEvent: z.literal('EXECUTION_ERROR'),
  }),
});

export const notificationMcpToolRejectedSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('notification'),
    toolName: z.string(),
    serverName: z.literal('codebolt-notification'),
    params: z.any(),
    stateEvent: z.literal('REJECTED'),
  }),
});

// Notification type enum schema
export const notificationTypeSchema = z.enum([
  'info',
  'success',
  'warning',
  'error',
  'debug'
]);

// Notification priority enum schema
export const notificationPrioritySchema = z.enum([
  'low',
  'normal',
  'high',
  'urgent'
]);

// AI request state enum schema for notification service
export const aiRequestStateSchema = z.enum([
  'SENDING_REQUEST',
  'REQUEST_SUCCESS',
  'REQUEST_ERROR'
]);

// Base notification message schema
export const baseNotificationMessageSchema = baseMessageSchema.extend({
  type: z.literal('notification'),
  actionType: z.literal('notificationEvent'),
  templateType: z.literal('NOTIFICATION'),
  sender: z.literal('agent'),
});

// Simple notification schema
export const simpleNotificationSchema = baseNotificationMessageSchema.extend({
  content: z.string(),
  data: z.object({
    text: z.string(),
    type: notificationTypeSchema.optional(),
    priority: notificationPrioritySchema.optional(),
  }),
});

// Rich notification schema
export const richNotificationSchema = baseNotificationMessageSchema.extend({
  content: z.object({
    title: z.string(),
    message: z.string(),
    type: notificationTypeSchema,
    priority: notificationPrioritySchema.optional(),
    icon: z.string().optional(),
    actions: z.array(z.object({
      label: z.string(),
      action: z.string(),
      style: z.enum(['primary', 'secondary', 'danger']).optional(),
    })).optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

// Progress notification schema
export const progressNotificationSchema = baseNotificationMessageSchema.extend({
  content: z.object({
    title: z.string(),
    message: z.string(),
    progress: z.object({
      current: z.number(),
      total: z.number(),
      percentage: z.number(),
      status: z.enum(['running', 'completed', 'failed', 'paused']),
    }),
    type: notificationTypeSchema,
  }),
});

// Toast notification schema
export const toastNotificationSchema = baseNotificationMessageSchema.extend({
  content: z.object({
    message: z.string(),
    type: notificationTypeSchema,
    duration: z.number().optional(),
    persistent: z.boolean().optional(),
  }),
});

// System status notification schema
export const systemStatusNotificationSchema = baseNotificationMessageSchema.extend({
  content: z.object({
    title: z.string(),
    status: z.enum(['online', 'offline', 'degraded', 'maintenance']),
    services: z.array(z.object({
      name: z.string(),
      status: z.enum(['operational', 'degraded', 'outage']),
      lastCheck: z.string(),
    })).optional(),
    message: z.string().optional(),
  }),
});

// Agent notification schema
export const agentNotificationSchema = baseNotificationMessageSchema.extend({
  content: z.object({
    agentId: z.string(),
    agentName: z.string(),
    event: z.enum(['started', 'stopped', 'error', 'completed', 'progress']),
    message: z.string(),
    details: z.record(z.any()).optional(),
  }),
});

// File operation notification schema
export const fileOperationNotificationSchema = baseNotificationMessageSchema.extend({
  content: z.object({
    operation: z.enum(['read', 'write', 'delete', 'create', 'move', 'copy']),
    filePath: z.string(),
    status: z.enum(['success', 'error', 'in_progress']),
    message: z.string(),
    error: z.string().optional(),
  }),
});

// Build notification schema
export const buildNotificationSchema = baseNotificationMessageSchema.extend({
  content: z.object({
    buildId: z.string(),
    project: z.string(),
    status: z.enum(['started', 'success', 'failed', 'cancelled']),
    duration: z.number().optional(),
    errors: z.array(z.string()).optional(),
    warnings: z.array(z.string()).optional(),
    artifacts: z.array(z.string()).optional(),
  }),
});

// Connection notification schema
export const connectionNotificationSchema = baseNotificationMessageSchema.extend({
  content: z.object({
    service: z.string(),
    status: z.enum(['connected', 'disconnected', 'reconnecting', 'error']),
    message: z.string(),
    retryCount: z.number().optional(),
    lastAttempt: z.string().optional(),
  }),
});

// Update notification schema
export const updateNotificationSchema = baseNotificationMessageSchema.extend({
  content: z.object({
    component: z.string(),
    currentVersion: z.string(),
    newVersion: z.string(),
    updateType: z.enum(['major', 'minor', 'patch', 'hotfix']),
    changelog: z.string().optional(),
    required: z.boolean(),
    downloadUrl: z.string().optional(),
  }),
});

// AI request notification schema (used in notification service)
export const aiRequestNotificationSchema = baseNotificationMessageSchema.extend({
  content: z.object({
    requestId: z.string(),
    requestType: z.string(),
    stateEvent: aiRequestStateSchema,
    message: z.string(),
    result: z.any().optional(),
    error: z.string().optional(),
  }),
});

// Notification error response schema
export const notificationErrorResponseSchema = z.object({
  type: z.literal('error'),
  message: z.string(),
});

// Union of all notification message schemas
export const notificationMessageSchema = z.union([
  notificationMcpToolConfirmationSchema,
  notificationMcpToolExecutingSchema,
  notificationMcpToolSuccessSchema,
  notificationMcpToolErrorSchema,
  notificationMcpToolRejectedSchema,
  simpleNotificationSchema,
  richNotificationSchema,
  progressNotificationSchema,
  toastNotificationSchema,
  systemStatusNotificationSchema,
  agentNotificationSchema,
  fileOperationNotificationSchema,
  buildNotificationSchema,
  connectionNotificationSchema,
  updateNotificationSchema,
  aiRequestNotificationSchema,
  notificationErrorResponseSchema,
]);

// Inferred TypeScript types
export type NotificationMcpToolConfirmation = z.infer<typeof notificationMcpToolConfirmationSchema>;
export type NotificationMcpToolExecuting = z.infer<typeof notificationMcpToolExecutingSchema>;
export type NotificationMcpToolSuccess = z.infer<typeof notificationMcpToolSuccessSchema>;
export type NotificationMcpToolError = z.infer<typeof notificationMcpToolErrorSchema>;
export type NotificationMcpToolRejected = z.infer<typeof notificationMcpToolRejectedSchema>;
export type NotificationType = z.infer<typeof notificationTypeSchema>;
export type NotificationPriority = z.infer<typeof notificationPrioritySchema>;
export type BaseNotificationMessage = z.infer<typeof baseNotificationMessageSchema>;
export type SimpleNotification = z.infer<typeof simpleNotificationSchema>;
export type RichNotification = z.infer<typeof richNotificationSchema>;
export type ProgressNotification = z.infer<typeof progressNotificationSchema>;
export type ToastNotification = z.infer<typeof toastNotificationSchema>;
export type SystemStatusNotification = z.infer<typeof systemStatusNotificationSchema>;
export type AgentNotification = z.infer<typeof agentNotificationSchema>;
export type FileOperationNotification = z.infer<typeof fileOperationNotificationSchema>;
export type BuildNotification = z.infer<typeof buildNotificationSchema>;
export type ConnectionNotification = z.infer<typeof connectionNotificationSchema>;
export type UpdateNotification = z.infer<typeof updateNotificationSchema>;
export type AiRequestNotification = z.infer<typeof aiRequestNotificationSchema>;
export type NotificationErrorResponse = z.infer<typeof notificationErrorResponseSchema>;
export type NotificationMessage = z.infer<typeof notificationMessageSchema>; 