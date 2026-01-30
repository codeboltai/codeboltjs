/**
 * Thread SDK Function Types
 * Types for the threadService module functions
 */

// Base response interface for thread operations
export interface BaseThreadSDKResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

/**
 * File change entry in a thread
 */
export interface ThreadFileChange {
  filePath: string;
  changeType: 'created' | 'modified' | 'deleted' | 'renamed';
  oldPath?: string;
  additions?: number;
  deletions?: number;
  content?: string;
}

/**
 * Thread file changes response
 */
export interface ThreadFileChangesResponse extends BaseThreadSDKResponse {
  threadId?: string;
  changes?: ThreadFileChange[];
  totalChanges?: number;
}

/**
 * Thread file changes summary for ChangesSummaryPanel
 */
export interface ThreadFileChangesSummaryResponse extends BaseThreadSDKResponse {
  threadId?: string;
  title?: string;
  changes?: number;
  files?: string[];
  summary?: string;
}

/**
 * Thread creation options
 */
export interface CreateThreadOptions {
  title?: string;
  description?: string;
  agentId?: string;
  parentThreadId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Options for creating and starting a thread in one operation
 */
export interface CreateAndStartThreadOptions extends CreateThreadOptions {
  autoStart?: boolean;
}

/**
 * Options for getting thread details
 */
export interface GetThreadDetailOptions {
  threadId: string;
  includeMessages?: boolean;
  includeMetadata?: boolean;
}

/**
 * Options for getting thread list
 */
export interface GetThreadListOptions {
  status?: string;
  agentId?: string;
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  metadata?: Record<string, unknown>;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Options for getting thread messages
 */
export interface GetThreadMessagesOptions {
  threadId: string;
  limit?: number;
  offset?: number;
}

/**
 * Options for updating a thread
 */
export interface UpdateThreadOptions {
  threadId: string;
  title?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Thread data structure
 */
export interface ThreadData {
  threadId: string;
  title: string;
  description?: string;
  status: string;
  agentId?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

/**
 * Thread message structure
 */
export interface ThreadMessage {
  messageId: string;
  threadId: string;
  role: string;
  content: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/**
 * Response for creating a thread
 */
export interface CreateThreadResponse extends BaseThreadSDKResponse {
  threadId?: string;
  title?: string;
  description?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Response for starting a thread
 */
export interface StartThreadResponse extends BaseThreadSDKResponse {
  threadId?: string;
  status?: string;
  startedAt?: string;
}

/**
 * Response for getting thread details
 */
export interface GetThreadResponse extends BaseThreadSDKResponse {
  thread?: ThreadData;
  threadId?: string;
  title?: string;
  description?: string;
  status?: string;
  agentId?: string;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Response for listing threads
 */
export interface ListThreadsResponse extends BaseThreadSDKResponse {
  threads?: ThreadData[];
  total?: number;
  limit?: number;
  offset?: number;
  hasMore?: boolean;
}

/**
 * Response for getting thread messages
 */
export interface GetThreadMessagesResponse extends BaseThreadSDKResponse {
  messages?: ThreadMessage[];
  threadId?: string;
  total?: number;
  limit?: number;
  offset?: number;
  hasMore?: boolean;
}

/**
 * Response for updating a thread
 */
export interface UpdateThreadResponse extends BaseThreadSDKResponse {
  threadId?: string;
  title?: string;
  description?: string;
  status?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Response for deleting a thread
 */
export interface DeleteThreadResponse extends BaseThreadSDKResponse {
  threadId?: string;
  deletedAt?: string;
}

/**
 * Response for updating thread status
 */
export interface UpdateThreadStatusResponse extends BaseThreadSDKResponse {
  threadId?: string;
  status?: string;
  previousStatus?: string;
  updatedAt?: string;
}
