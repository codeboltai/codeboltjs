// Agent Execution API types

export interface AgentExecutionRecord {
  id: string;
  threadId: string;
  agentId: string;
  agentName?: string;
  swarmId?: string;
  status: string;
  startSource?: string;
  isBackground?: boolean;
  startedAt: string;
  completedAt?: string;
  result?: Record<string, unknown>;
}

export interface AgentExecutionFilterParams {
  status?: string;
  swarmId?: string;
  startSource?: string;
  threadId?: string;
  isBackground?: boolean;
}

export interface AgentExecutionTree {
  execution: AgentExecutionRecord;
  children: AgentExecutionTree[];
}

export interface CleanupExecutionsParams {
  daysOld?: number;
}
