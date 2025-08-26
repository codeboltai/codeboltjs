/**
 * @fileoverview E2B Provider Type Definitions
 * @description Type definitions for provider configuration and initialization
 */

/**
 * Provider initialization variables interface
 */
export interface InitVars {
  apiKey?: string;
  template?: string;
  environment?: Record<string, string>;
  timeout?: number;
  maxSandboxes?: number;
}

/**
 * Provider configuration interface
 */
export interface ProviderConfig {
  name: string;
  version: string;
  description?: string;
  capabilities: string[];
  settings: {
    defaultTemplate?: string;
    maxConcurrentSandboxes?: number;
    sandboxTimeout?: number;
  };
}

/**
 * Provider status interface
 */
export interface ProviderStatus {
  status: 'initializing' | 'ready' | 'error' | 'destroying';
  sandboxId?: string;
  error?: string;
  timestamp: string;
}

/**
 * User message interface
 */
export interface UserMessage {
  userMessage: string;
  conversationId?: string;
  timestamp?: string;
  metadata?: Record<string, any>;
}

/**
 * Agent start parameters interface
 */
export interface AgentStartParams {
  userMessage: UserMessage;
  context?: Record<string, any>;
  options?: {
    timeout?: number;
    maxIterations?: number;
  };
}

/**
 * Diff files result interface
 */
export interface DiffFilesResult {
  diff: string;
  files: string[];
  metadata?: {
    totalChanges: number;
    additions: number;
    deletions: number;
  };
}

/**
 * Patch creation result interface
 */
export interface PatchResult {
  patchId: string;
  status: 'patch_created' | 'patch_failed';
  error?: string;
}

/**
 * Pull request creation result interface
 */
export interface PullRequestResult {
  pullRequestId: string;
  status: 'pull_request_created' | 'pull_request_failed';
  error?: string;
}