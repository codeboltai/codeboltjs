/**
 * Browser tools
 */

export { BrowserActionTool, type BrowserActionToolParams, type BrowserActionType } from './browser-action';

// Create instances for convenience
import { BrowserActionTool } from './browser-action';

/**
 * All browser tools
 */
export const browserTools = [
    new BrowserActionTool(),
];
