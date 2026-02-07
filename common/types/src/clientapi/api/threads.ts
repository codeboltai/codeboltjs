// --- Enums and Constants ---

/** Thread status */
export type ThreadStatus = 'active' | 'archived' | 'closed' | 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';

/** Thread type */
export type ThreadType = 'chat' | 'task' | 'agent' | 'system';

// --- Core Entities ---

/** Thread info */
export interface ThreadInfo {
  id: string;
  title?: string;
  type: ThreadType;
  status: ThreadStatus;
  createdAt: string;
  updatedAt: string;
  messageCount?: number;
  lastMessagePreview?: string;
  metadata?: Record<string, unknown>;
}

/** Thread with messages */
export interface Thread extends ThreadInfo {
  messages: unknown[];
  agentId?: string;
  projectPath?: string;
  progress?: number;
  parentThreadId?: string;
  childThreadIds?: string[];
}

/** Thread statistics */
export interface ThreadStatistics {
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
}

/** Thread graph node */
export interface ThreadGraphNode {
  id: string;
  title?: string;
  status: ThreadStatus;
  type: ThreadType;
  children?: string[];
  dependencies?: string[];
}

/** Thread timeline event */
export interface ThreadTimelineEvent {
  id: string;
  threadId: string;
  eventType: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

// --- Request Types ---

/** Create thread request */
export interface CreateThreadRequest {
  title?: string;
  type?: ThreadType;
  agentId?: string;
  projectPath?: string;
  parentThreadId?: string;
  metadata?: Record<string, unknown>;
}

/** Update thread request */
export interface UpdateThreadRequest {
  title?: string;
  status?: ThreadStatus;
  type?: ThreadType;
  metadata?: Record<string, unknown>;
}

/** Advanced search request */
export interface ThreadSearchRequest {
  query?: string;
  status?: ThreadStatus[];
  type?: ThreadType[];
  createdAfter?: string;
  createdBefore?: string;
  limit?: number;
  offset?: number;
}

/** Bulk update request */
export interface ThreadBulkUpdateRequest {
  threadIds: string[];
  updates: Partial<UpdateThreadRequest>;
}

/** Bulk delete request */
export interface ThreadBulkDeleteRequest {
  threadIds: string[];
}

/** Auto update name request */
export interface AutoUpdateNameRequest {
  threadId: string;
  message?: string;
}

/** Thread list params */
export interface ThreadListParams {
  limit?: number;
  offset?: number;
  status?: string;
}

/** Update thread status request */
export interface UpdateThreadStatusRequest {
  status: string;
}

/** Update thread progress request */
export interface UpdateThreadProgressRequest {
  progress: number;
}

/** Execute thread request */
export interface ExecuteThreadRequest {
  input?: unknown;
  config?: Record<string, unknown>;
}
