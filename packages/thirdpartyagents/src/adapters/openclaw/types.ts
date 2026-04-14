import type { CodeboltInstance } from '../../types.js';

export interface OpenClawExecutorOptions {
    /** WebSocket gateway URL (ws:// or wss://) */
    url: string;
    /** Authentication token */
    authToken?: string;
    /** Shared password for device pairing */
    sharedPassword?: string;
    /** Client identifier */
    clientId?: string;
    /** Session key strategy: 'issue', 'run', or 'fixed' */
    sessionKeyStrategy?: 'issue' | 'run' | 'fixed';
    /** Fixed session key (used when strategy is 'fixed') */
    sessionKey?: string;
    /** Timeout in seconds. Default: 120 */
    timeoutSec?: number;
    /** Agent ID for the request */
    agentId?: string;
    /** Extra payload fields to merge into every request */
    payloadTemplate?: Record<string, unknown>;
}

export interface OpenClawAgentOptions extends OpenClawExecutorOptions {
    /** The codebolt instance */
    codebolt: CodeboltInstance;
    /** Whether to auto-dispatch messages to codebolt.notify.*. Default: true */
    autoDispatch?: boolean;
}
