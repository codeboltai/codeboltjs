// --- Enums and Constants ---

/** Agent status */
export type AgentStatus = 'idle' | 'running' | 'paused' | 'stopped' | 'error';

// --- Core Entities ---

/** Agent configuration */
export interface AgentConfig {
  name: string;
  description?: string;
  model?: string;
  systemPrompt?: string;
  tools?: string[];
  maxTokens?: number;
  temperature?: number;
  capabilities?: string[];
  metadata?: Record<string, unknown>;
}

/** Agent instance */
export interface Agent {
  id: string;
  name: string;
  description?: string;
  status: AgentStatus;
  config?: AgentConfig;
  projectPath?: string;
  threadId?: string;
  instanceId?: string;
  createdAt?: string;
  updatedAt?: string;
  lastActiveAt?: string;
  metadata?: Record<string, unknown>;
}

/** Agent execution info */
export interface AgentExecution {
  id: string;
  agentId: string;
  agentName: string;
  threadId: string;
  status: AgentStatus;
  startedAt: string;
  finishedAt?: string;
  error?: string;
}

// --- Request Types ---

/** Start agent request */
export interface StartAgentRequest {
  agentId: string;
  threadId?: string;
  projectPath?: string;
  prompt?: string;
  config?: Partial<AgentConfig>;
}

/** Stop agent request */
export interface StopAgentRequest {
  agentId: string;
  instanceId?: string;
  force?: boolean;
}

/** Change agent request */
export interface ChangeAgentRequest {
  agentId?: string;
  agentName?: string;
  threadId?: string;
}

/** Install agent locally request */
export interface InstallLocalAgentRequest {
  path: string;
  name?: string;
  metadata?: Record<string, unknown>;
}

/** Install agent from registry request */
export interface InstallAgentRequest {
  agentId?: string;
  agentName?: string;
  version?: string;
  metadata?: Record<string, unknown>;
}

/** Update agent request */
export interface UpdateAgentRequest {
  agentId?: string;
  agentName?: string;
  config?: Partial<AgentConfig>;
  metadata?: Record<string, unknown>;
}

/** Create custom local agent request */
export interface CreateCustomLocalAgentRequest {
  name: string;
  description?: string;
  path?: string;
  config?: Partial<AgentConfig>;
  metadata?: Record<string, unknown>;
}

/** Create flow agent request */
export interface CreateFlowAgentRequest {
  name: string;
  description?: string;
  flow?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/** Create remote agent request */
export interface CreateRemoteAgentRequest {
  name: string;
  description?: string;
  endpoint: string;
  protocol?: string;
  metadata?: Record<string, unknown>;
}

/** Remix agent data */
export interface RemixAgent {
  name: string;
  description?: string;
  baseAgent?: string;
  config?: Partial<AgentConfig>;
  metadata?: Record<string, unknown>;
}

/** Agent properties */
export interface AgentProperties {
  [key: string]: unknown;
}
