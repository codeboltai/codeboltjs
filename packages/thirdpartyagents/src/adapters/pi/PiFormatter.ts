import { BaseFormatter } from '../../base/BaseFormatter.js';
import type { CodeboltMessage } from '../../types.js';

/**
 * Formatter for Pi AI Agent CLI JSON output.
 *
 * Parses newline-delimited JSON events from Pi's `--mode json` output.
 *
 * Event types: agent_start, agent_end, turn_start, turn_end,
 * message_update, tool_execution_start, tool_execution_end, error, usage
 */
export class PiFormatter extends BaseFormatter {
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

        // Skip RPC protocol messages
        if (type === 'response' || type === 'extension_ui_request' ||
            type === 'extension_ui_response' || type === 'extension_error') {
            return [];
        }

        // ── Agent start (init) ──
        if (type === 'agent_start') {
            const sessionId = typeof parsed['sessionId'] === 'string'
                ? parsed['sessionId']
                : typeof parsed['session_id'] === 'string'
                    ? parsed['session_id']
                    : undefined;
            return [{
                type: 'init',
                timestamp,
                sessionId,
                raw: parsed,
            }];
        }

        // ── Agent end (final result) ──
        if (type === 'agent_end') {
            const messages = asArray(parsed['messages']);
            let finalText = '';
            for (const msg of messages) {
                const m = asRecord(msg);
                if (m && typeof m['text'] === 'string') {
                    finalText = m['text'];
                }
            }

            const usage = asRecord(parsed['usage']);
            const inputTokens = asNumber(usage?.['inputTokens'] ?? usage?.['input_tokens']);
            const outputTokens = asNumber(usage?.['outputTokens'] ?? usage?.['output_tokens']);
            const cachedTokens = asNumber(usage?.['cachedInputTokens'] ?? usage?.['cached_input_tokens']);
            const costUsd = asNumber(usage?.['costUsd'] ?? usage?.['cost_usd'] ?? usage?.['cost']);

            return [{
                type: 'result',
                timestamp,
                text: finalText || 'Agent completed',
                usage: { inputTokens, outputTokens, cachedTokens, costUsd },
                raw: parsed,
            }];
        }

        // ── Turn end (usage per turn) ──
        if (type === 'turn_end') {
            const message = asRecord(parsed['message']);
            const text = message && typeof message['text'] === 'string' ? message['text'] : '';

            const usage = asRecord(parsed['usage']);
            const inputTokens = asNumber(usage?.['inputTokens'] ?? usage?.['input_tokens']);
            const outputTokens = asNumber(usage?.['outputTokens'] ?? usage?.['output_tokens']);
            const cachedTokens = asNumber(usage?.['cachedInputTokens'] ?? usage?.['cached_input_tokens']);
            const costUsd = asNumber(usage?.['costUsd'] ?? usage?.['cost_usd'] ?? usage?.['cost']);

            if (text) {
                return [{
                    type: 'assistant_text',
                    timestamp,
                    text,
                    usage: { inputTokens, outputTokens, cachedTokens, costUsd },
                    raw: parsed,
                }];
            }
            return [{ type: 'raw', timestamp, text: trimmed, raw: parsed }];
        }

        // ── Message update (streaming text delta) ──
        if (type === 'message_update') {
            const event = asRecord(parsed['assistantMessageEvent']);
            if (event && event['type'] === 'text_delta') {
                const text = typeof event['text'] === 'string' ? event['text'] : '';
                if (text) {
                    return [{
                        type: 'assistant_text',
                        timestamp,
                        text,
                        raw: parsed,
                    }];
                }
            }
            return [];
        }

        // ── Tool execution start ──
        if (type === 'tool_execution_start') {
            const toolName = typeof parsed['toolName'] === 'string'
                ? parsed['toolName']
                : typeof parsed['tool_name'] === 'string'
                    ? parsed['tool_name']
                    : 'unknown';
            const toolCallId = typeof parsed['toolCallId'] === 'string'
                ? parsed['toolCallId']
                : typeof parsed['tool_call_id'] === 'string'
                    ? parsed['tool_call_id']
                    : undefined;
            return [{
                type: 'tool_use',
                timestamp,
                toolName,
                toolUseId: toolCallId,
                toolInput: parsed['args'] ?? {},
                raw: parsed,
            }];
        }

        // ── Tool execution end ──
        if (type === 'tool_execution_end') {
            const toolCallId = typeof parsed['toolCallId'] === 'string'
                ? parsed['toolCallId']
                : typeof parsed['tool_call_id'] === 'string'
                    ? parsed['tool_call_id']
                    : undefined;
            const result = typeof parsed['result'] === 'string' ? parsed['result'] : '';
            const isError = parsed['isError'] === true || parsed['is_error'] === true;
            return [{
                type: 'tool_result',
                timestamp,
                toolUseId: toolCallId,
                toolResultContent: result,
                isError,
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

        // ── Auto retry end ──
        if (type === 'auto_retry_end') {
            return [{
                type: 'error',
                timestamp,
                text: 'Auto-retry exhausted',
                isError: true,
                raw: parsed,
            }];
        }

        // ── Usage (fallback) ──
        if (type === 'usage') {
            const inputTokens = asNumber(parsed['inputTokens'] ?? parsed['input_tokens']);
            const outputTokens = asNumber(parsed['outputTokens'] ?? parsed['output_tokens']);
            const cachedTokens = asNumber(parsed['cachedInputTokens'] ?? parsed['cached_input_tokens']);
            const costUsd = asNumber(parsed['costUsd'] ?? parsed['cost_usd'] ?? parsed['cost']);
            return [{
                type: 'result',
                timestamp,
                text: 'Usage update',
                usage: { inputTokens, outputTokens, cachedTokens, costUsd },
                raw: parsed,
            }];
        }

        // ── Turn start, agent lifecycle — informational ──
        if (type === 'turn_start' || type === 'agent_start') {
            return [{ type: 'system', timestamp, text: type, raw: parsed }];
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
