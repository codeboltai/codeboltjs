import { BaseFormatter } from '../../base/BaseFormatter.js';
import type { CodeboltMessage } from '../../types.js';

/**
 * Formatter for OpenClaw gateway events.
 *
 * The OpenClawExecutor converts WebSocket frames into JSONL lines,
 * so this formatter parses them using the same pattern as other adapters.
 *
 * Event types: system (init), assistant, result, error
 */
export class OpenClawFormatter extends BaseFormatter {
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
                raw: parsed,
            }];
        }

        // ── Assistant messages ──
        if (type === 'assistant') {
            const message = asRecord(parsed['message']);
            const text = message && typeof message['text'] === 'string'
                ? message['text']
                : typeof parsed['text'] === 'string'
                    ? parsed['text']
                    : '';
            if (text) {
                return [{
                    type: 'assistant_text',
                    timestamp,
                    text,
                    raw: parsed,
                }];
            }
            return [{ type: 'raw', timestamp, text: trimmed, raw: parsed }];
        }

        // ── Result ──
        if (type === 'result') {
            const usage = asRecord(parsed['usage']);
            const inputTokens = asNumber(usage?.['input_tokens'] ?? usage?.['inputTokens']);
            const outputTokens = asNumber(usage?.['output_tokens'] ?? usage?.['outputTokens']);
            const cachedTokens = asNumber(usage?.['cached_input_tokens'] ?? usage?.['cachedInputTokens']);
            const costUsd = asNumber(parsed['total_cost_usd'] ?? parsed['cost_usd']);
            const text = typeof parsed['result'] === 'string' ? parsed['result'] : 'Completed';

            return [{
                type: 'result',
                timestamp,
                text,
                usage: { inputTokens, outputTokens, cachedTokens, costUsd },
                raw: parsed,
            }];
        }

        // ── Error ──
        if (type === 'error') {
            const msg = typeof parsed['message'] === 'string'
                ? parsed['message']
                : typeof parsed['error'] === 'string'
                    ? parsed['error']
                    : 'Unknown error';
            return [{
                type: 'error',
                timestamp,
                text: msg,
                isError: true,
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

function asNumber(value: unknown): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}
