/**
 * @codebolt/thirdpartyagents
 *
 * Run external CLI agents (Claude Code, Codex, Gemini, Cursor, OpenCode, Pi, OpenClaw)
 * with automatic Codebolt communication. Pass the codebolt object and the
 * library handles all notify.* calls. Messages are also streamed for
 * optional additional processing.
 *
 * @example
 * ```typescript
 * import codebolt from '@codebolt/codeboltjs';
 * import { ThirdPartyAgents } from '@codebolt/thirdpartyagents';
 *
 * codebolt.onMessage(async (msg) => {
 *   const handle = ThirdPartyAgents.claude(msg.userMessage, {
 *     codebolt,
 *     cwd: '/path/to/project',
 *   });
 *
 *   for await (const message of handle.execute()) {
 *     // Library already dispatched to codebolt.notify.*
 *     // Do additional processing here if needed
 *     console.log(message.type, message.text);
 *   }
 * });
 * ```
 */

// ── Claude ──
import { ClaudeExecutor } from './adapters/claude/ClaudeExecutor.js';
import { ClaudeFormatter } from './adapters/claude/ClaudeFormatter.js';
import { ClaudeDispatcher } from './adapters/claude/ClaudeDispatcher.js';
import type { ClaudeAgentOptions } from './adapters/claude/types.js';

// ── Codex ──
import { CodexExecutor } from './adapters/codex/CodexExecutor.js';
import { CodexFormatter } from './adapters/codex/CodexFormatter.js';
import { CodexDispatcher } from './adapters/codex/CodexDispatcher.js';
import type { CodexAgentOptions } from './adapters/codex/types.js';

// ── Gemini ──
import { GeminiExecutor } from './adapters/gemini/GeminiExecutor.js';
import { GeminiFormatter } from './adapters/gemini/GeminiFormatter.js';
import { GeminiDispatcher } from './adapters/gemini/GeminiDispatcher.js';
import type { GeminiAgentOptions } from './adapters/gemini/types.js';

// ── Cursor ──
import { CursorExecutor } from './adapters/cursor/CursorExecutor.js';
import { CursorFormatter } from './adapters/cursor/CursorFormatter.js';
import { CursorDispatcher } from './adapters/cursor/CursorDispatcher.js';
import type { CursorAgentOptions } from './adapters/cursor/types.js';

// ── OpenCode ──
import { OpenCodeExecutor } from './adapters/opencode/OpenCodeExecutor.js';
import { OpenCodeFormatter } from './adapters/opencode/OpenCodeFormatter.js';
import { OpenCodeDispatcher } from './adapters/opencode/OpenCodeDispatcher.js';
import type { OpenCodeAgentOptions } from './adapters/opencode/types.js';

// ── Pi ──
import { PiExecutor } from './adapters/pi/PiExecutor.js';
import { PiFormatter } from './adapters/pi/PiFormatter.js';
import { PiDispatcher } from './adapters/pi/PiDispatcher.js';
import type { PiAgentOptions } from './adapters/pi/types.js';

// ── OpenClaw ──
import { OpenClawExecutor } from './adapters/openclaw/OpenClawExecutor.js';
import { OpenClawFormatter } from './adapters/openclaw/OpenClawFormatter.js';
import { OpenClawDispatcher } from './adapters/openclaw/OpenClawDispatcher.js';
import type { OpenClawAgentOptions } from './adapters/openclaw/types.js';

import { createMessageStream } from './stream/MessageStream.js';
import type { ThirdPartyAgentHandle } from './types.js';

export class ThirdPartyAgents {
    /**
     * Create a Claude Code agent handle.
     */
    static claude(prompt: string, options: ClaudeAgentOptions): ThirdPartyAgentHandle {
        const { codebolt, autoDispatch, ...executorOptions } = options;
        const executor = new ClaudeExecutor(executorOptions);
        const formatter = new ClaudeFormatter();
        const dispatcher = new ClaudeDispatcher();
        const shouldDispatch = autoDispatch !== false;
        const stream = createMessageStream(
            executor, formatter,
            shouldDispatch ? dispatcher : null,
            shouldDispatch ? codebolt : null,
            prompt,
        );
        return {
            execute: () => stream,
            stop: () => executor.stop(),
            sendInput: (text: string) => executor.sendInput(text),
            get state() { return executor.state; },
            get sessionId() { return executor.sessionId; },
        };
    }

