import { BaseDispatcher } from '../../base/BaseDispatcher.js';
import type { CodeboltMessage, CodeboltInstance } from '../../types.js';

const STREAM_CHUNK_SIZE = 12;

/**
 * Dispatcher for Pi AI Agent CLI messages.
 *
 * Handles text streaming, tool notifications, results, and errors.
 */
export class PiDispatcher extends BaseDispatcher {
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
                console.log(`[pi-dispatcher] init (sessionId=${message.sessionId})`);
                this._currentStreamId = null;
                codebolt.notify.system.AgentInitNotify();
                break;

            case 'assistant_text':
                if (message.text) {
                    console.log(`[pi-dispatcher] assistant_text (${message.text.length} chars)`);
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

            case 'tool_use': {
                const name = message.toolName || 'unknown';
                const input = (message.toolInput || {}) as Record<string, any>;
                const toolId = message.toolUseId;
                console.log(`[pi-dispatcher] tool_use: ${name} (id=${toolId})`);

                // Pi uses lowercase tool names: read, bash, edit, write, grep, find, ls
                switch (name) {
                    case 'read':
                        codebolt.notify.fs.FileReadRequestNotify(
                            input.file_path || input.path, undefined, undefined, toolId
                        );
                        break;
                    case 'write':
                        codebolt.notify.fs.WriteToFileRequestNotify(
                            input.file_path || input.path, input.content || '', toolId
                        );
                        break;
                    case 'edit':
                        codebolt.notify.fs.FileEditRequestNotify(
                            (input.file_path || input.path)?.split('/').pop() || 'file',
                            input.file_path || input.path,
                            input.new_string || input.content || '', toolId
                        );
                        break;
                    case 'bash':
                        codebolt.notify.terminal.CommandExecutionRequestNotify(
                            input.command, false, false, toolId
                        );
                        break;
                    case 'grep':
                        codebolt.notify.codeutils.GrepSearchRequestNotify(
                            input.pattern, input.path, undefined, undefined, undefined, toolId
                        );
                        break;
                    case 'find':
                    case 'ls':
                        codebolt.notify.fs.ListDirectoryRequestNotify(input.path || '.', toolId);
                        break;
                    default:
                        codebolt.notify.chat.AgentTextResponseNotify(`Tool: ${name}`);
                        break;
                }
                break;
            }

            case 'tool_result':
                console.log(`[pi-dispatcher] tool_result (id=${message.toolUseId}, isError=${message.isError})`);
                break;

            case 'result':
                console.log(`[pi-dispatcher] result (cost=$${message.usage?.costUsd?.toFixed(4) ?? '?'})`);
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
                console.log(`[pi-dispatcher] error: ${(message.text || '').substring(0, 80)}`);
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
