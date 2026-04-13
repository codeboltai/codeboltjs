import type { ExecutorOptions, CodeboltInstance } from '../../types.js';

export type ClaudePermissionMode = 'plan' | 'acceptEdits' | 'bypassPermissions' | 'default';

export interface ClaudeExecutorOptions extends ExecutorOptions {
    /** Permission mode for Claude CLI. Default: 'bypassPermissions' */
    permissionMode?: ClaudePermissionMode;
    /** Model override (e.g. 'claude-sonnet-4-6') */
    model?: string;
    /** Max turns per run */
    maxTurns?: number;
    /** Whether to add --dangerously-skip-permissions flag */
    dangerouslySkipPermissions?: boolean;
}

export interface ClaudeAgentOptions extends ClaudeExecutorOptions {
    /** The codebolt instance — library uses this for all Codebolt communication */
    codebolt: CodeboltInstance;
    /** Whether to auto-dispatch messages to codebolt.notify.*. Default: true */
    autoDispatch?: boolean;
}