    /**
     * Create an OpenAI Codex agent handle.
     */
    static codex(prompt: string, options: CodexAgentOptions): ThirdPartyAgentHandle {
        const { codebolt, autoDispatch, ...executorOptions } = options;
        const executor = new CodexExecutor(executorOptions);
        const formatter = new CodexFormatter();
        const dispatcher = new CodexDispatcher();
        const shouldDispatch = autoDispatch !== false;
        const stream = createMessageStream(
            executor, formatter,
            shouldDispatch ? dispatcher : null,
            shouldDispatch ? codebolt : null,
            prompt,
        );
        return {
            execute: () => stream,
            stop: () => executor.stop(),
            sendInput: (text: string) => executor.sendInput(text),
            get state() { return executor.state; },
            get sessionId() { return executor.sessionId; },
        };
    }

    /**
     * Create a Google Gemini CLI agent handle.
     */
    static gemini(prompt: string, options: GeminiAgentOptions): ThirdPartyAgentHandle {
        const { codebolt, autoDispatch, ...executorOptions } = options;
        const executor = new GeminiExecutor(executorOptions);
        const formatter = new GeminiFormatter();
        const dispatcher = new GeminiDispatcher();
        const shouldDispatch = autoDispatch !== false;
        const stream = createMessageStream(
            executor, formatter,
            shouldDispatch ? dispatcher : null,
            shouldDispatch ? codebolt : null,
            prompt,
        );
        return {
            execute: () => stream,
            stop: () => executor.stop(),
            sendInput: (text: string) => executor.sendInput(text),
            get state() { return executor.state; },
            get sessionId() { return executor.sessionId; },
        };
    }

    /**
     * Create a Cursor Agent CLI handle.
     */
    static cursor(prompt: string, options: CursorAgentOptions): ThirdPartyAgentHandle {
        const { codebolt, autoDispatch, ...executorOptions } = options;
        const executor = new CursorExecutor(executorOptions);
        const formatter = new CursorFormatter();
        const dispatcher = new CursorDispatcher();
        const shouldDispatch = autoDispatch !== false;
        const stream = createMessageStream(
            executor, formatter,
            shouldDispatch ? dispatcher : null,
            shouldDispatch ? codebolt : null,
            prompt,
        );
        return {
            execute: () => stream,
            stop: () => executor.stop(),
            sendInput: (text: string) => executor.sendInput(text),
            get state() { return executor.state; },
            get sessionId() { return executor.sessionId; },
        };
    }

    /**
     * Create an OpenCode CLI agent handle.
     */
    static opencode(prompt: string, options: OpenCodeAgentOptions): ThirdPartyAgentHandle {
        const { codebolt, autoDispatch, ...executorOptions } = options;
        const executor = new OpenCodeExecutor(executorOptions);
        const formatter = new OpenCodeFormatter();
        const dispatcher = new OpenCodeDispatcher();
        const shouldDispatch = autoDispatch !== false;
        const stream = createMessageStream(
            executor, formatter,
            shouldDispatch ? dispatcher : null,
            shouldDispatch ? codebolt : null,
            prompt,
        );
        return {
            execute: () => stream,
            stop: () => executor.stop(),
            sendInput: (text: string) => executor.sendInput(text),
            get state() { return executor.state; },
            get sessionId() { return executor.sessionId; },
        };
    }
    /**
     * Create a Pi AI Agent CLI handle.
     */
    static pi(prompt: string, options: PiAgentOptions): ThirdPartyAgentHandle {
        const { codebolt, autoDispatch, ...executorOptions } = options;
        const executor = new PiExecutor(executorOptions);
        const formatter = new PiFormatter();
        const dispatcher = new PiDispatcher();
        const shouldDispatch = autoDispatch !== false;
        const stream = createMessageStream(
            executor, formatter,
            shouldDispatch ? dispatcher : null,
            shouldDispatch ? codebolt : null,
            prompt,
        );
        return {
            execute: () => stream,
            stop: () => executor.stop(),
            sendInput: (text: string) => executor.sendInput(text),
            get state() { return executor.state; },
            get sessionId() { return executor.sessionId; },
        };
    }

