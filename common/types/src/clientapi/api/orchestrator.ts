// --- Enums and Constants ---

/** Orchestrator status */
export type OrchestratorStatus = 'idle' | 'running' | 'paused' | 'stopped' | 'error';

/** Orchestrator task status */
export type OrchestratorTaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

// --- Core Entities ---

/** Orchestrator configuration */
export interface OrchestratorConfig {
  id: string;
  name: string;
  description?: string;
  maxConcurrentAgents?: number;
  maxConcurrentSwarms?: number;
  defaultTimeout?: number;
  retryPolicy?: {
    maxRetries: number;
    backoffMultiplier: number;
    initialDelay: number;
  };
  metadata?: Record<string, unknown>;
}

/** Orchestrator instance */
export interface OrchestratorInstance {
  id: string;
  config: OrchestratorConfig;
  status: OrchestratorStatus;
  activeAgents: number;
  activeSwarms: number;
  startedAt?: string;
  stoppedAt?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

/** Orchestrator task */
export interface OrchestratorTask {
  id: string;
  orchestratorId: string;
  type: string;
  status: OrchestratorTaskStatus;
  input: unknown;
  output?: unknown;
  agentId?: string;
  swarmId?: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

// --- Request Types ---

/** Create orchestrator request */
export interface CreateOrchestratorRequest {
  name: string;
  description?: string;
  config?: Partial<OrchestratorConfig>;
}

/** Update orchestrator request */
export interface UpdateOrchestratorRequest {
  name?: string;
  description?: string;
  config?: Partial<OrchestratorConfig>;
  metadata?: Record<string, unknown>;
}

/** Orchestrator list params */
export interface OrchestratorListParams {
  status?: OrchestratorStatus;
  limit?: number;
  offset?: number;
}
