import { z } from 'zod';
import { baseMessageSchema } from './coreMessageSchemas';

/**
 * Agent Message Schemas for App-to-UI Communication
 * Based on agent communication patterns in CLI services
 */

// Agent MCP tool execution schemas
export const agentMcpToolConfirmationSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('agent'),
    toolName: z.string(),
    serverName: z.literal('codebolt-agent'),
    params: z.any(),
    stateEvent: z.literal('ASK_FOR_CONFIRMATION'),
  }),
});

export const agentMcpToolExecutingSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('agent'),
    toolName: z.string(),
    serverName: z.literal('codebolt-agent'),
    params: z.any(),
    stateEvent: z.literal('EXECUTING'),
  }),
});

export const agentMcpToolSuccessSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('agent'),
    toolName: z.string(),
    serverName: z.literal('codebolt-agent'),
    params: z.any(),
    result: z.any(),
    stateEvent: z.literal('EXECUTION_SUCCESS'),
  }),
});

export const agentMcpToolErrorSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('agent'),
    toolName: z.string(),
    serverName: z.literal('codebolt-agent'),
    params: z.any(),
    result: z.string(),
    stateEvent: z.literal('EXECUTION_ERROR'),
  }),
});

export const agentMcpToolRejectedSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('agent'),
  payload: z.object({
    type: z.literal('agent'),
    toolName: z.string(),
    serverName: z.literal('codebolt-agent'),
    params: z.any(),
    stateEvent: z.literal('REJECTED'),
  }),
});

// Agent status enum schema
export const agentStatusSchema = z.enum([
  'idle',
  'starting',
  'running',
  'stopping',
  'stopped',
  'error',
  'suspended',
  'completed'
]);

// Agent event type enum schema
export const agentEventTypeSchema = z.enum([
  'status_changed',
  'task_started',
  'task_completed',
  'task_failed',
  'message_sent',
  'error_occurred',
  'progress_update',
  'resource_update'
]);

// Base agent message schema
export const baseAgentMessageSchema = baseMessageSchema.extend({
  type: z.literal('agentMessage'),
  actionType: z.literal('agentEvent'),
  sender: z.literal('agent'),
});

// Agent status update schema
export const agentStatusUpdateSchema = baseAgentMessageSchema.extend({
  content: z.object({
    agentId: z.string(),
    agentName: z.string(),
    status: agentStatusSchema,
    previousStatus: agentStatusSchema.optional(),
    timestamp: z.string(),
    reason: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  }),
  data: z.object({
    eventType: z.literal('status_changed'),
    agentId: z.string(),
    status: agentStatusSchema,
  }),
});

// Agent task update schema
export const agentTaskUpdateSchema = baseAgentMessageSchema.extend({
  content: z.object({
    agentId: z.string(),
    taskId: z.string(),
    taskName: z.string(),
    status: z.enum(['started', 'in_progress', 'completed', 'failed', 'cancelled']),
    progress: z.object({
      current: z.number(),
      total: z.number(),
      percentage: z.number(),
    }).optional(),
    result: z.any().optional(),
    error: z.string().optional(),
    duration: z.number().optional(),
  }),
  data: z.object({
    eventType: agentEventTypeSchema,
    taskId: z.string(),
    status: z.string(),
  }),
});

// Agent progress update schema
export const agentProgressUpdateSchema = baseAgentMessageSchema.extend({
  content: z.object({
    agentId: z.string(),
    taskId: z.string().optional(),
    operation: z.string(),
    progress: z.object({
      current: z.number(),
      total: z.number(),
      percentage: z.number(),
      message: z.string(),
      eta: z.number().optional(),
    }),
    stage: z.string().optional(),
    substage: z.string().optional(),
  }),
  data: z.object({
    eventType: z.literal('progress_update'),
    progress: z.number(),
    message: z.string(),
  }),
});

