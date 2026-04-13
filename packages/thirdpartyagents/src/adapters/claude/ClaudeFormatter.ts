import { BaseFormatter } from '../../base/BaseFormatter.js';
import type { CodeboltMessage } from '../../types.js';

/**
 * Formatter for Claude Code CLI stream-json output.
 *
 * Parses newline-delimited JSON events from Claude's `--output-format stream-json`
 * and converts them into CodeboltMessage objects.
 */
export class ClaudeFormatter extends BaseFormatter {
    parseLine(line: string, timestamp: string): CodeboltMessage[] {
        const trimmed = line.trim();
        if (!trimmed) return [];

        let parsed: Record<string, unknown>;
        try {
            parsed = JSON.parse(trimmed);
        } catch {
            return [{ type: 'raw', timestamp, text: trimmed }];
        }

        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
            return [{ type: 'raw', timestamp, text: trimmed }];
        }

        const type = typeof parsed['type'] === 'string' ? parsed['type'] : '';

        // ── System init ──
        if (type === 'system' && parsed['subtype'] === 'init') {
            return [{
                type: 'init',
                timestamp,
                model: typeof parsed['model'] === 'string' ? parsed['model'] : undefined,
                sessionId: typeof parsed['session_id'] === 'string' ? parsed['session_id'] : undefined,
                raw: parsed,
            }];
        }

        // ── System errors ──
        if (type === 'system' && parsed['subtype'] === 'api_error') {
            const error = asRecord(parsed['error']);
            const innerError = error ? asRecord(error['error']) : null;
            const errorMsg = (innerError && typeof innerError['message'] === 'string' ? innerError['message'] : null)
                || (error && typeof error['message'] === 'string' ? error['message'] : null)
                || 'API error';
            return [{
                type: 'error',
                timestamp,
                text: `[API Error] ${errorMsg}`,
                raw: parsed,
            }];
        }

        // ── Other system messages ──
        if (type === 'system') {
            return [{
                type: 'system',
                timestamp,
                text: typeof parsed['subtype'] === 'string' ? parsed['subtype'] : 'system',
                raw: parsed,
            }];
        }

        // ── Assistant messages ──
        if (type === 'assistant') {
            const message = asRecord(parsed['message']);
            const content = message ? asArray(message['content']) : [];
            const messages: CodeboltMessage[] = [];

            for (const block of content) {
                const b = asRecord(block);
                if (!b) continue;
                const blockType = typeof b['type'] === 'string' ? b['type'] : '';

                if (blockType === 'text') {
                    const text = typeof b['text'] === 'string' ? b['text'] : '';
                    if (text) {
                        messages.push({
                            type: 'assistant_text',
                            timestamp,
                            text,
                            sessionId: typeof parsed['session_id'] === 'string' ? parsed['session_id'] : undefined,
                            raw: parsed,
                        });
                    }
                } else if (blockType === 'thinking') {
                    const text = typeof b['thinking'] === 'string' ? b['thinking'] : '';
                    if (text) {
                        messages.push({
                            type: 'thinking',
                            timestamp,
                            text,
                            raw: parsed,
                        });
                    }
                } else if (blockType === 'tool_use') {
                    messages.push({
                        type: 'tool_use',
                        timestamp,
                        toolName: typeof b['name'] === 'string' ? b['name'] : 'unknown',
                        toolUseId: typeof b['id'] === 'string' ? b['id'] : undefined,
                        toolInput: b['input'] ?? {},
                        raw: parsed,
                    });
                }
            }

            return messages.length > 0 ? messages : [{ type: 'raw', timestamp, text: trimmed, raw: parsed }];
        }

        // ── User messages ──
        if (type === 'user') {
            const message = asRecord(parsed['message']);
            const content = message ? asArray(message['content']) : [];
            const messages: CodeboltMessage[] = [];

            for (const block of content) {
                const b = asRecord(block);
                if (!b) continue;
                const blockType = typeof b['type'] === 'string' ? b['type'] : '';

                if (blockType === 'text') {
                    const text = typeof b['text'] === 'string' ? b['text'] : '';
                    if (text) {
                        messages.push({ type: 'user_text', timestamp, text, raw: parsed });
                    }
                } else if (blockType === 'tool_result') {
                    const toolUseId = typeof b['tool_use_id'] === 'string' ? b['tool_use_id'] : undefined;
                    const isError = b['is_error'] === true;
                    let resultText = '';
                    if (typeof b['content'] === 'string') {
                        resultText = b['content'];
                    } else if (Array.isArray(b['content'])) {
                        const parts: string[] = [];
                        for (const part of b['content'] as unknown[]) {
                            const p = asRecord(part);
                            if (p && typeof p['text'] === 'string') parts.push(p['text']);
                        }
                        resultText = parts.join('\n');
                    }
                    messages.push({
                        type: 'tool_result',
                        timestamp,
                        toolUseId,
                        toolResultContent: resultText,
                        isError,
                        raw: parsed,
                    });
                }
            }

            return messages.length > 0 ? messages : [{ type: 'raw', timestamp, text: trimmed, raw: parsed }];
        }

        // ── Result messages ──
        if (type === 'result') {
            const usage = asRecord(parsed['usage']);
            const inputTokens = asNumber(usage?.['input_tokens']);
            const outputTokens = asNumber(usage?.['output_tokens']);
            const cachedTokens = asNumber(usage?.['cache_read_input_tokens']);
            const costUsd = asNumber(parsed['total_cost_usd']);
            const isError = parsed['is_error'] === true;
            const text = typeof parsed['result'] === 'string' ? parsed['result'] : '';

            return [{
                type: isError ? 'error' : 'result',
                timestamp,
                text: text || (typeof parsed['subtype'] === 'string' ? parsed['subtype'] : 'result'),
                usage: { inputTokens, outputTokens, cachedTokens, costUsd },
                isError,
                raw: parsed,
            }];
        }

        // ── Fallback ──
        return [{ type: 'raw', timestamp, text: trimmed, raw: parsed }];
    }
}

// ── Helpers ──

function asRecord(value: unknown): Record<string, unknown> | null {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
    return value as Record<string, unknown>;
}

function asArray(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
}

function asNumber(value: unknown): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}
