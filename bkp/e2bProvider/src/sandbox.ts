/**
 * @fileoverview E2B Sandbox Interface
 * @description Clean interface for E2B sandbox operations, delegating to utilities
 */

// Re-export types
export * from './types/sandbox.js';

// Re-export sandbox utilities
export {
  MockE2BSandbox,
  createE2BSandbox,
  SandboxManager,
  defaultSandboxManager
} from './utils/sandboxManager.js';

// Re-export for backward compatibility
export { createE2BSandbox as default } from './utils/sandboxManager.js';