    /**
     * Create an OpenClaw Gateway agent handle (WebSocket-based).
     */
    static openclaw(prompt: string, options: OpenClawAgentOptions): ThirdPartyAgentHandle {
        const { codebolt, autoDispatch, ...executorOptions } = options;
        const executor = new OpenClawExecutor(executorOptions);
        const formatter = new OpenClawFormatter();
        const dispatcher = new OpenClawDispatcher();
        const shouldDispatch = autoDispatch !== false;
        const stream = createMessageStream(
            executor, formatter,
            shouldDispatch ? dispatcher : null,
            shouldDispatch ? codebolt : null,
            prompt,
        );
        return {
            execute: () => stream,
            stop: () => executor.stop(),
            sendInput: (text: string) => executor.sendInput(text),
            get state() { return executor.state; },
            get sessionId() { return executor.sessionId; },
        };
    }
}

// ── Re-exports: Core types ──
export type {
    CodeboltMessage,
    CodeboltMessageType,
    CodeboltInstance,
    ExecutorState,
    ExecutorOptions,
    ThirdPartyAgentHandle,
    IExecutor,
    IFormatter,
    IDispatcher,
} from './types.js';

// ── Re-exports: Base classes ──
export { BaseExecutor } from './base/BaseExecutor.js';
export { BaseFormatter } from './base/BaseFormatter.js';
export { BaseDispatcher } from './base/BaseDispatcher.js';
export { createMessageStream } from './stream/MessageStream.js';

// ── Re-exports: Claude ──
export type { ClaudeExecutorOptions, ClaudeAgentOptions, ClaudePermissionMode } from './adapters/claude/types.js';
export { ClaudeExecutor } from './adapters/claude/ClaudeExecutor.js';
export { ClaudeFormatter } from './adapters/claude/ClaudeFormatter.js';
export { ClaudeDispatcher } from './adapters/claude/ClaudeDispatcher.js';

// ── Re-exports: Codex ──
export type { CodexExecutorOptions, CodexAgentOptions } from './adapters/codex/types.js';
export { CodexExecutor } from './adapters/codex/CodexExecutor.js';
export { CodexFormatter } from './adapters/codex/CodexFormatter.js';
export { CodexDispatcher } from './adapters/codex/CodexDispatcher.js';

// ── Re-exports: Gemini ──
export type { GeminiExecutorOptions, GeminiAgentOptions } from './adapters/gemini/types.js';
export { GeminiExecutor } from './adapters/gemini/GeminiExecutor.js';
export { GeminiFormatter } from './adapters/gemini/GeminiFormatter.js';
export { GeminiDispatcher } from './adapters/gemini/GeminiDispatcher.js';

// ── Re-exports: Cursor ──
export type { CursorExecutorOptions, CursorAgentOptions, CursorMode } from './adapters/cursor/types.js';
export { CursorExecutor } from './adapters/cursor/CursorExecutor.js';
export { CursorFormatter } from './adapters/cursor/CursorFormatter.js';
export { CursorDispatcher } from './adapters/cursor/CursorDispatcher.js';

// ── Re-exports: OpenCode ──
export type { OpenCodeExecutorOptions, OpenCodeAgentOptions, OpenCodeVariant } from './adapters/opencode/types.js';
export { OpenCodeExecutor } from './adapters/opencode/OpenCodeExecutor.js';
export { OpenCodeFormatter } from './adapters/opencode/OpenCodeFormatter.js';
export { OpenCodeDispatcher } from './adapters/opencode/OpenCodeDispatcher.js';

// ── Re-exports: Pi ──
export type { PiExecutorOptions, PiAgentOptions, PiThinkingLevel } from './adapters/pi/types.js';
export { PiExecutor } from './adapters/pi/PiExecutor.js';
export { PiFormatter } from './adapters/pi/PiFormatter.js';
export { PiDispatcher } from './adapters/pi/PiDispatcher.js';

// ── Re-exports: OpenClaw ──
export type { OpenClawExecutorOptions, OpenClawAgentOptions } from './adapters/openclaw/types.js';
export { OpenClawExecutor } from './adapters/openclaw/OpenClawExecutor.js';
export { OpenClawFormatter } from './adapters/openclaw/OpenClawFormatter.js';
export { OpenClawDispatcher } from './adapters/openclaw/OpenClawDispatcher.js';
