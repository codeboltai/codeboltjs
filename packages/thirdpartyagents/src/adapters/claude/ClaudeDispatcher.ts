import { BaseDispatcher } from '../../base/BaseDispatcher.js';
import type { CodeboltMessage, CodeboltInstance } from '../../types.js';

// Characters per chunk sent to AgentThinkingNotify
const STREAM_CHUNK_SIZE = 12;

/**
 * Dispatcher for Claude Code CLI messages.
 *
 * Maps each CodeboltMessage type to the appropriate codebolt.notify.* call,
 * including tool-specific dispatching for tool_use messages.
 */
export class ClaudeDispatcher extends BaseDispatcher {
    // Stable stream ID per assistant turn — shared across text + thinking
    private _currentStreamId: string | null = null;
    private _streamIdCounter = 0;

    private getOrCreateStreamId(): string {
        if (!this._currentStreamId) {
            this._currentStreamId = `stream_${Date.now()}_${++this._streamIdCounter}`;
        }
        return this._currentStreamId;
    }

    /**
     * Sends text to the UI in small chunks via AgentThinkingNotify.
     * The server-side batching (50ms interval) naturally spaces out UI updates.
     */
    private streamTextToUi(
        text: string,
        codebolt: CodeboltInstance,
        field: 'content' | 'reasoning' = 'content'
    ): void {
        const streamId = this.getOrCreateStreamId();

        for (let i = 0; i < text.length; i += STREAM_CHUNK_SIZE) {
            const chunk = text.slice(i, i + STREAM_CHUNK_SIZE);
            if (field === 'reasoning') {
                codebolt.notify.chat.AgentThinkingNotify('', streamId, { reasoning: chunk });
            } else {
                codebolt.notify.chat.AgentThinkingNotify(chunk, streamId);
            }
        }
    }

