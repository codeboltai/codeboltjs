// Environment Debug API types

export interface EnvironmentDebugInstance {
  id: string;
  environmentId: string;
  providerId: string;
  status: string;
  startedAt?: string;
  stoppedAt?: string;
  logs?: string[];
}

export interface EnvironmentDebugLog {
  timestamp: string;
  level: string;
  message: string;
  data?: Record<string, unknown>;
}

export interface EnvironmentDebugInstancesParams {
  status?: string;
  providerId?: string;
  limit?: number;
  offset?: number;
}

export interface EnvironmentDebugFilteredParams {
  status?: string;
  providerId?: string;
  environmentId?: string;
  limit?: number;
  offset?: number;
}

export interface EnvironmentDebugLogsParams {
  level?: string;
  limit?: number;
  offset?: number;
}

export interface RebuildEnvironmentIndexRequest {
  force?: boolean;
}