// Agent error schema
export const agentErrorSchema = baseAgentMessageSchema.extend({
  content: z.object({
    agentId: z.string(),
    errorType: z.string(),
    errorMessage: z.string(),
    errorCode: z.string().optional(),
    stackTrace: z.string().optional(),
    context: z.record(z.any()).optional(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    recoverable: z.boolean(),
    suggestions: z.array(z.string()).optional(),
  }),
  data: z.object({
    eventType: z.literal('error_occurred'),
    errorType: z.string(),
    severity: z.string(),
  }),
});

// Agent resource update schema
export const agentResourceUpdateSchema = baseAgentMessageSchema.extend({
  content: z.object({
    agentId: z.string(),
    resources: z.object({
      cpu: z.object({
        usage: z.number(),
        limit: z.number().optional(),
      }).optional(),
      memory: z.object({
        usage: z.number(),
        limit: z.number().optional(),
        unit: z.enum(['bytes', 'KB', 'MB', 'GB']),
      }).optional(),
      network: z.object({
        bytesIn: z.number(),
        bytesOut: z.number(),
        connections: z.number(),
      }).optional(),
      storage: z.object({
        read: z.number(),
        write: z.number(),
        space: z.number(),
      }).optional(),
    }),
    timestamp: z.string(),
  }),
  data: z.object({
    eventType: z.literal('resource_update'),
    resources: z.record(z.any()),
  }),
});

// Agent communication schema
export const agentCommunicationSchema = baseAgentMessageSchema.extend({
  content: z.object({
    fromAgentId: z.string(),
    toAgentId: z.string().optional(),
    messageType: z.enum(['request', 'response', 'broadcast', 'notification']),
    messageContent: z.any(),
    conversationId: z.string().optional(),
    replyTo: z.string().optional(),
    priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  }),
  data: z.object({
    eventType: z.literal('message_sent'),
    messageType: z.string(),
    fromAgent: z.string(),
  }),
});

// Agent capability update schema
export const agentCapabilityUpdateSchema = baseAgentMessageSchema.extend({
  content: z.object({
    agentId: z.string(),
    capabilities: z.array(z.object({
      name: z.string(),
      version: z.string(),
      enabled: z.boolean(),
      description: z.string().optional(),
      parameters: z.record(z.any()).optional(),
    })),
    updatedAt: z.string(),
  }),
  data: z.object({
    eventType: z.literal('capability_update'),
    capabilityCount: z.number(),
  }),
});

// Agent heartbeat schema
export const agentHeartbeatSchema = baseAgentMessageSchema.extend({
  content: z.object({
    agentId: z.string(),
    timestamp: z.string(),
    status: agentStatusSchema,
    uptime: z.number(),
    lastActivity: z.string(),
    health: z.object({
      score: z.number(),
      issues: z.array(z.string()),
      performance: z.object({
        responseTime: z.number(),
        throughput: z.number(),
        errorRate: z.number(),
      }),
    }),
  }),
  data: z.object({
    eventType: z.literal('heartbeat'),
    health: z.number(),
    uptime: z.number(),
  }),
});

// Agent log schema
export const agentLogSchema = baseAgentMessageSchema.extend({
  content: z.object({
    agentId: z.string(),
    level: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']),
    message: z.string(),
    timestamp: z.string(),
    context: z.record(z.any()).optional(),
    category: z.string().optional(),
    source: z.string().optional(),
  }),
  data: z.object({
    eventType: z.literal('log_entry'),
    level: z.string(),
    category: z.string().optional(),
  }),
});

// Agent service response schemas
export const findAgentByTaskResponseSchema = z.object({
  type: z.literal('findAgentByTaskResponse'),
  agents: z.array(z.object({
    type: z.literal('function'),
    function: z.object({
      name: z.string(),
      description: z.string(),
      parameters: z.object({
        type: z.literal('object'),
        properties: z.object({
          task: z.object({
            type: z.literal('string'),
            description: z.string(),
          }),
        }),
        required: z.array(z.literal('task')),
        additionalProperties: z.literal(false),
      }),
      strict: z.literal(true),
    }),
  })),
});

export const listAgentsResponseSchema = z.object({
  type: z.literal('listAgentsResponse'),
  agents: z.array(z.object({
    type: z.literal('function'),
    function: z.object({
      name: z.string(),
      description: z.string(),
      parameters: z.any(),
    }),
  })),
});

export const agentsDetailResponseSchema = z.object({
  type: z.literal('agentsDetailResponse'),
  messageId: z.string(),
  threadId: z.string(),
  success: z.boolean(),
  payload: z.object({
    agents: z.array(z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      capabilities: z.array(z.any()),
      isLocal: z.boolean(),
      version: z.string(),
      status: z.string(),
      unique_id: z.string(),
    })),
  }),
});

export const agentErrorResponseSchema = z.object({
  type: z.literal('error'),
  message: z.string(),
});

// Union of all agent message schemas
export const agentMessageSchema = z.union([
  agentMcpToolConfirmationSchema,
  agentMcpToolExecutingSchema,
  agentMcpToolSuccessSchema,
  agentMcpToolErrorSchema,
  agentMcpToolRejectedSchema,
  agentStatusUpdateSchema,
  agentTaskUpdateSchema,
  agentProgressUpdateSchema,
  agentErrorSchema,
  agentResourceUpdateSchema,
  agentCommunicationSchema,
  agentCapabilityUpdateSchema,
  agentHeartbeatSchema,
  agentLogSchema,
  findAgentByTaskResponseSchema,
  listAgentsResponseSchema,
  agentsDetailResponseSchema,
  agentErrorResponseSchema,
]);

// Inferred TypeScript types
export type AgentMcpToolConfirmation = z.infer<typeof agentMcpToolConfirmationSchema>;
export type AgentMcpToolExecuting = z.infer<typeof agentMcpToolExecutingSchema>;
export type AgentMcpToolSuccess = z.infer<typeof agentMcpToolSuccessSchema>;
export type AgentMcpToolError = z.infer<typeof agentMcpToolErrorSchema>;
export type AgentMcpToolRejected = z.infer<typeof agentMcpToolRejectedSchema>;
export type AgentStatus = z.infer<typeof agentStatusSchema>;
export type AgentEventType = z.infer<typeof agentEventTypeSchema>;
export type BaseAgentMessage = z.infer<typeof baseAgentMessageSchema>;
export type AgentStatusUpdate = z.infer<typeof agentStatusUpdateSchema>;
export type AgentTaskUpdate = z.infer<typeof agentTaskUpdateSchema>;
export type AgentProgressUpdate = z.infer<typeof agentProgressUpdateSchema>;
export type AgentError = z.infer<typeof agentErrorSchema>;
export type AgentResourceUpdate = z.infer<typeof agentResourceUpdateSchema>;
export type AgentCommunication = z.infer<typeof agentCommunicationSchema>;
export type AgentCapabilityUpdate = z.infer<typeof agentCapabilityUpdateSchema>;
export type AgentHeartbeat = z.infer<typeof agentHeartbeatSchema>;
export type AgentLog = z.infer<typeof agentLogSchema>;
export type FindAgentByTaskResponse = z.infer<typeof findAgentByTaskResponseSchema>;
export type ListAgentsResponse = z.infer<typeof listAgentsResponseSchema>;
export type AgentsDetailResponse = z.infer<typeof agentsDetailResponseSchema>;
export type AgentErrorResponse = z.infer<typeof agentErrorResponseSchema>;
export type AgentMessage = z.infer<typeof agentMessageSchema>; 