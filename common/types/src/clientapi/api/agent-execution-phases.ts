// Agent Execution Phases API types

export interface AgentExecutionPhase {
  name: string;
  displayName?: string;
  description?: string;
  order: number;
  enabled: boolean;
  config?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAgentExecutionPhaseRequest {
  name: string;
  displayName?: string;
  description?: string;
  order?: number;
  enabled?: boolean;
  config?: Record<string, unknown>;
}

export interface UpdateAgentExecutionPhaseRequest {
  displayName?: string;
  description?: string;
  order?: number;
  enabled?: boolean;
  config?: Record<string, unknown>;
}

export interface ResetAgentExecutionPhasesRequest {
  force?: boolean;
}
