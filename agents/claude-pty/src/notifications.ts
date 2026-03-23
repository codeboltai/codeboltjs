import codebolt from '@codebolt/codeboltjs';
import { match } from 'ts-pattern';

/**
 * Dispatch a JSONL conversation entry from Claude's session log file.
 *
 * Entry types from ~/.claude/projects/<project>/<session>.jsonl:
 * - user: User messages (text, tool_result, images, documents)
 * - assistant: Claude responses (text, tool_use, thinking)
 * - system: System messages (init, hooks, errors, compact boundary, turn duration)
 * - summary: Conversation summaries
 * - progress: Progress indicators
 * - file-history-snapshot: File state snapshots
 * - queue-operation: Task queue operations
 * - custom-title: Session title changes
 * - agent-name: Agent identification
 */
export const dispatchJsonlEntry = (entry: any) => {
    match(entry)
        // ── User entries ──
        .with({ type: 'user' }, (e: any) => {
            const content = e.message?.content;
            if (typeof content === 'string') {
                console.log(`[notify] User message: "${content.substring(0, 80)}"`);
                codebolt.notify.chat.UserMessageRequestNotify(content, {
                    sessionId: e.sessionId,
                    uuid: e.uuid,
                });
            } else if (Array.isArray(content)) {
                for (const block of content) {
                    match(block)
                        .with({ type: 'text' }, (b: any) => {
                            codebolt.notify.chat.UserMessageRequestNotify(b.text, {
                                sessionId: e.sessionId,
                                uuid: e.uuid,
                            });
                        })
                        .with({ type: 'tool_result' }, (b: any) => {
                            dispatchToolResult(b);
                        })
                        .otherwise(() => {
                            codebolt.notify.chat.UserMessageRequestNotify(
                                JSON.stringify(block),
                                { sessionId: e.sessionId, uuid: e.uuid }
                            );
                        });
                }
            }
        })

        // ── Assistant entries ──
        .with({ type: 'assistant' }, (e: any) => {
            const content = e.message?.content;
            if (!Array.isArray(content)) return;

            for (const block of content) {
                match(block)
                    .with({ type: 'text' }, (b: any) => {
                        console.log(`[notify] Assistant text: "${b.text.substring(0, 80)}"`);
                        codebolt.notify.chat.AgentTextResponseNotify(b.text);
                    })
                    .with({ type: 'tool_use' }, (b: any) => {
                        console.log(`[notify] Tool use: ${b.name} (id=${b.id?.substring(0, 12)}...)`);
                        dispatchToolUse(b);
                    })
                    .with({ type: 'thinking' }, (_b: any) => {
                        console.log(`[notify] Thinking block (${_b.thinking?.length || 0} chars)`);
                    })
                    .otherwise(() => {});
            }
        })

        // ── System entries ──
        .with({ type: 'system' }, (e: any) => {
            match(e)
                .with({ subtype: 'init' }, (se: any) => {
                    console.log(`[notify] System init: model=${se.model} tools=${se.tools?.length || 0}`);
                    codebolt.notify.system.AgentInitNotify();
                })
                .with({ subtype: 'api_error' }, (se: any) => {
                    const errorMsg = se.error?.error?.message || se.error?.error?.error?.message || 'API error';
                    console.log(`[notify] API error: ${errorMsg}`);
                    codebolt.notify.chat.AgentTextResponseNotify(
                        `[API Error] ${errorMsg}`,
                        true
                    );
                })
                .with({ subtype: 'turn_duration' }, (se: any) => {
                    console.log(`[notify] Turn duration: ${se.durationMs}ms`);
                })
                .with({ subtype: 'compact_boundary' }, () => {
                    console.log('[notify] Conversation compacted');
                })
                .with({ subtype: 'stop_hook_summary' }, (se: any) => {
                    console.log(`[notify] Stop hook: ${se.stopReason}`);
                })
                .with({ subtype: 'local_command' }, (se: any) => {
                    console.log(`[notify] Local command: ${se.content}`);
                    codebolt.notify.chat.AgentTextResponseNotify(
                        `[Command] ${se.content}`
                    );
                })
                .otherwise((se: any) => {
                    if (se.content) {
                        console.log(`[notify] System: ${typeof se.content === 'string' ? se.content.substring(0, 80) : 'object'}`);
                    }
                });
        })

        // ── Result entries (from stdout stream-json only) ──
        .with({ type: 'result', subtype: 'success' }, (e: any) => {
            console.log(`[notify] Result: success, turns=${e.num_turns}, cost=$${e.total_cost_usd?.toFixed(4)}`);
            codebolt.notify.system.AgentCompletionNotify(
                e.result || 'Task completed',
                undefined,
                `${e.duration_ms}ms`
            );
        })
        .with({ type: 'result' }, (e: any) => {
            console.log(`[notify] Result: ${e.subtype}, turns=${e.num_turns}`);
            codebolt.notify.system.AgentCompletionNotify(
                `${e.subtype} after ${e.num_turns} turns`,
                undefined,
                `${e.duration_ms}ms`
            );
        })

        // ── Summary entries ──
        .with({ type: 'summary' }, (e: any) => {
            console.log(`Session summary: ${e.summary?.substring(0, 100)}...`);
        })

        // ── Progress entries ──
        .with({ type: 'progress' }, (e: any) => {
            if (e.data) {
                console.log('Progress:', JSON.stringify(e.data).substring(0, 200));
            }
        })

        .with({ type: 'file-history-snapshot' }, () => {})

        .with({ type: 'queue-operation' }, (e: any) => {
            if (e.operation === 'enqueue' && e.content) {
                const text = typeof e.content === 'string'
                    ? e.content
                    : Array.isArray(e.content)
                        ? e.content.map((c: any) => typeof c === 'string' ? c : c.text || '').join('\n')
                        : '';
                if (text) {
                    console.log(`Queued message: ${text.substring(0, 100)}`);
                }
            }
        })

        .with({ type: 'custom-title' }, (e: any) => {
            console.log(`Session title: ${e.customTitle}`);
        })

        .with({ type: 'agent-name' }, (e: any) => {
            console.log(`Agent: ${e.agentName}`);
        })

        .with({ type: 'rate_limit_event' }, (e: any) => {
            console.log(`[notify] Rate limit: ${e.retry_after ? `retry after ${e.retry_after}s` : 'event'}`);
        })

        .with({ type: 'last-prompt' }, () => {
            console.log('[notify] Last prompt marker');
        })

        .otherwise((e: any) => {
            console.log(`[notify] Unhandled entry type: ${e.type}`);
        });
};

