/**
 * @codebolt/thirdpartyagents — Shared types and interfaces
 */

// ── Codebolt Instance Interface ──
// Duck-typed interface matching the real codebolt object so the library
// can call codebolt.notify.* without depending on @codebolt/codeboltjs directly.

export interface CodeboltInstance {
    notify: {
        system: {
            AgentInitNotify(...args: any[]): void;
            AgentCompletionNotify(...args: any[]): void;
        };
        chat: {
            AgentTextResponseNotify(...args: any[]): void;
            AgentThinkingNotify(...args: any[]): void;
            UserMessageRequestNotify(...args: any[]): void;
        };
        fs: {
            FileReadRequestNotify(...args: any[]): void;
            WriteToFileRequestNotify(...args: any[]): void;
            FileEditRequestNotify(...args: any[]): void;
            ListDirectoryRequestNotify(...args: any[]): void;
        };
        terminal: {
            CommandExecutionRequestNotify(...args: any[]): void;
        };
        codeutils: {
            GrepSearchRequestNotify(...args: any[]): void;
            GlobSearchRequestNotify(...args: any[]): void;
        };
        browser: {
            WebFetchRequestNotify(...args: any[]): void;
            WebSearchRequestNotify(...args: any[]): void;
        };
        todo: {
            AddTodoRequestNotify(...args: any[]): void;
        };
    };
    project: {
        getProjectPath(): Promise<{ projectPath?: string }>;
    };
}

// ── Message Types ──

export type CodeboltMessageType =
    | 'init'
    | 'assistant_text'
    | 'thinking'
    | 'tool_use'
    | 'tool_result'
    | 'user_text'
    | 'result'
    | 'error'
    | 'system'
    | 'raw';

export interface CodeboltMessage {
    type: CodeboltMessageType;
    timestamp: string;
    text?: string;
    model?: string;
    sessionId?: string;
    toolName?: string;
    toolUseId?: string;
    toolInput?: unknown;
    toolResultContent?: string;
    isError?: boolean;
    usage?: {
        inputTokens: number;
        outputTokens: number;
        cachedTokens: number;
        costUsd: number;
    };
    /** Original raw JSON event from the CLI, for pass-through */
    raw?: unknown;
}

// ── Executor Types ──

export type ExecutorState = 'idle' | 'running' | 'stopped' | 'completed' | 'error';

export interface ExecutorOptions {
    /** CLI command name or absolute path */
    command?: string;
    /** Working directory for the child process */
    cwd?: string;
    /** Extra environment variables for the child process */
    env?: Record<string, string>;
    /** Timeout in seconds (0 = no timeout). Default: 0 */
    timeoutSec?: number;
    /** Session ID to resume a previous session */
    sessionId?: string;
}

// ── Core Interfaces ──

export interface IExecutor {
    readonly state: ExecutorState;
    readonly sessionId: string | null;
    /** Spawn the CLI and yield raw stdout lines */
    execute(prompt: string): AsyncIterable<string>;
    /** Terminate the running process */
    stop(): void;
    /** Write to stdin of the running process */
    sendInput(text: string): void;
    /** Set the session ID (called when init message is received) */
    setSessionId?(id: string): void;
}

export interface IFormatter {
    /** Parse a single raw stdout line into zero or more CodeboltMessages */
    parseLine(line: string, timestamp: string): CodeboltMessage[];
    /** Convert stderr text into an error CodeboltMessage */
    parseError(text: string): CodeboltMessage;
}

export interface IDispatcher {
    /** Dispatch a CodeboltMessage to codebolt.notify.* */
    dispatch(message: CodeboltMessage, codebolt: CodeboltInstance): void;
}

// ── Public Handle ──

export interface ThirdPartyAgentHandle {
    /** Async iterable of messages. Each is auto-dispatched to codebolt AND yielded. */
    execute(): AsyncIterable<CodeboltMessage>;
    /** Stop the running agent */
    stop(): void;
    /** Send text to the agent's stdin */
    sendInput(text: string): void;
    /** Current execution state */
    readonly state: ExecutorState;
    /** Session ID (available after init message) */
    readonly sessionId: string | null;
}
