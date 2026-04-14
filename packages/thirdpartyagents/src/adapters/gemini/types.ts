import type { ExecutorOptions, CodeboltInstance } from '../../types.js';

export interface GeminiExecutorOptions extends ExecutorOptions {
    /** Model override (e.g. 'gemini-2.5-pro') */
    model?: string;
    /** Enable sandbox mode */
    sandbox?: boolean;
}

export interface GeminiAgentOptions extends GeminiExecutorOptions {
    /** The codebolt instance */
    codebolt: CodeboltInstance;
    /** Whether to auto-dispatch messages to codebolt.notify.*. Default: true */
    autoDispatch?: boolean;
}
