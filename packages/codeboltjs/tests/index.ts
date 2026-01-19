/**
 * Test Setup Index File
 *
 * This file provides a convenient entry point for importing all test utilities.
 * You can import from './tests' instead of './tests/setup'.
 *
 * @example
 * ```typescript
 * // Instead of:
 * import { sharedCodebolt, waitForConnection } from './tests/setup';
 *
 * // You can use:
 * import { sharedCodebolt, waitForConnection } from './tests';
 * ```
 */

// Export everything from setup.ts
export * from './setup';

// Re-export default for convenience
export { default } from './setup';
export { sharedCodebolt } from './setup';
