import type { ExecutorOptions, CodeboltInstance } from '../../types.js';

export type OpenCodeVariant = 'minimal' | 'low' | 'medium' | 'high' | 'xhigh' | 'max';

export interface OpenCodeExecutorOptions extends ExecutorOptions {
    /** Model in provider/model format (e.g. 'openai/gpt-5.2-codex') */
    model?: string;
    /** Variant level */
    variant?: OpenCodeVariant;
}

export interface OpenCodeAgentOptions extends OpenCodeExecutorOptions {
    /** The codebolt instance */
    codebolt: CodeboltInstance;
    /** Whether to auto-dispatch messages to codebolt.notify.*. Default: true */
    autoDispatch?: boolean;
}
