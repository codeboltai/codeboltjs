import type { ExecutorOptions, CodeboltInstance } from '../../types.js';

export type CursorMode = 'plan' | 'ask';

export interface CursorExecutorOptions extends ExecutorOptions {
    /** Model override (e.g. 'composer-1.5', 'claude-sonnet-4-6') */
    model?: string;
    /** Execution mode: 'plan' for planning, 'ask' for Q&A */
    mode?: CursorMode;
    /** Whether to auto-trust all operations (--yolo). Default: true */
    yolo?: boolean;
}

export interface CursorAgentOptions extends CursorExecutorOptions {
    /** The codebolt instance */
    codebolt: CodeboltInstance;
    /** Whether to auto-dispatch messages to codebolt.notify.*. Default: true */
    autoDispatch?: boolean;
}
