// --- Enums and Constants ---

/** Task activity type */
export type TaskActivityType = 'prestart' | 'start' | 'progress' | 'completion' | 'error' | 'status_change' | 'note';

/** Task activity status */
export type TaskActivityStatus = 'pending' | 'active' | 'completed' | 'failed';

// --- Core Entities ---

/** Task activity */
export interface TaskActivity {
  id: string;
  taskId: string;
  threadId?: string;
  type: TaskActivityType;
  status: TaskActivityStatus;
  description?: string;
  data?: Record<string, unknown>;
  createdAt: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}

/** Task details with activities */
export interface TaskDetailsWithActivities {
  taskId: string;
  activities: TaskActivity[];
  metadata?: Record<string, unknown>;
}

/** Task activity statistics */
export interface TaskActivityStatistics {
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
}

// --- Request Types ---

/** Create task activity request */
export interface CreateTaskActivityRequest {
  taskId: string;
  threadId?: string;
  type: TaskActivityType;
  status?: TaskActivityStatus;
  description?: string;
  data?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/** Create prestart activity request */
export interface CreatePrestartActivityRequest {
  taskId: string;
  threadId?: string;
  description?: string;
  data?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/** Update task activity request */
export interface UpdateTaskActivityRequest {
  type?: TaskActivityType;
  status?: TaskActivityStatus;
  description?: string;
  data?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/** Task activity list params */
export interface TaskActivityListParams {
  taskId?: string;
  threadId?: string;
  type?: TaskActivityType;
  status?: TaskActivityStatus;
  limit?: number;
  offset?: number;
}

/** Cleanup params */
export interface TaskActivityCleanupParams {
  before?: string;
}
