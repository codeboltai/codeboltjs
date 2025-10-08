import { z } from 'zod';
import { baseMessageSchema, buttonOptionSchema, messagePayloadSchema } from './coreMessageSchemas';

/**
 * MCP Tool Message Schemas for App-to-UI Communication
 * Based on MCP tool execution patterns in CLI services
 */

// MCP tool state enum schema - matches MCPToolStateEnum from chatTypes.ts
export const mcpToolStateEnumSchema = z.enum([
  'ASK_FOR_CONFIRMATION',
  'EXECUTING',
  'EXECUTION_SUCCESS',
  'EXECUTION_ERROR',
  'REJECTED',
  'MCP_STARTUP_ERROR'
]);

// MCP tool payload schema
export const mcpToolPayloadSchema = messagePayloadSchema.extend({
  type: z.string(),
  toolName: z.string(),
  serverName: z.string(),
  params: z.record(z.any()),
  stateEvent: mcpToolStateEnumSchema,
  result: z.any().optional(),
  error: z.string().optional(),
  executionTime: z.number().optional(),
});

// Base MCP tool message schema
export const baseMcpToolMessageSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  sender: z.literal('Agent'),
  timestamp: z.number(),
  payload: mcpToolPayloadSchema,
});

// MCP tool confirmation request schema
export const mcpToolConfirmationSchema = baseMcpToolMessageSchema.extend({
  payload: mcpToolPayloadSchema.extend({
    stateEvent: z.literal('ASK_FOR_CONFIRMATION'),
  }),
  buttons: z.array(buttonOptionSchema).optional(),
});

// MCP tool executing schema
export const mcpToolExecutingSchema = baseMcpToolMessageSchema.extend({
  payload: mcpToolPayloadSchema.extend({
    stateEvent: z.literal('EXECUTING'),
  }),
});

// MCP tool executed/success schema
export const mcpToolExecutedSchema = baseMcpToolMessageSchema.extend({
  payload: mcpToolPayloadSchema.extend({
    stateEvent: z.literal('EXECUTION_SUCCESS'),
    result: z.any(),
    executionTime: z.number().optional(),
  }),
});

// MCP tool rejected schema
export const mcpToolRejectedSchema = baseMcpToolMessageSchema.extend({
  payload: mcpToolPayloadSchema.extend({
    stateEvent: z.literal('REJECTED'),
  }),
});

// MCP tool execution error schema
export const mcpToolErrorSchema = baseMcpToolMessageSchema.extend({
  payload: mcpToolPayloadSchema.extend({
    stateEvent: z.literal('EXECUTION_ERROR'),
    error: z.string(),
  }),
});

// MCP startup error schema
export const mcpStartupErrorSchema = baseMcpToolMessageSchema.extend({
  payload: mcpToolPayloadSchema.extend({
    stateEvent: z.literal('MCP_STARTUP_ERROR'),
    error: z.string(),
  }),
});

// Specific tool type schemas
export const fsToolMessageSchema = baseMcpToolMessageSchema.extend({
  payload: mcpToolPayloadSchema.extend({
    type: z.literal('fs'),
    serverName: z.literal('codebolt-fs'),
  }),
});

export const terminalToolMessageSchema = baseMcpToolMessageSchema.extend({
  payload: mcpToolPayloadSchema.extend({
    type: z.literal('terminal'),
    serverName: z.literal('codebolt-terminal'),
  }),
});

export const browserToolMessageSchema = baseMcpToolMessageSchema.extend({
  payload: mcpToolPayloadSchema.extend({
    type: z.literal('browser'),
    serverName: z.literal('codebolt-browser'),
  }),
});

export const agentToolMessageSchema = baseMcpToolMessageSchema.extend({
  payload: mcpToolPayloadSchema.extend({
    type: z.literal('agent'),
    serverName: z.literal('codebolt-agent'),
  }),
});

export const vectordbToolMessageSchema = baseMcpToolMessageSchema.extend({
  payload: mcpToolPayloadSchema.extend({
    type: z.literal('vectordb'),
    serverName: z.literal('codebolt-vectordb'),
  }),
});

export const memoryToolMessageSchema = baseMcpToolMessageSchema.extend({
  payload: mcpToolPayloadSchema.extend({
    type: z.literal('memory'),
    serverName: z.literal('codebolt-memory'),
  }),
});

export const gitToolMessageSchema = baseMcpToolMessageSchema.extend({
  payload: mcpToolPayloadSchema.extend({
    type: z.literal('git'),
    serverName: z.literal('codebolt-git'),
  }),
});

export const debugToolMessageSchema = baseMcpToolMessageSchema.extend({
  payload: mcpToolPayloadSchema.extend({
    type: z.literal('debug'),
    serverName: z.literal('codebolt-debug'),
  }),
});

export const notificationToolMessageSchema = baseMcpToolMessageSchema.extend({
  payload: mcpToolPayloadSchema.extend({
    type: z.literal('notification'),
    serverName: z.literal('codebolt-notification'),
  }),
});

export const codebaseToolMessageSchema = baseMcpToolMessageSchema.extend({
  payload: mcpToolPayloadSchema.extend({
    type: z.literal('codebase'),
    serverName: z.literal('codebolt-codebase'),
  }),
});

