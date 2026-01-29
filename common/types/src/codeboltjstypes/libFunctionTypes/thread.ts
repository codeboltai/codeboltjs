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
