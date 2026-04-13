/**
 * @codebolt/thirdpartyagents
 *
 * Run external CLI agents (Claude Code, Codex, etc.) with automatic
 * Codebolt communication. Pass the codebolt object and the library
 * handles all notify.* calls. Messages are also streamed for optional
 * additional processing.
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

import { ClaudeExecutor } from './adapters/claude/ClaudeExecutor.js';
import { ClaudeFormatter } from './adapters/claude/ClaudeFormatter.js';
import { ClaudeDispatcher } from './adapters/claude/ClaudeDispatcher.js';
import { createMessageStream } from './stream/MessageStream.js';
import type { ClaudeAgentOptions } from './adapters/claude/types.js';
import type { ThirdPartyAgentHandle } from './types.js';

export class ThirdPartyAgents {
    /**
     * Create a Claude Code agent handle.
     *
     * The library spawns `claude` CLI as a child process, parses its
     * stream-json output, and auto-dispatches to codebolt.notify.*.
     * Messages are also yielded for optional additional processing.
     *
     * @param prompt - The prompt/task to send to Claude
     * @param options - Configuration including the codebolt instance
     * @returns A handle with execute(), stop(), sendInput(), state, sessionId
     */
    static claude(prompt: string, options: ClaudeAgentOptions): ThirdPartyAgentHandle {
        const { codebolt, autoDispatch, ...executorOptions } = options;

        const executor = new ClaudeExecutor(executorOptions);
        const formatter = new ClaudeFormatter();
        const dispatcher = new ClaudeDispatcher();

        const shouldDispatch = autoDispatch !== false;

        const stream = createMessageStream(
            executor,
            formatter,
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

    // Future adapters:
    // static codex(prompt: string, options: CodexAgentOptions): ThirdPartyAgentHandle { ... }
    // static cursor(prompt: string, options: CursorAgentOptions): ThirdPartyAgentHandle { ... }
}

// ── Re-exports ──
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

export type {
    ClaudeExecutorOptions,
    ClaudeAgentOptions,
    ClaudePermissionMode,
} from './adapters/claude/types.js';

export { ClaudeExecutor } from './adapters/claude/ClaudeExecutor.js';
export { ClaudeFormatter } from './adapters/claude/ClaudeFormatter.js';
export { ClaudeDispatcher } from './adapters/claude/ClaudeDispatcher.js';

export { BaseExecutor } from './base/BaseExecutor.js';
export { BaseFormatter } from './base/BaseFormatter.js';
export { BaseDispatcher } from './base/BaseDispatcher.js';

export { createMessageStream } from './stream/MessageStream.js';
