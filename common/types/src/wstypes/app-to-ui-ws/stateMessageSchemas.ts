import { z } from 'zod';
import { baseMessageSchema } from './coreMessageSchemas';

/**
 * State Message Schemas for App-to-UI Communication
 * Based on state update patterns in CLI services
 */

// State update type enum schema
export const stateUpdateTypeSchema = z.enum([
  'project_state',
  'agent_state',
  'application_state',
  'ui_state',
  'connection_state',
  'permission_state',
  'configuration_state'
]);

// Base state message schema
export const baseStateMessageSchema = baseMessageSchema.extend({
  type: z.literal('stateUpdate'),
  actionType: z.literal('projectStateEvent'),
  sender: z.literal('System'),
});

// Project state update schema
export const projectStateUpdateSchema = baseStateMessageSchema.extend({
  content: z.object({
    updateType: z.literal('project_state'),
    projectId: z.string(),
    state: z.object({
      name: z.string(),
      path: z.string(),
      version: z.string().optional(),
      gitState: z.object({
        branch: z.string(),
        hasChanges: z.boolean(),
        staged: z.array(z.string()),
        unstaged: z.array(z.string()),
        commits: z.number(),
      }).optional(),
      buildState: z.object({
        isBuilding: z.boolean(),
        lastBuildTime: z.string().optional(),
        lastBuildStatus: z.enum(['success', 'failed', 'cancelled']).optional(),
        buildErrors: z.array(z.string()),
        buildWarnings: z.array(z.string()),
      }).optional(),
      dependencies: z.object({
        installed: z.array(z.string()),
        outdated: z.array(z.string()),
        vulnerable: z.array(z.string()),
      }).optional(),
      activeAgent: z.object({
        unique_id: z.string(),
        name: z.string(),
        status: z.string(),
      }).optional(),
      autoReadFile: z.array(z.object({
        agentId: z.string(),
        autoReadFile: z.boolean(),
      })),
      autoConfirm: z.array(z.object({
        agentId: z.string(),
        autoConfirm: z.boolean(),
      })),
    }),
    timestamp: z.string(),
  }),
  data: z.object({
    updateType: z.literal('project_state'),
    projectId: z.string(),
  }),
});

// Agent state update schema
export const agentStateUpdateSchema = baseStateMessageSchema.extend({
  actionType: z.literal('agentStateEvent'),
  content: z.object({
    updateType: z.literal('agent_state'),
    agentId: z.string(),
    state: z.record(z.any()),
    version: z.number(),
    lastUpdated: z.string(),
    changes: z.array(z.object({
      key: z.string(),
      oldValue: z.any(),
      newValue: z.any(),
      operation: z.enum(['set', 'delete', 'update']),
    })).optional(),
  }),
  data: z.object({
    updateType: z.literal('agent_state'),
    agentId: z.string(),
    version: z.number(),
  }),
});

// Application state update schema
export const applicationStateUpdateSchema = baseStateMessageSchema.extend({
  content: z.object({
    updateType: z.literal('application_state'),
    state: z.object({
      projectPath: z.string(),
      currentFile: z.string().optional(),
      openFiles: z.array(z.string()),
      activeView: z.string().optional(),
      settings: z.record(z.any()),
      workspaceId: z.string().optional(),
      sessionId: z.string(),
      user: z.object({
        id: z.string(),
        name: z.string(),
        email: z.string().optional(),
      }).optional(),
    }),
    timestamp: z.string(),
  }),
  data: z.object({
    updateType: z.literal('application_state'),
    sessionId: z.string(),
  }),
});

// UI state update schema
export const uiStateUpdateSchema = baseStateMessageSchema.extend({
  content: z.object({
    updateType: z.literal('ui_state'),
    componentId: z.string(),
    state: z.object({
      visible: z.boolean(),
      enabled: z.boolean(),
      selected: z.boolean().optional(),
      expanded: z.boolean().optional(),
      loading: z.boolean().optional(),
      error: z.string().optional(),
      data: z.any().optional(),
    }),
    timestamp: z.string(),
  }),
  data: z.object({
    updateType: z.literal('ui_state'),
    componentId: z.string(),
  }),
});

