import { BaseDispatcher } from '../../base/BaseDispatcher.js';
import type { CodeboltMessage, CodeboltInstance } from '../../types.js';

const STREAM_CHUNK_SIZE = 12;

/**
 * Dispatcher for OpenClaw gateway messages.
 *
 * Handles text streaming, results, and errors from the OpenClaw gateway.
 */
export class OpenClawDispatcher extends BaseDispatcher {
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
                console.log(`[openclaw-dispatcher] init`);
                this._currentStreamId = null;
                codebolt.notify.system.AgentInitNotify();
                break;

            case 'assistant_text':
                if (message.text) {
                    console.log(`[openclaw-dispatcher] assistant_text (${message.text.length} chars)`);
                    this.streamTextToUi(message.text, codebolt);
                }
                break;

            case 'result':
                console.log(`[openclaw-dispatcher] result (cost=$${message.usage?.costUsd?.toFixed(4) ?? '?'})`);
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
                console.log(`[openclaw-dispatcher] error: ${(message.text || '').substring(0, 80)}`);
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
