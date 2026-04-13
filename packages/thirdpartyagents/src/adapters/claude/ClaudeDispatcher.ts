import { BaseDispatcher } from '../../base/BaseDispatcher.js';
import type { CodeboltMessage, CodeboltInstance } from '../../types.js';

/**
 * Dispatcher for Claude Code CLI messages.
 *
 * Maps each CodeboltMessage type to the appropriate codebolt.notify.* call,
 * including tool-specific dispatching for tool_use messages.
 */
export class ClaudeDispatcher extends BaseDispatcher {
    dispatch(message: CodeboltMessage, codebolt: CodeboltInstance): void {
        switch (message.type) {
            case 'init':
                codebolt.notify.system.AgentInitNotify();
                break;

            case 'assistant_text':
                if (message.text) {
                    codebolt.notify.chat.AgentTextResponseNotify(message.text);
                }
                break;

            case 'thinking':
                // Thinking blocks are logged but not dispatched as chat messages
                break;

            case 'tool_use':
                this.dispatchToolUse(message, codebolt);
                break;

            case 'tool_result':
                this.dispatchToolResult(message, codebolt);
                break;

            case 'user_text':
                if (message.text) {
                    codebolt.notify.chat.UserMessageRequestNotify(message.text);
                }
                break;

            case 'result':
                codebolt.notify.system.AgentCompletionNotify(
                    message.text || 'Task completed',
                    undefined,
                    message.usage ? `cost: $${message.usage.costUsd.toFixed(4)}` : ''
                );
                break;

            case 'error':
                if (message.text) {
                    codebolt.notify.chat.AgentTextResponseNotify(message.text, true);
                }
                break;

            case 'system':
            case 'raw':
                // Not dispatched — available in stream for custom handling
                break;
        }
    }

    private dispatchToolUse(message: CodeboltMessage, codebolt: CodeboltInstance): void {
        const name = message.toolName || '';
        const input = (message.toolInput || {}) as Record<string, any>;
        const toolId = message.toolUseId;

        switch (name) {
            case 'Read':
                codebolt.notify.fs.FileReadRequestNotify(
                    input.file_path || input.path,
                    input.offset?.toString(),
                    input.limit?.toString(),
                    toolId
                );
                break;

            case 'Write':
                codebolt.notify.fs.WriteToFileRequestNotify(
                    input.file_path || input.path,
                    input.content || '',
                    toolId
                );
                break;

            case 'Edit':
                codebolt.notify.fs.FileEditRequestNotify(
                    (input.file_path || input.path)?.split('/').pop() || 'file',
                    input.file_path || input.path,
                    input.new_string || '',
                    toolId
                );
                break;

            case 'MultiEdit':
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
                codebolt.notify.fs.ListDirectoryRequestNotify(input.path || '.', toolId);
                break;

            case 'Grep':
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
                codebolt.notify.codeutils.GlobSearchRequestNotify(
                    input.pattern,
                    input.path,
                    undefined,
                    undefined,
                    toolId
                );
                break;

            case 'Bash':
                codebolt.notify.terminal.CommandExecutionRequestNotify(
                    input.command,
                    false,
                    false,
                    toolId
                );
                break;

            case 'Task':
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
                codebolt.notify.browser.WebFetchRequestNotify(
                    input.url, 'GET', undefined, undefined, undefined, toolId
                );
                break;

            case 'WebSearch':
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
                // Custom/MCP tool — send as text
                codebolt.notify.chat.AgentTextResponseNotify(`Tool: ${name}`);
                break;
        }
    }

    private dispatchToolResult(message: CodeboltMessage, codebolt: CodeboltInstance): void {
        const content = message.toolResultContent || '';
        codebolt.notify.chat.AgentTextResponseNotify(
            content,
            message.isError,
            message.toolUseId
        );
    }
}
