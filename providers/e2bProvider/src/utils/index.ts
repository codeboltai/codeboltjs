/**
 * @fileoverview E2B Provider Utils Index
 * @description Central export point for all utility modules
 */

// Sandbox management utilities
export * from './sandboxManager';

// Message and notification helpers
export * from './messageHelpers';

/**
 * Filters NODE_OPTIONS to only include options supported in packaged apps
 * @param nodeOptions - The NODE_OPTIONS string to filter
 * @returns Filtered NODE_OPTIONS string or undefined if no supported options
 */
export function filterNodeOptions(nodeOptions?: string): string | undefined {
  if (!nodeOptions) return undefined;
  
  const supportedOptions = ['--max-http-header-size', '--http-parser'];
  const currentOptions = nodeOptions.split(' ').filter(option => 
    option.trim() && supportedOptions.some(supported => option.includes(supported))
  );
  
  return currentOptions.length > 0 ? currentOptions.join(' ') : undefined;
}

/**
 * Creates a clean environment object with NODE_OPTIONS filtered for packaged apps
 * @param env - Environment object to clean (defaults to process.env)
 * @returns Clean environment object
 */
export function createCleanEnvironment(env: NodeJS.ProcessEnv = process.env): NodeJS.ProcessEnv {
  const cleanEnv = { ...env };
  
  if (cleanEnv.NODE_OPTIONS) {
    const filteredOptions = filterNodeOptions(cleanEnv.NODE_OPTIONS);
    if (filteredOptions) {
      cleanEnv.NODE_OPTIONS = filteredOptions;
    } else {
      delete cleanEnv.NODE_OPTIONS;
    }
  }
  
  return cleanEnv;
}

// Re-export commonly used utilities for convenience
export {
  SandboxManager,
  createE2BSandbox,
  defaultSandboxManager
} from './sandboxManager';

export {
  sendNotification,
  sendAgentNotification,
  sendFsNotification,
  sendTerminalNotification,
  sendGitNotification
} from './messageHelpers';