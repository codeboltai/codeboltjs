/**
 * @fileoverview E2B Provider Handlers Index
 * @description Central export point for all handler modules
 */

// Lifecycle handlers
export * from './lifecycle';

// Agent handlers
export * from './agent';

// Re-export commonly used handlers for convenience
export {
  onProviderStart,
  onCloseSignal,
  getSandboxStatus,
  getCurrentSandbox,
  getIsInitialized
} from './lifecycle';

export {
  onProviderAgentStart,
  onGetDiffFiles,
  onCreatePatchRequest,
  onCreatePullRequestRequest,
  handleListFiles
} from './agent';