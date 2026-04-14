import type { ExecutorOptions, CodeboltInstance } from '../../types.js';

export type PiThinkingLevel = 'off' | 'minimal' | 'low' | 'medium' | 'high' | 'xhigh';

export interface PiExecutorOptions extends ExecutorOptions {
    /** Model in provider/model format (e.g. 'xai/grok-4') */
    model?: string;
    /** Thinking level */
    thinking?: PiThinkingLevel;
}

export interface PiAgentOptions extends PiExecutorOptions {
    /** The codebolt instance */
    codebolt: CodeboltInstance;
    /** Whether to auto-dispatch messages to codebolt.notify.*. Default: true */
    autoDispatch?: boolean;
}