    dispatch(message: CodeboltMessage, codebolt: CodeboltInstance): void {
        switch (message.type) {
            case 'init':
                console.log(`[dispatcher] init → AgentInitNotify (model=${message.model}, sessionId=${message.sessionId})`);
                // Reset stream ID for new turn
                this._currentStreamId = null;
                codebolt.notify.system.AgentInitNotify();
                break;

            case 'assistant_text':
                if (message.text) {
                    console.log(`[dispatcher] assistant_text → streaming via AgentThinkingNotify (${message.text.length} chars)`);
                    this.streamTextToUi(message.text, codebolt, 'content');
                }
                break;

            case 'thinking':
                if (message.text) {
                    console.log(`[dispatcher] thinking → streaming reasoning via AgentThinkingNotify (${message.text.length} chars)`);
                    this.streamTextToUi(message.text, codebolt, 'reasoning');
                }
                break;

            case 'tool_use':
                console.log(`[dispatcher] tool_use → dispatchToolUse: ${message.toolName} (id=${message.toolUseId})`);
                this.dispatchToolUse(message, codebolt);
                break;

            case 'tool_result':
                console.log(`[dispatcher] tool_result → dispatchToolResult (id=${message.toolUseId}, isError=${message.isError}, content="${(message.toolResultContent || '').substring(0, 80)}")`);
                // this.dispatchToolResult(message, codebolt);
                break;

            case 'user_text':
                console.log(`[dispatcher] user_text → UserMessageRequestNotify ("${(message.text || '').substring(0, 80)}")`);
                if (message.text) {
                    codebolt.notify.chat.UserMessageRequestNotify(message.text);
                }
                break;

            case 'result':
                console.log(`[dispatcher] result → AgentCompletionNotify ("${(message.text || '').substring(0, 80)}", cost=$${message.usage?.costUsd?.toFixed(4) ?? '?'})`);
                // Send stream completion signal before finishing
                if (this._currentStreamId) {
                    const isError = message.isError === true;
                    codebolt.notify.chat.AgentThinkingNotify(
                        '',
                        this._currentStreamId,
                        { stateEvent: isError ? 'REQUEST_ERROR' : 'REQUEST_SUCCESS' }
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
                console.log(`[dispatcher] error → AgentTextResponseNotify ("${(message.text || '').substring(0, 80)}")`);
                if (message.text) {
                    codebolt.notify.chat.AgentTextResponseNotify(message.text, true);
                }
                break;

            case 'system':
                console.log(`[dispatcher] system ("${(message.text || '').substring(0, 80)}") — not dispatched`);
                break;

            case 'raw':
                console.log(`[dispatcher] raw ("${(message.text || '').substring(0, 80)}") — not dispatched`);
                break;
        }
    }

    private dispatchToolUse(message: CodeboltMessage, codebolt: CodeboltInstance): void {
        const name = message.toolName || '';
        const input = (message.toolInput || {}) as Record<string, any>;
        const toolId = message.toolUseId;

        switch (name) {
            case 'Read':
                console.log(`[dispatcher]   → fs.FileReadRequestNotify(path=${input.file_path || input.path}, toolId=${toolId})`);
                codebolt.notify.fs.FileReadRequestNotify(
                    input.file_path || input.path,
                    input.offset?.toString(),
                    input.limit?.toString(),
                    toolId
                );
                break;

            case 'Write':
                console.log(`[dispatcher]   → fs.WriteToFileRequestNotify(path=${input.file_path || input.path}, toolId=${toolId})`);
                codebolt.notify.fs.WriteToFileRequestNotify(
                    input.file_path || input.path,
                    input.content || '',
                    toolId
                );
                break;

            case 'Edit':
                console.log(`[dispatcher]   → fs.FileEditRequestNotify(path=${input.file_path || input.path}, toolId=${toolId})`);
                codebolt.notify.fs.FileEditRequestNotify(
                    (input.file_path || input.path)?.split('/').pop() || 'file',
                    input.file_path || input.path,
                    input.new_string || '',
                    toolId
                );
                break;

            case 'MultiEdit':
                console.log(`[dispatcher]   → fs.FileEditRequestNotify (MultiEdit, ${input.edits?.length || 0} edits, toolId=${toolId})`);
                if (input.edits && Array.isArray(input.edits)) {
                    input.edits.forEach((edit: any, i: number) => {
                        codebolt.notify.fs.FileEditRequestNotify(
                            edit.file_path?.split('/').pop() || `file-${i}`,
                            edit.file_path,
                            edit.new_string || '',
                            `${toolId}-${i}`
                        );
                    });
                }
                break;

            case 'LS':
                console.log(`[dispatcher]   → fs.ListDirectoryRequestNotify(path=${input.path || '.'}, toolId=${toolId})`);
                codebolt.notify.fs.ListDirectoryRequestNotify(input.path || '.', toolId);
                break;

            case 'Grep':
                console.log(`[dispatcher]   → codeutils.GrepSearchRequestNotify(pattern=${input.pattern}, path=${input.path}, toolId=${toolId})`);
                codebolt.notify.codeutils.GrepSearchRequestNotify(
                    input.pattern,
                    input.path,
                    undefined,
                    input['-i'],
                    input.head_limit,
                    toolId
                );
                break;

            case 'Glob':
                console.log(`[dispatcher]   → codeutils.GlobSearchRequestNotify(pattern=${input.pattern}, path=${input.path}, toolId=${toolId})`);
                codebolt.notify.codeutils.GlobSearchRequestNotify(
                    input.pattern,
                    input.path,
                    undefined,
                    undefined,
                    toolId
                );
                break;

            case 'Bash':
                console.log(`[dispatcher]   → terminal.CommandExecutionRequestNotify(cmd="${(input.command || '').substring(0, 80)}", toolId=${toolId})`);
                codebolt.notify.terminal.CommandExecutionRequestNotify(
                    input.command,
                    false,
                    false,
                    toolId
                );
                break;

            case 'Task':
                console.log(`[dispatcher]   → todo.AddTodoRequestNotify(desc="${(input.description || input.prompt || '').substring(0, 60)}", toolId=${toolId})`);
                codebolt.notify.todo.AddTodoRequestNotify(
                    input.description || input.prompt,
                    undefined,
                    input.description || input.prompt,
                    undefined, undefined, undefined, undefined,
                    toolId
                );
                break;

            case 'TodoWrite':
                if (input.todos && Array.isArray(input.todos)) {
                    input.todos.forEach((todo: any, i: number) => {
                        codebolt.notify.todo.AddTodoRequestNotify(
                            todo.content, undefined, todo.content,
                            undefined, undefined, undefined, undefined,
                            `${toolId}-${i}`
                        );
                    });
                }
                break;

            case 'WebFetch':
                console.log(`[dispatcher]   → browser.WebFetchRequestNotify(url=${input.url}, toolId=${toolId})`);
                codebolt.notify.browser.WebFetchRequestNotify(
                    input.url, 'GET', undefined, undefined, undefined, toolId
                );
                break;

            case 'WebSearch':
                console.log(`[dispatcher]   → browser.WebSearchRequestNotify(query=${input.query}, toolId=${toolId})`);
                codebolt.notify.browser.WebSearchRequestNotify(
                    input.query, undefined, undefined, undefined, toolId
                );
                break;

            case 'NotebookRead':
                codebolt.notify.fs.FileReadRequestNotify(
                    input.notebook_path || input.path,
                    undefined, undefined, toolId
                );
                break;

            case 'NotebookEdit':
                codebolt.notify.fs.FileEditRequestNotify(
                    (input.notebook_path || input.path)?.split('/').pop() || 'notebook',
                    input.notebook_path || input.path,
                    input.content || '',
                    toolId
                );
                break;

            default:
                console.log(`[dispatcher]   → chat.AgentTextResponseNotify (unknown tool: ${name}, toolId=${toolId})`);
                codebolt.notify.chat.AgentTextResponseNotify(`Tool: ${name}`);
                break;
        }
    }

    private dispatchToolResult(message: CodeboltMessage, codebolt: CodeboltInstance): void {
        const content = message.toolResultContent || '';
        console.log(`[dispatcher]   → chat.AgentTextResponseNotify (toolResult, isError=${message.isError}, toolUseId=${message.toolUseId}, content="${content.substring(0, 80)}")`);
        codebolt.notify.chat.AgentTextResponseNotify(
            content,
            message.isError,
            message.toolUseId
        );
    }
}
