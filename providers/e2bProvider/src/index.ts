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
console.log('[E2B Provider] Modular E2B provider loaded successfully!');

// Filter out unsupported NODE_OPTIONS for packaged apps to prevent warnings
if (process.env.NODE_OPTIONS) {
  const supportedOptions = ['--max-http-header-size', '--http-parser'];
  const currentOptions = process.env.NODE_OPTIONS.split(' ').filter(option => 
    supportedOptions.some(supported => option.includes(supported))
  );
  
  if (currentOptions.length === 0) {
    delete process.env.NODE_OPTIONS;
    console.log('[E2B Provider] Removed unsupported NODE_OPTIONS for packaged app compatibility');
  } else {
    process.env.NODE_OPTIONS = currentOptions.join(' ');
    console.log('[E2B Provider] Filtered NODE_OPTIONS to only supported options:', process.env.NODE_OPTIONS);
  }
}

export default exportedUtils;
