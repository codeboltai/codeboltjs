/**
 * Git tools
 */

export { GitActionTool, type GitActionToolParams, type GitActionType } from './git-action';

// Create instances for convenience
import { GitActionTool } from './git-action';

/**
 * All git tools
 */
export const gitTools = [
    new GitActionTool(),
];
