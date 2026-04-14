import type { ExecutorOptions, CodeboltInstance } from '../../types.js';

export interface CodexExecutorOptions extends ExecutorOptions {
    /** Model override (e.g. 'gpt-5.3-codex') */
    model?: string;
    /** Reasoning effort level */
    reasoningEffort?: 'minimal' | 'low' | 'medium' | 'high' | 'xhigh';
    /** Whether to auto-approve all actions */
    fullAutoApprove?: boolean;
}

export interface CodexAgentOptions extends CodexExecutorOptions {
    /** The codebolt instance */
    codebolt: CodeboltInstance;
    /** Whether to auto-dispatch messages to codebolt.notify.*. Default: true */
    autoDispatch?: boolean;
}
