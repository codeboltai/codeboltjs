import { BaseFormatter } from '../../base/BaseFormatter.js';
import type { CodeboltMessage } from '../../types.js';

/**
 * Formatter for Gemini CLI stream-json output.
 *
 * Parses newline-delimited JSON events from Gemini's `--output-format stream-json`
 * and converts them into CodeboltMessage objects.
 *
 * Event types: assistant, result, error, system, text, step_finish
 */
export class GeminiFormatter extends BaseFormatter {
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

        // Extract session ID from any event
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
                } else if (typeof message === 'object' && Array.isArray(message['content'])) {
                    const parts: string[] = [];
                    for (const part of message['content'] as unknown[]) {
                        const p = asRecord(part);
                        if (p && typeof p['text'] === 'string') parts.push(p['text']);
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

        // ── Text events (legacy format) ──
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

        // ── Step finish (usage checkpoint) ──
        if (type === 'step_finish') {
            const part = asRecord(parsed['part']);
            const tokens = part ? asRecord(part['tokens']) : null;
            const cache = tokens ? asRecord(tokens['cache']) : null;

            const inputTokens = asNumber(tokens?.['input'] ?? parsed['input_tokens']);
            const outputTokens = asNumber(tokens?.['output'] ?? parsed['output_tokens']);
            const cachedTokens = asNumber(cache?.['read'] ?? parsed['cached_input_tokens']);
            const costUsd = asNumber(part?.['cost'] ?? parsed['cost']);

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
            const inputTokens = asNumber(usage?.['input_tokens'] ?? usage?.['inputTokens'] ?? usage?.['promptTokenCount']);
            const outputTokens = asNumber(usage?.['output_tokens'] ?? usage?.['outputTokens'] ?? usage?.['candidatesTokenCount']);
            const cachedTokens = asNumber(usage?.['cached_input_tokens'] ?? usage?.['cachedInputTokens'] ?? usage?.['cachedContentTokenCount']);
            const costUsd = asNumber(parsed['total_cost_usd'] ?? parsed['cost_usd'] ?? parsed['cost']);
            const isError = parsed['is_error'] === true || parsed['subtype'] === 'error';

            const text = typeof parsed['result'] === 'string'
                ? parsed['result']
                : typeof parsed['text'] === 'string'
                    ? parsed['text']
                    : typeof parsed['response'] === 'string'
                        ? parsed['response']
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

function asRecord(value: unknown): Record<string, unknown> | null {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
    return value as Record<string, unknown>;
}

function asNumber(value: unknown): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function extractSessionId(parsed: Record<string, unknown>): string | undefined {
    for (const key of ['session_id', 'sessionId', 'sessionID', 'checkpoint_id', 'thread_id']) {
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
