// --- Enums and Constants ---

/** Step status */
export type StepStatus = 'pending' | 'active' | 'running' | 'completed' | 'failed' | 'skipped' | 'cancelled';

// --- Core Entities ---

/** Thread step */
export interface ThreadStep {
  id: string;
  stepId: string;
  threadId: string;
  name?: string;
  description?: string;
  status: StepStatus;
  type?: string;
  input?: unknown;
  output?: unknown;
  error?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
  startedAt?: string;
  completedAt?: string;
  metadata?: Record<string, unknown>;
}

/** Step statistics */
export interface StepStatistics {
  total: number;
  byStatus: Record<string, number>;
  averageDuration?: number;
}

// --- Request Types ---

/** Create step request */
export interface CreateStepRequest {
  stepId?: string;
  threadId: string;
  name?: string;
  description?: string;
  type?: string;
  input?: unknown;
  order?: number;
  metadata?: Record<string, unknown>;
}

/** Update step request */
export interface UpdateStepRequest {
  name?: string;
  description?: string;
  status?: StepStatus;
  input?: unknown;
  output?: unknown;
  error?: string;
  order?: number;
  metadata?: Record<string, unknown>;
}

/** Step list params */
export interface StepListParams {
  threadId?: string;
  status?: StepStatus;
  type?: string;
  limit?: number;
  offset?: number;
}

/** Bulk update steps request */
export interface BulkUpdateStepsRequest {
  stepIds: string[];
  updates: Partial<UpdateStepRequest>;
}

/** Bulk delete steps request */
export interface BulkDeleteStepsRequest {
  stepIds: string[];
}

/** Update step status request */
export interface UpdateStepStatusRequest {
  status: string;
}

/** Execute step request */
export interface ExecuteStepRequest {
  input?: unknown;
  config?: Record<string, unknown>;
}

/** Complete step request */
export interface CompleteStepRequest {
  result?: unknown;
}

/** Fail step request */
export interface FailStepRequest {
  error?: string;
}

/** Skip step request */
export interface SkipStepRequest {
  reason?: string;
}

/** Health check response */
export interface HealthCheckResponse {
  status: string;
  timestamp?: string;
}
