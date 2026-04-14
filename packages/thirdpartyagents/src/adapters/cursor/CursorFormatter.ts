import { BaseFormatter } from '../../base/BaseFormatter.js';
import type { CodeboltMessage } from '../../types.js';

/**
 * Formatter for Cursor Agent CLI stream-json output.
 *
 * Parses newline-delimited JSON events and converts them into CodeboltMessage objects.
 * Handles stream lines that may be prefixed with `stdout:` or `stderr:`.
 *
 * Event types: assistant, result, error, system, text, step_finish
 */
export class CursorFormatter extends BaseFormatter {
    parseLine(line: string, timestamp: string): CodeboltMessage[] {
        const normalized = normalizeLine(line);
        const trimmed = normalized.trim();
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
        const sessionId = extractSessionId(parsed);

        // ── System messages ──
        if (type === 'system') {
            if (parsed['subtype'] === 'init') {
                return [{
                    type: 'init',
                    timestamp,
                    model: typeof parsed['model'] === 'string' ? parsed['model'] : undefined,
                    sessionId,
                    raw: parsed,
                }];
            }
            if (parsed['subtype'] === 'error') {
                const msg = extractErrorMessage(parsed) || 'System error';
                return [{ type: 'error', timestamp, text: msg, isError: true, raw: parsed }];
            }
            return [{
                type: 'system',
                timestamp,
                text: typeof parsed['subtype'] === 'string' ? parsed['subtype'] : 'system',
                sessionId,
                raw: parsed,
            }];
        }

        // ── Assistant messages ──
        if (type === 'assistant') {
            const message = asRecord(parsed['message']);
            let text = '';
            if (message) {
                if (typeof message['text'] === 'string') {
                    text = message['text'];
                } else if (Array.isArray(message['content'])) {
                    const parts: string[] = [];
                    for (const part of message['content'] as unknown[]) {
                        const p = asRecord(part);
                        if (!p) continue;
                        const partType = typeof p['type'] === 'string' ? p['type'] : '';
                        if ((partType === 'output_text' || partType === 'text') && typeof p['text'] === 'string') {
                            parts.push(p['text']);
                        }
                    }
                    text = parts.join('\n');
                }
            } else if (typeof parsed['message'] === 'string') {
                text = parsed['message'];
            }

            if (text) {
                return [{
                    type: 'assistant_text',
                    timestamp,
                    text,
                    sessionId,
                    raw: parsed,
                }];
            }
            return [{ type: 'raw', timestamp, text: trimmed, raw: parsed }];
        }

        // ── Text events ──
        if (type === 'text') {
            const part = asRecord(parsed['part']);
            const text = part && typeof part['text'] === 'string' ? part['text'] : '';
            if (text) {
                return [{
                    type: 'assistant_text',
                    timestamp,
                    text,
                    sessionId,
                    raw: parsed,
                }];
            }
            return [{ type: 'raw', timestamp, text: trimmed, raw: parsed }];
        }

        // ── Step finish (usage) ──
        if (type === 'step_finish') {
            const part = asRecord(parsed['part']);
            const tokens = part ? asRecord(part['tokens']) : null;
            const cache = tokens ? asRecord(tokens['cache']) : null;

            const inputTokens = asNumber(tokens?.['input']);
            const outputTokens = asNumber(tokens?.['output']);
            const cachedTokens = asNumber(cache?.['read']);
            const costUsd = asNumber(part?.['cost']);

            return [{
                type: 'result',
                timestamp,
                text: 'Step completed',
                usage: { inputTokens, outputTokens, cachedTokens, costUsd },
                raw: parsed,
            }];
        }

        // ── Result messages ──
        if (type === 'result') {
            const usage = asRecord(parsed['usage']);
            const inputTokens = asNumber(usage?.['input_tokens']);
            const outputTokens = asNumber(usage?.['output_tokens']);
            const cachedTokens = asNumber(usage?.['cached_input_tokens']);
            const costUsd = asNumber(parsed['total_cost_usd'] ?? parsed['cost_usd'] ?? parsed['cost']);
            const isError = parsed['is_error'] === true || parsed['subtype'] === 'error';

            const text = typeof parsed['result'] === 'string'
                ? parsed['result']
                : typeof parsed['message'] === 'string'
                    ? parsed['message']
                    : '';

            return [{
                type: isError ? 'error' : 'result',
                timestamp,
                text: text || 'Result',
                usage: { inputTokens, outputTokens, cachedTokens, costUsd },
                isError,
                sessionId,
                raw: parsed,
            }];
        }

        // ── Error messages ──
        if (type === 'error') {
            const msg = extractErrorMessage(parsed) || 'Unknown error';
            return [{ type: 'error', timestamp, text: msg, isError: true, raw: parsed }];
        }

        // ── Fallback ──
        return [{ type: 'raw', timestamp, text: trimmed, raw: parsed }];
    }
}

// ── Helpers ──

/**
 * Normalize Cursor stream lines that may be prefixed with `stdout:` or `stderr:`.
 */
function normalizeLine(line: string): string {
    const trimmed = line.trim();
    const match = trimmed.match(/^(?:stdout|stderr)\s*[=:]\s*(.*)$/);
    return match ? match[1] : trimmed;
}

function asRecord(value: unknown): Record<string, unknown> | null {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
    return value as Record<string, unknown>;
}

function asNumber(value: unknown): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function extractSessionId(parsed: Record<string, unknown>): string | undefined {
    for (const key of ['session_id', 'sessionId', 'sessionID']) {
        if (typeof parsed[key] === 'string') return parsed[key] as string;
    }
    return undefined;
}

function extractErrorMessage(parsed: Record<string, unknown>): string {
    if (typeof parsed['message'] === 'string') return parsed['message'];
    if (typeof parsed['error'] === 'string') return parsed['error'];
    const error = asRecord(parsed['error']);
    if (error && typeof error['message'] === 'string') return error['message'];
    if (typeof parsed['detail'] === 'string') return parsed['detail'];
    return '';
}
