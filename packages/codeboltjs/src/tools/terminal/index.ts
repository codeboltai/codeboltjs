/**
 * Terminal tools
 */

export { ExecuteCommandTool, type ExecuteCommandToolParams } from './execute-command';

// Create instances for convenience
import { ExecuteCommandTool } from './execute-command';

/**
 * All terminal tools
 */
export const terminalTools = [
    new ExecuteCommandTool(),
];
