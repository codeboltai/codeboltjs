// Action Blocks API types

export interface ActionBlock {
  id: string;
  identifier: string;
  name: string;
  description?: string;
  type: string;
  config?: Record<string, unknown>;
}

export interface ActionBlockDetail {
  identifier: string;
  name: string;
  description?: string;
  type: string;
  inputSchema?: Record<string, unknown>;
  config?: Record<string, unknown>;
}

export interface ActionBlockExecution {
  id: string;
  blockIdentifier: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  result?: Record<string, unknown>;
}

export interface StopActionBlockRequest {
  executionId: string;
}

export interface ActionBlockStats {
  total: number;
  byType: Record<string, number>;
}
