/**
 * Git tools - Individual tools for each git action
 */

// Individual git tools
export { GitInitTool, type GitInitParams } from './init';
export { GitStatusTool, type GitStatusParams } from './status';
export { GitAddTool, type GitAddParams } from './add';
export { GitCommitTool, type GitCommitParams } from './commit';
export { GitPushTool, type GitPushParams } from './push';
export { GitPullTool, type GitPullParams } from './pull';
export { GitCheckoutTool, type GitCheckoutParams } from './checkout';
export { GitBranchTool, type GitBranchParams } from './branch';
export { GitLogsTool, type GitLogsParams } from './logs';
export { GitDiffTool, type GitDiffParams } from './diff';
export { GitCloneTool, type GitCloneParams } from './clone';

// Create instances for convenience
import { GitInitTool } from './init';
import { GitStatusTool } from './status';
import { GitAddTool } from './add';
import { GitCommitTool } from './commit';
import { GitPushTool } from './push';
import { GitPullTool } from './pull';
import { GitCheckoutTool } from './checkout';
import { GitBranchTool } from './branch';
import { GitLogsTool } from './logs';
import { GitDiffTool } from './diff';
import { GitCloneTool } from './clone';

/**
 * All git tools
 */
export const gitTools = [
    new GitInitTool(),
    new GitStatusTool(),
    new GitAddTool(),
    new GitCommitTool(),
    new GitPushTool(),
    new GitPullTool(),
    new GitCheckoutTool(),
    new GitBranchTool(),
    new GitLogsTool(),
    new GitDiffTool(),
    new GitCloneTool(),
];