// Connection state update schema
export const connectionStateUpdateSchema = baseStateMessageSchema.extend({
  content: z.object({
    updateType: z.literal('connection_state'),
    connections: z.array(z.object({
      id: z.string(),
      type: z.enum(['websocket', 'http', 'rpc', 'database']),
      status: z.enum(['connected', 'disconnected', 'connecting', 'error']),
      endpoint: z.string(),
      lastConnected: z.string().optional(),
      lastDisconnected: z.string().optional(),
      reconnectAttempts: z.number().optional(),
      latency: z.number().optional(),
    })),
    timestamp: z.string(),
  }),
  data: z.object({
    updateType: z.literal('connection_state'),
    connectionCount: z.number(),
  }),
});

// Permission state update schema
export const permissionStateUpdateSchema = baseStateMessageSchema.extend({
  content: z.object({
    updateType: z.literal('permission_state'),
    permissions: z.object({
      fileRead: z.boolean(),
      fileWrite: z.boolean(),
      commandExecution: z.boolean(),
      networkAccess: z.boolean(),
      systemAccess: z.boolean(),
      agentManagement: z.boolean(),
    }),
    restrictions: z.array(z.object({
      type: z.string(),
      resource: z.string(),
      reason: z.string(),
    })),
    agentId: z.string().optional(),
    timestamp: z.string(),
  }),
  data: z.object({
    updateType: z.literal('permission_state'),
    agentId: z.string().optional(),
  }),
});

// Configuration state update schema
export const configurationStateUpdateSchema = baseStateMessageSchema.extend({
  content: z.object({
    updateType: z.literal('configuration_state'),
    scope: z.enum(['global', 'workspace', 'agent', 'user']),
    configuration: z.record(z.any()),
    version: z.number(),
    lastModified: z.string(),
    modifiedBy: z.string().optional(),
    changes: z.array(z.object({
      key: z.string(),
      oldValue: z.any(),
      newValue: z.any(),
      source: z.string(),
    })).optional(),
  }),
  data: z.object({
    updateType: z.literal('configuration_state'),
    scope: z.string(),
    version: z.number(),
  }),
});

// File state update schema
export const fileStateUpdateSchema = baseStateMessageSchema.extend({
  content: z.object({
    updateType: z.literal('file_state'),
    files: z.array(z.object({
      path: z.string(),
      status: z.enum(['modified', 'created', 'deleted', 'renamed', 'staged', 'committed']),
      size: z.number().optional(),
      lastModified: z.string().optional(),
      encoding: z.string().optional(),
      language: z.string().optional(),
      isOpen: z.boolean(),
      isDirty: z.boolean(),
    })),
    activeFile: z.string().optional(),
    timestamp: z.string(),
  }),
  data: z.object({
    updateType: z.literal('file_state'),
    fileCount: z.number(),
    activeFile: z.string().optional(),
  }),
});

// Union of all state message schemas
export const stateMessageSchema = z.union([
  projectStateUpdateSchema,
  agentStateUpdateSchema,
  applicationStateUpdateSchema,
  uiStateUpdateSchema,
  connectionStateUpdateSchema,
  permissionStateUpdateSchema,
  configurationStateUpdateSchema,
  fileStateUpdateSchema,
]);

// Inferred TypeScript types
export type StateUpdateType = z.infer<typeof stateUpdateTypeSchema>;
export type BaseStateMessage = z.infer<typeof baseStateMessageSchema>;
export type ProjectStateUpdate = z.infer<typeof projectStateUpdateSchema>;
export type AgentStateUpdate = z.infer<typeof agentStateUpdateSchema>;
export type ApplicationStateUpdate = z.infer<typeof applicationStateUpdateSchema>;
export type UiStateUpdate = z.infer<typeof uiStateUpdateSchema>;
export type ConnectionStateUpdate = z.infer<typeof connectionStateUpdateSchema>;
export type PermissionStateUpdate = z.infer<typeof permissionStateUpdateSchema>;
export type ConfigurationStateUpdate = z.infer<typeof configurationStateUpdateSchema>;
export type FileStateUpdate = z.infer<typeof fileStateUpdateSchema>;
export type StateMessage = z.infer<typeof stateMessageSchema>; 