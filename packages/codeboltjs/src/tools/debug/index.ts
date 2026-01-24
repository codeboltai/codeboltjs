/**
 * Debug tools - Individual tools for debug operations
 */

// Individual debug tools
export { DebugAddLogTool, type DebugAddLogParams } from './debug-add-log';
export { DebugOpenBrowserTool, type DebugOpenBrowserParams } from './debug-open-browser';

// Create instances for convenience
import { DebugAddLogTool } from './debug-add-log';
import { DebugOpenBrowserTool } from './debug-open-browser';

/**
 * All debug tools
 */
export const debugTools = [
    new DebugAddLogTool(),
    new DebugOpenBrowserTool(),
];