export const crawlerToolMessageSchema = baseMcpToolMessageSchema.extend({
  payload: mcpToolPayloadSchema.extend({
    type: z.literal('crawler'),
    serverName: z.literal('codebolt-crawler'),
  }),
});

export const taskToolMessageSchema = baseMcpToolMessageSchema.extend({
  payload: mcpToolPayloadSchema.extend({
    type: z.literal('task'),
    serverName: z.literal('codebolt-task'),
  }),
});

export const problemToolMessageSchema = baseMcpToolMessageSchema.extend({
  payload: mcpToolPayloadSchema.extend({
    type: z.literal('problem'),
    serverName: z.literal('codebolt-problem'),
  }),
});

export const codeToolMessageSchema = baseMcpToolMessageSchema.extend({
  payload: mcpToolPayloadSchema.extend({
    type: z.literal('code'),
    serverName: z.literal('codebolt-code'),
  }),
});

export const projectToolMessageSchema = baseMcpToolMessageSchema.extend({
  payload: mcpToolPayloadSchema.extend({
    type: z.literal('project'),
    serverName: z.literal('codebolt-project'),
  }),
});

export const messageToolMessageSchema = baseMcpToolMessageSchema.extend({
  payload: mcpToolPayloadSchema.extend({
    type: z.literal('message'),
    serverName: z.literal('codebolt-message'),
  }),
});

export const appToolMessageSchema = baseMcpToolMessageSchema.extend({
  payload: mcpToolPayloadSchema.extend({
    type: z.literal('app'),
    serverName: z.literal('codebolt-app'),
  }),
});

export const treeToolMessageSchema = baseMcpToolMessageSchema.extend({
  payload: mcpToolPayloadSchema.extend({
    type: z.literal('tree'),
    serverName: z.literal('codebolt-tree'),
  }),
});

// Union of all MCP tool message schemas
export const mcpToolMessageSchema = z.union([
  mcpToolConfirmationSchema,
  mcpToolExecutingSchema,
  mcpToolExecutedSchema,
  mcpToolRejectedSchema,
  mcpToolErrorSchema,
  mcpStartupErrorSchema,
  fsToolMessageSchema,
  terminalToolMessageSchema,
  browserToolMessageSchema,
  agentToolMessageSchema,
  vectordbToolMessageSchema,
  memoryToolMessageSchema,
  gitToolMessageSchema,
  debugToolMessageSchema,
  notificationToolMessageSchema,
  codebaseToolMessageSchema,
  crawlerToolMessageSchema,
  taskToolMessageSchema,
  problemToolMessageSchema,
  codeToolMessageSchema,
  projectToolMessageSchema,
  messageToolMessageSchema,
  appToolMessageSchema,
  treeToolMessageSchema,
]);

// Inferred TypeScript types
export type McpToolStateEnum = z.infer<typeof mcpToolStateEnumSchema>;
export type McpToolPayload = z.infer<typeof mcpToolPayloadSchema>;
export type BaseMcpToolMessage = z.infer<typeof baseMcpToolMessageSchema>;
export type McpToolConfirmation = z.infer<typeof mcpToolConfirmationSchema>;
export type McpToolExecuting = z.infer<typeof mcpToolExecutingSchema>;
export type McpToolExecuted = z.infer<typeof mcpToolExecutedSchema>;
export type McpToolRejected = z.infer<typeof mcpToolRejectedSchema>;
export type McpToolError = z.infer<typeof mcpToolErrorSchema>;
export type McpStartupError = z.infer<typeof mcpStartupErrorSchema>;
export type FsToolMessage = z.infer<typeof fsToolMessageSchema>;
export type TerminalToolMessage = z.infer<typeof terminalToolMessageSchema>;
export type BrowserToolMessage = z.infer<typeof browserToolMessageSchema>;
export type AgentToolMessage = z.infer<typeof agentToolMessageSchema>;
export type VectordbToolMessage = z.infer<typeof vectordbToolMessageSchema>;
export type MemoryToolMessage = z.infer<typeof memoryToolMessageSchema>;
export type GitToolMessage = z.infer<typeof gitToolMessageSchema>;
export type DebugToolMessage = z.infer<typeof debugToolMessageSchema>;
export type NotificationToolMessage = z.infer<typeof notificationToolMessageSchema>;
export type CodebaseToolMessage = z.infer<typeof codebaseToolMessageSchema>;
export type CrawlerToolMessage = z.infer<typeof crawlerToolMessageSchema>;
export type TaskToolMessage = z.infer<typeof taskToolMessageSchema>;
export type ProblemToolMessage = z.infer<typeof problemToolMessageSchema>;
export type CodeToolMessage = z.infer<typeof codeToolMessageSchema>;
export type ProjectToolMessage = z.infer<typeof projectToolMessageSchema>;
export type MessageToolMessage = z.infer<typeof messageToolMessageSchema>;
export type AppToolMessage = z.infer<typeof appToolMessageSchema>;
export type TreeToolMessage = z.infer<typeof treeToolMessageSchema>;
export type McpToolMessage = z.infer<typeof mcpToolMessageSchema>; 