import { BaseFormatter } from '../../base/BaseFormatter.js';
import type { CodeboltMessage } from '../../types.js';

/**
 * Formatter for OpenAI Codex CLI JSONL output.
 *
 * Parses newline-delimited JSON events from Codex and converts them
 * into CodeboltMessage objects.
 *
 * Event types:
 * - thread.started: { thread_id } → init
 * - item.completed: { item: { type, text } } → assistant_text
 * - turn.completed: { usage: { input_tokens, output_tokens, cached_input_tokens } } → result
 * - turn.failed: { error: { message } } → error
 * - error: { message } → error
 */
export class CodexFormatter extends BaseFormatter {
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

        // ── Thread started (init) ──
        if (type === 'thread.started') {
            const threadId = typeof parsed['thread_id'] === 'string' ? parsed['thread_id'] : undefined;
            return [{
                type: 'init',
                timestamp,
                sessionId: threadId,
                raw: parsed,
            }];
        }

        // ── Item completed (assistant text) ──
        if (type === 'item.completed') {
            const item = asRecord(parsed['item']);
            if (item) {
                const text = typeof item['text'] === 'string' ? item['text'] : '';
                if (text) {
                    return [{
                        type: 'assistant_text',
                        timestamp,
                        text,
                        raw: parsed,
                    }];
                }
            }
            return [{ type: 'raw', timestamp, text: trimmed, raw: parsed }];
        }

        // ── Turn completed (result with usage) ──
        if (type === 'turn.completed') {
            const usage = asRecord(parsed['usage']);
            const inputTokens = asNumber(usage?.['input_tokens']);
            const outputTokens = asNumber(usage?.['output_tokens']);
            const cachedTokens = asNumber(usage?.['cached_input_tokens']);
            const costUsd = asNumber(parsed['total_cost_usd'] ?? parsed['cost_usd']);

            return [{
                type: 'result',
                timestamp,
                text: 'Turn completed',
                usage: { inputTokens, outputTokens, cachedTokens, costUsd },
                raw: parsed,
            }];
        }

        // ── Turn failed ──
        if (type === 'turn.failed') {
            const error = asRecord(parsed['error']);
            const msg = (error && typeof error['message'] === 'string')
                ? error['message'] : 'Turn failed';
            return [{
                type: 'error',
                timestamp,
                text: msg,
                isError: true,
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
