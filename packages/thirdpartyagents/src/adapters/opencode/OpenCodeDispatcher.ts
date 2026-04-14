import { BaseDispatcher } from '../../base/BaseDispatcher.js';
import type { CodeboltMessage, CodeboltInstance } from '../../types.js';

const STREAM_CHUNK_SIZE = 12;

/**
 * Dispatcher for OpenCode CLI messages.
 *
 * OpenCode executes tools internally, so there are no tool_use dispatches.
 * The dispatcher handles text streaming, results, and errors.
 */
export class OpenCodeDispatcher extends BaseDispatcher {
    private _currentStreamId: string | null = null;
    private _streamIdCounter = 0;

    private getOrCreateStreamId(): string {
        if (!this._currentStreamId) {
            this._currentStreamId = `stream_${Date.now()}_${++this._streamIdCounter}`;
        }
        return this._currentStreamId;
    }

    private streamTextToUi(text: string, codebolt: CodeboltInstance): void {
        const streamId = this.getOrCreateStreamId();
        for (let i = 0; i < text.length; i += STREAM_CHUNK_SIZE) {
            const chunk = text.slice(i, i + STREAM_CHUNK_SIZE);
            codebolt.notify.chat.AgentThinkingNotify(chunk, streamId);
        }
    }

    dispatch(message: CodeboltMessage, codebolt: CodeboltInstance): void {
        switch (message.type) {
            case 'init':
                console.log(`[opencode-dispatcher] init (sessionId=${message.sessionId})`);
                this._currentStreamId = null;
                codebolt.notify.system.AgentInitNotify();
                break;

            case 'assistant_text':
                if (message.text) {
                    console.log(`[opencode-dispatcher] assistant_text (${message.text.length} chars)`);
                    this.streamTextToUi(message.text, codebolt);
                }
                break;

            case 'thinking':
                if (message.text) {
                    const streamId = this.getOrCreateStreamId();
                    for (let i = 0; i < message.text.length; i += STREAM_CHUNK_SIZE) {
                        const chunk = message.text.slice(i, i + STREAM_CHUNK_SIZE);
                        codebolt.notify.chat.AgentThinkingNotify('', streamId, { reasoning: chunk });
                    }
                }
                break;

            case 'result':
                console.log(`[opencode-dispatcher] result (cost=$${message.usage?.costUsd?.toFixed(4) ?? '?'})`);
                if (this._currentStreamId) {
                    codebolt.notify.chat.AgentThinkingNotify(
                        '', this._currentStreamId,
                        { stateEvent: message.isError ? 'REQUEST_ERROR' : 'REQUEST_SUCCESS' }
                    );
                    this._currentStreamId = null;
                }
                codebolt.notify.system.AgentCompletionNotify(
                    message.text || 'Task completed',
                    undefined,
                    message.usage ? `cost: $${message.usage.costUsd.toFixed(4)}` : ''
                );
                break;

            case 'error':
                console.log(`[opencode-dispatcher] error: ${(message.text || '').substring(0, 80)}`);
                if (message.text) {
                    codebolt.notify.chat.AgentTextResponseNotify(message.text, true);
                }
                break;

            case 'system':
            case 'raw':
                break;

            default:
                break;
        }
    }
}
