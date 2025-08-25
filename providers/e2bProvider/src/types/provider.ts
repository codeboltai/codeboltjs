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
 * Agent start parameters interface
 */
export interface AgentStartParams {
  userMessage: any; // Using any to avoid circular dependency with codeboltjs UserMessage
  context?: Record<string, any>;
  options?: {
    timeout?: number;
    maxIterations?: number;
  };
}