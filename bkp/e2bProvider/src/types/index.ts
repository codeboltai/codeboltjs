/**
 * @fileoverview E2B Provider Types Index
 * @description Central export point for all type definitions
 */

// Sandbox types
export * from './sandbox.js';

// Provider types
export * from './provider.js';

// Re-export commonly used types for convenience
export type {
  E2BSandbox,
  SandboxConfig,
  GitStatus,
  TerminalResult
} from './sandbox.js';

export type {
  InitVars,
  ProviderConfig,
  ProviderStatus,
  AgentStartParams
} from './provider.js';