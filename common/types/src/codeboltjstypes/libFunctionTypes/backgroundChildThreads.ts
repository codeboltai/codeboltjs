/**
 * Background Child Threads SDK Function Types
 * Types for the backgroundChildThreads module functions
 */

// Base response interface for background thread operations
export interface BaseBackgroundThreadSDKResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

/**
 * Background agent data structure
 */
export interface BackgroundAgentData {
  threadId?: string;
  agentId?: string;
  status?: string;
  startedAt?: string;
  result?: unknown;
  error?: string;
  success?: boolean;
  type?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Background agent completion data
 */
export interface BackgroundAgentCompletion extends BackgroundAgentData {
  completedAt?: string;
}

/**
 * Grouped agent completion data
 */
export interface GroupedAgentCompletion {
  threadId: string;
  groupId?: string;
  agentId?: string;
  status?: 'completed' | 'failed' | 'cancelled';
  result?: unknown;
  error?: string;
  completedAt?: string;
}

/**
 * External event types
 */
export type BackgroundExternalEventType =
  | 'backgroundAgentCompletion'
  | 'backgroundGroupedAgentCompletion';

/**
 * External event structure
 */
export interface BackgroundExternalEvent {
  type: BackgroundExternalEventType;
  data: BackgroundAgentCompletion | BackgroundAgentCompletion[] | null;
}