function dispatchToolUse(tool: any) {
    const input = tool.input || {};
    const toolId = tool.id;
    const name = tool.name;

    match(name)
        .with('Read', () => {
            codebolt.notify.fs.FileReadRequestNotify(
                input.file_path || input.path,
                input.offset?.toString(),
                input.limit?.toString(),
                toolId
            );
        })
        .with('Write', () => {
            codebolt.notify.fs.WriteToFileRequestNotify(
                input.file_path || input.path,
                input.content || '',
                toolId
            );
        })
        .with('Edit', () => {
            codebolt.notify.fs.FileEditRequestNotify(
                (input.file_path || input.path)?.split('/').pop() || 'file',
                input.file_path || input.path,
                input.new_string || '',
                toolId
            );
        })
        .with('MultiEdit', () => {
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
        })
        .with('LS', () => {
            codebolt.notify.fs.ListDirectoryRequestNotify(input.path || '.', toolId);
        })
        .with('Grep', () => {
            codebolt.notify.codeutils.GrepSearchRequestNotify(
                input.pattern,
                input.path,
                undefined,
                input['-i'],
                input.head_limit,
                toolId
            );
        })
        .with('Glob', () => {
            codebolt.notify.codeutils.GlobSearchRequestNotify(
                input.pattern,
                input.path,
                undefined,
                undefined,
                toolId
            );
        })
        .with('Bash', () => {
            codebolt.notify.terminal.CommandExecutionRequestNotify(
                input.command,
                undefined,
                undefined,
                toolId
            );
        })
        .with('Task', () => {
            codebolt.notify.todo.AddTodoRequestNotify(
                input.description || input.prompt,
                undefined,
                input.description || input.prompt,
                undefined, undefined, undefined, undefined,
                toolId
            );
        })
        .with('TodoWrite', () => {
            if (input.todos && Array.isArray(input.todos)) {
                input.todos.forEach((todo: any, i: number) => {
                    codebolt.notify.todo.AddTodoRequestNotify(
                        todo.content, undefined, todo.content,
                        undefined, undefined, undefined, undefined,
                        `${toolId}-${i}`
                    );
                });
            }
        })
        .with('WebFetch', () => {
            codebolt.notify.browser.WebFetchRequestNotify(
                input.url, 'GET', undefined, undefined, undefined, toolId
            );
        })
        .with('WebSearch', () => {
            codebolt.notify.browser.WebSearchRequestNotify(
                input.query, undefined, undefined, undefined, toolId
            );
        })
        .with('NotebookRead', () => {
            codebolt.notify.fs.FileReadRequestNotify(
                input.notebook_path || input.path,
                undefined, undefined, toolId
            );
        })
        .with('NotebookEdit', () => {
            codebolt.notify.fs.FileEditRequestNotify(
                (input.notebook_path || input.path)?.split('/').pop() || 'notebook',
                input.notebook_path || input.path,
                input.content || '',
                toolId
            );
        })
        .otherwise(() => {
            codebolt.notify.chat.AgentTextResponseNotify(`Tool: ${name}`);
        });
}

function dispatchToolResult(result: any) {
    const content = result.content || '';
    const isError = result.is_error || false;
    const toolUseId = result.tool_use_id;

    codebolt.notify.chat.AgentTextResponseNotify(
        typeof content === 'string' ? content : JSON.stringify(content),
        isError,
        toolUseId
    );
}
