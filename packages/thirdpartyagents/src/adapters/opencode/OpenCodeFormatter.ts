import { BaseFormatter } from '../../base/BaseFormatter.js';
import type { CodeboltMessage } from '../../types.js';

/**
 * Formatter for OpenCode CLI JSONL output.
 *
 * Parses newline-delimited JSON events from `opencode run --format json`
 * and converts them into CodeboltMessage objects.
 *
 * Event types: text, step_finish, tool_use (state), error
 * Note: Session ID field uses capital D: `sessionID`
 */
export class OpenCodeFormatter extends BaseFormatter {
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

        // Extract session ID (OpenCode uses capital D: sessionID)
        const sessionId = typeof parsed['sessionID'] === 'string'
            ? parsed['sessionID'] as string
            : typeof parsed['sessionId'] === 'string'
                ? parsed['sessionId'] as string
                : typeof parsed['session_id'] === 'string'
                    ? parsed['session_id'] as string
                    : undefined;

        // ── Text events (agent response) ──
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

        // ── Step finish (usage & cost) ──
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
                sessionId,
                raw: parsed,
            }];
        }

        // ── Tool use (state updates, not execution requests) ──
        if (type === 'tool_use') {
            const part = asRecord(parsed['part']);
            const state = part ? asRecord(part['state']) : null;
            if (state && state['status'] === 'error') {
                const errorMsg = typeof state['error'] === 'string' ? state['error'] : 'Tool error';
                return [{
                    type: 'error',
                    timestamp,
                    text: errorMsg,
                    isError: true,
                    raw: parsed,
                }];
            }
            // Non-error tool_use events are informational
            return [{ type: 'system', timestamp, text: 'tool_use', sessionId, raw: parsed }];
        }

        // ── Error events ──
        if (type === 'error') {
            const msg = extractErrorMessage(parsed) || 'Unknown error';
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

function extractErrorMessage(parsed: Record<string, unknown>): string {
    if (typeof parsed['message'] === 'string') return parsed['message'];
    if (typeof parsed['error'] === 'string') return parsed['error'];
    const error = asRecord(parsed['error']);
    if (error) {
        if (typeof error['message'] === 'string') return error['message'];
        const data = asRecord(error['data']);
        if (data && typeof data['message'] === 'string') return data['message'];
        if (typeof error['name'] === 'string') return error['name'];
        if (typeof error['code'] === 'string') return error['code'];
    }
    return '';
}
