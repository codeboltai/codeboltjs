/**
 * @fileoverview E2B Provider for CodeBolt (Modular Architecture)
 * @description Main entry point with modular structure and proper TypeScript organization
 */

// Import required dependencies
const codebolt = require('@codebolt/codeboltjs');

// Import all handler modules
import {
  onProviderStart,
  onCloseSignal,
  getSandboxStatus
} from './handlers/lifecycle';

import {
  onProviderAgentStart,
  onGetDiffFiles,
  onCreatePatchRequest,
  onCreatePullRequestRequest,
  handleListFiles
} from './handlers/agent';

// Re-export types for external use
export * from './types';

// Re-export utilities for external use
export * from './utils';

// Re-export handlers for external use
export * from './handlers';

// Register CodeBolt event handlers
console.log('[E2B Provider] Registering event handlers...');

/**
 * Provider start handler - creates sandbox
 */
codebolt.onProviderStart(onProviderStart);

/**
 * Provider agent start handler - starts agent loop with sandbox
 */
codebolt.onProviderAgentStart(onProviderAgentStart);

/**
 * Get diff files handler - uses sandbox git
 */
codebolt.onGetDiffFiles(onGetDiffFiles);

/**
 * Close signal handler - destroys sandbox
 */
codebolt.onCloseSignal(onCloseSignal);

/**
 * Create patch request handler
 */
codebolt.onCreatePatchRequest(onCreatePatchRequest);

/**
 * Create pull request handler
 */
codebolt.onCreatePullRequestRequest(onCreatePullRequestRequest);

console.log('[E2B Provider] All event handlers registered successfully');

// Export utility functions for external use (maintaining backward compatibility)
const exportedUtils = {
  getSandboxStatus,
  handleListFiles
};

// CommonJS export for backward compatibility
module.exports = exportedUtils;

// ES6 export
export default exportedUtils;

console.log('[E2B Provider] Modular E2B provider loaded successfully!');