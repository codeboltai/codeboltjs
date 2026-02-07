// Agent Debug API types

export interface AgentDebugInstance {
  id: string;
  agentId: string;
  agentName?: string;
  agentType?: string;
  threadId?: string;
  swarmId?: string;
  status: string;
  isBackground?: boolean;
  startedAt: string;
  stoppedAt?: string;
}

export interface AgentDebugFilterParams {
  status?: string;
  agentType?: string;
  threadId?: string;
  swarmId?: string;
  isBackground?: boolean;
}

export interface AgentDebugLog {
  timestamp: string;
  level: string;
  message: string;
  data?: Record<string, unknown>;
}

export interface AgentDebugLogsParams {
  offset?: number;
  limit?: number;
}

export interface CleanupAgentDebugParams {
  daysOld?: number;
}

export interface RebuildAgentDebugIndexRequest {
  force?: boolean;
}
