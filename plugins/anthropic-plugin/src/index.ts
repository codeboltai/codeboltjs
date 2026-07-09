/**
 * Anthropic Plugin — Claude Pro/Max OAuth only.
 *
 * Talks to Anthropic's Messages API:
 *   POST https://api.anthropic.com/v1/messages
 *
 * Auth: OAuth (PKCE) against claude.ai, tokens stored in
 *   ~/.codebolt/plugins/anthropic-plugin/auth.json (see auth.ts).
 *   No API key fallback.
 *
 * ============================================================================
 * CRITICAL: "Claude Code" stealth mode
 * ============================================================================
 * Anthropic's OAuth-token path on api.anthropic.com requires the request to
 * look like it came from the official Claude Code CLI. This means:
 *   - `anthropic-beta: claude-code-20250219,oauth-2025-04-20,...`
 *   - `user-agent: claude-cli/2.1.2 (external, cli)`
 *   - `x-app: cli`
 *   - System prompt MUST start with:
 *       "You are Claude Code, Anthropic's official CLI for Claude."
 *   - Tool names MUST be remapped to canonical Claude Code names
 *     (Read, Write, Edit, Bash, Grep, Glob, …) when sent, and back to the
 *     caller's names when tool-call blocks are parsed out.
 * Without these, the backend returns 401/403.
 *
 * ============================================================================
 * Minimal adapter
 * ============================================================================
 * This plugin handles text in / text out and basic function tool calls.
 * It does NOT implement:
 *   - image inputs
 *   - image outputs
 *   - thinking / extended-thinking streaming (the reasoning field is ignored)
 *   - prompt caching / cache_control beyond a single trailing marker
 *   - retry/backoff on 429/529
 * Port from pi-mono packages/ai/src/providers/anthropic.ts as needed.
 */

import * as sdkModule from '@codebolt/plugin-sdk';
import {
    clearCredentials,
    getValidCredentials,
    loadCredentials,
    refreshAccessToken,
    type OAuthCredentials,
} from './auth';

const plugin: any = (sdkModule as any).default ?? sdkModule;
const llmProvider: any =
    (sdkModule as any).llmProvider ?? (sdkModule as any).default?.llmProvider;
const chat: any = (sdkModule as any).chat ?? (sdkModule as any).default?.chat;

// normalizeKey(PROVIDER_ID) must equal normalizeKey(PROVIDER_NAME) so that
// whichever field the UI/agent uses as a lookup key resolves to us.
// "anthropic" is already taken by a built-in provider. Use a distinct id
// whose normalized form (lowercase + strip whitespace) doesn't collide with
// the built-in. "Claude OAuth" → "claudeoauth".
const PROVIDER_ID = 'claudeoauth';
const PROVIDER_NAME = 'Claude OAuth';
const MESSAGES_URL = 'https://api.anthropic.com/v1/messages';
const MODELS_URL = 'https://api.anthropic.com/v1/models';
type ModelMetadata = {
    id: string;
    name: string;
    tokenLimit?: number;
    maxOutputTokens?: number;
};

const discoveredModelMetadata = new Map<
    string,
    { tokenLimit?: number; maxOutputTokens?: number }
>();

const ANTHROPIC_MODEL_METADATA: Record<
    string,
    { tokenLimit?: number; maxOutputTokens?: number }
> = {
    // Official Anthropic model docs checked on 2026-04-27.
    'claude-opus-4-1': { tokenLimit: 200000, maxOutputTokens: 32000 },
    'claude-opus-4-1-20250805': { tokenLimit: 200000, maxOutputTokens: 32000 },
    'claude-opus-4-0': { tokenLimit: 200000, maxOutputTokens: 32000 },
    'claude-opus-4-20250514': { tokenLimit: 200000, maxOutputTokens: 32000 },
    'claude-sonnet-4-0': { tokenLimit: 200000, maxOutputTokens: 64000 },
    'claude-sonnet-4-20250514': { tokenLimit: 200000, maxOutputTokens: 64000 },
    'claude-3-7-sonnet-latest': { tokenLimit: 200000, maxOutputTokens: 64000 },
    'claude-3-7-sonnet-20250219': { tokenLimit: 200000, maxOutputTokens: 64000 },
    'claude-3-5-haiku-latest': { tokenLimit: 200000, maxOutputTokens: 8192 },
    'claude-3-5-haiku-20241022': { tokenLimit: 200000, maxOutputTokens: 8192 },
    'claude-3-haiku-20240307': { tokenLimit: 200000, maxOutputTokens: 4096 },
};

const FALLBACK_MODELS: ModelMetadata[] = [
    { id: 'claude-opus-4-1', name: 'claude-opus-4-1' },
    { id: 'claude-opus-4-1-20250805', name: 'claude-opus-4-1-20250805' },
    { id: 'claude-opus-4-0', name: 'claude-opus-4-0' },
    { id: 'claude-opus-4-20250514', name: 'claude-opus-4-20250514' },
    { id: 'claude-sonnet-4-0', name: 'claude-sonnet-4-0' },
    { id: 'claude-sonnet-4-20250514', name: 'claude-sonnet-4-20250514' },
    { id: 'claude-3-7-sonnet-latest', name: 'claude-3-7-sonnet-latest' },
    { id: 'claude-3-7-sonnet-20250219', name: 'claude-3-7-sonnet-20250219' },
    { id: 'claude-3-5-haiku-latest', name: 'claude-3-5-haiku-latest' },
    { id: 'claude-3-5-haiku-20241022', name: 'claude-3-5-haiku-20241022' },
    { id: 'claude-3-haiku-20240307', name: 'claude-3-haiku-20240307' },
].map((model) => ({
    ...model,
    ...ANTHROPIC_MODEL_METADATA[model.id],
}));

function notifyChat(message: string): void {
    try {
        chat?.sendNotificationEvent?.(message, 'debug');
    } catch {
        /* ignore */
    }
}

// =============================================================================
// Claude Code stealth: tool-name remapping
// =============================================================================

const CLAUDE_CODE_TOOLS = [
    'Read',
    'Write',
    'Edit',
    'Bash',
    'Grep',
    'Glob',
    'AskUserQuestion',
    'TodoWrite',
    'WebFetch',
    'WebSearch',
] as const;
const CC_LOOKUP = new Map(CLAUDE_CODE_TOOLS.map((t) => [t.toLowerCase(), t]));

/** Map caller tool name → canonical Claude Code name (when sending). */
function toClaudeCodeName(name: string): string {
    return CC_LOOKUP.get(name.toLowerCase()) ?? name;
}

/** Map Claude Code name → caller's original tool name (when receiving). */
function fromClaudeCodeName(name: string, tools?: any[]): string {
    const lower = name.toLowerCase();
    const match = tools?.find((t) => {
        const n = t?.function?.name ?? t?.name;
        return typeof n === 'string' && n.toLowerCase() === lower;
    });
    return match?.function?.name ?? match?.name ?? name;
}

const CLAUDE_CODE_SYSTEM =
    "You are Claude Code, Anthropic's official CLI for Claude.";

// =============================================================================
// chat-completions  →  Anthropic Messages  (request translation)
// =============================================================================

function extractText(content: any): string {
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
        return content
            .map((p: any) => {
                if (typeof p === 'string') return p;
                if (typeof p?.text === 'string') return p.text;
                if (typeof p?.content === 'string') return p.content;
                return '';
            })
            .join('');
    }
    return '';
}

function stringifyValue(value: unknown): string {
    if (typeof value === 'string') return value;
    if (value === null || value === undefined) return '';
    try {
        return JSON.stringify(value);
    } catch {
        return String(value);
    }
}

function toToolSearchOutputPayload(item: any): Record<string, unknown> {
    const toolCount = Array.isArray(item.tools) ? item.tools.length : 0;
    const resources = Array.isArray(item.resources) ? item.resources : [];

    return {
        searchResult: {
            summary: `found ${toolCount} tool${toolCount === 1 ? '' : 's'} and ${resources.length} resource${resources.length === 1 ? '' : 's'}`,
            resources,
        },
    };
}

/**
 * Translate chat-completions messages into Anthropic's {system, messages[]}
 * shape. Consecutive tool-result messages are merged into a single user turn
 * with multiple tool_result blocks (Anthropic requires this).
 */
function toAnthropicMessages(
    rawMessages: any[],
    tools: any[] | undefined
): { system: any[]; messages: any[] } {
    let systemText = '';
    const out: any[] = [];
    const seenToolUseIds = new Set<string>();

    const pushUser = (blocks: any[]) => {
        if (blocks.length === 0) return;
        out.push({ role: 'user', content: blocks });
    };

    for (let i = 0; i < (rawMessages?.length ?? 0); i++) {
        const msg = rawMessages[i];
        if (!msg) continue;

        if (msg.role === 'system') {
            const t = extractText(msg.content);
            systemText = systemText ? `${systemText}\n\n${t}` : t;
            continue;
        }

        if (msg.role === 'user') {
            const t = extractText(msg.content);
            if (t.trim()) pushUser([{ type: 'text', text: t }]);
            continue;
        }

        if (msg.role === 'assistant') {
            const blocks: any[] = [];
            const text = extractText(msg.content);
            if (text.trim()) blocks.push({ type: 'text', text });
            for (const tc of msg.tool_calls ?? []) {
                let input: any = {};
                try {
                    input = tc.function?.arguments ? JSON.parse(tc.function.arguments) : {};
                } catch {
                    input = {};
                }
                if (tc.id) seenToolUseIds.add(tc.id);
                blocks.push({
                    type: 'tool_use',
                    id: tc.id,
                    name: toClaudeCodeName(tc.function?.name ?? ''),
                    input,
                });
            }
            if (blocks.length > 0) out.push({ role: 'assistant', content: blocks });
            continue;
        }

        if (msg.role === 'tool') {
            if (!seenToolUseIds.has(msg.tool_call_id)) {
                pushUser([{
                    type: 'text',
                    text: `Tool result for ${msg.tool_call_id}:\n${extractText(msg.content)}`,
                }]);
                continue;
            }
            // Merge consecutive tool results into one user turn
            const toolBlocks: any[] = [
                {
                    type: 'tool_result',
                    tool_use_id: msg.tool_call_id,
                    content: extractText(msg.content),
                },
            ];
            let j = i + 1;
            while (j < rawMessages.length && rawMessages[j]?.role === 'tool') {
                toolBlocks.push({
                    type: 'tool_result',
                    tool_use_id: rawMessages[j].tool_call_id,
                    content: extractText(rawMessages[j].content),
                });
                j++;
            }
            i = j - 1;
            pushUser(toolBlocks);
            continue;
        }
    }

    // Build system as array with Claude Code identity FIRST, then caller's system
    const system: any[] = [
        { type: 'text', text: CLAUDE_CODE_SYSTEM, cache_control: { type: 'ephemeral' } },
    ];
    if (systemText.trim()) {
        system.push({
            type: 'text',
            text: systemText,
            cache_control: { type: 'ephemeral' },
        });
    }

    // Trailing cache marker on last user block (optional but pi-mono does it)
    if (out.length > 0) {
        const last = out[out.length - 1];
        if (last.role === 'user' && Array.isArray(last.content) && last.content.length > 0) {
            last.content[last.content.length - 1].cache_control = { type: 'ephemeral' };
        }
    }

    // tools param is consumed by the caller; unused here
    void tools;
    return { system, messages: out };
}

function toAnthropicMessagesFromOptions(
    options: any,
    tools: any[] | undefined
): { system: any[]; messages: any[] } {
    const hasInputItems = Array.isArray(options?.input) && options.input.length > 0;
    if (!hasInputItems) {
        const result = toAnthropicMessages(options?.messages ?? [], tools);
        if (options?.instructions) {
            result.system.push({
                type: 'text',
                text: String(options.instructions),
                cache_control: { type: 'ephemeral' },
            });
        }
        return result;
    }

    let systemText = String(options?.instructions || '');
    const out: any[] = [];
    const seenToolUseIds = new Set<string>();

    const appendSystem = (text: string) => {
        if (!text.trim()) return;
        systemText = systemText ? `${systemText}\n\n${text}` : text;
    };

    const pushUser = (blocks: any[]) => {
        if (blocks.length > 0) out.push({ role: 'user', content: blocks });
    };

    for (const item of options.input ?? []) {
        if (!item) continue;

        if (!item.type || item.type === 'message') {
            const role = item.role === 'developer' ? 'system' : item.role;
            if (role === 'system') {
                appendSystem(extractText(item.content));
                continue;
            }
            if (role === 'user') {
                const text = extractText(item.content);
                if (text.trim()) pushUser([{ type: 'text', text }]);
                continue;
            }
            if (role === 'assistant') {
                const text = extractText(item.content);
                if (text.trim()) out.push({ role: 'assistant', content: [{ type: 'text', text }] });
                continue;
            }
            if (role === 'tool') {
                if (!seenToolUseIds.has(item.tool_call_id)) {
                    pushUser([{
                        type: 'text',
                        text: `Tool result for ${item.tool_call_id}:\n${extractText(item.content)}`,
                    }]);
                    continue;
                }
                pushUser([{
                    type: 'tool_result',
                    tool_use_id: item.tool_call_id,
                    content: extractText(item.content),
                }]);
                continue;
            }
        }

        if (item.type === 'function_call' || item.type === 'tool_search_call') {
            const toolUseId = item.call_id || item.id;
            if (toolUseId) seenToolUseIds.add(toolUseId);
            let input: any = {};
            try {
                input = typeof item.arguments === 'string'
                    ? JSON.parse(item.arguments || '{}')
                    : item.arguments || {};
            } catch {
                input = {};
            }
            out.push({
                role: 'assistant',
                content: [{
                    type: 'tool_use',
                    id: toolUseId,
                    name: toClaudeCodeName(item.type === 'tool_search_call' ? 'tool_search' : item.name),
                    input,
                }],
            });
            continue;
        }

        if (item.type === 'function_call_output') {
            if (!seenToolUseIds.has(item.call_id)) {
                pushUser([{
                    type: 'text',
                    text: `Tool result for ${item.call_id}:\n${stringifyValue(item.output)}`,
                }]);
                continue;
            }
            pushUser([{
                type: 'tool_result',
                tool_use_id: item.call_id,
                content: stringifyValue(item.output),
            }]);
            continue;
        }

        if (item.type === 'tool_search_output') {
            if (!seenToolUseIds.has(item.call_id || item.id)) {
                pushUser([{
                    type: 'text',
                    text: `Tool search result for ${item.call_id || item.id}:\n${stringifyValue(toToolSearchOutputPayload(item))}`,
                }]);
                continue;
            }
            pushUser([{
                type: 'tool_result',
                tool_use_id: item.call_id || item.id,
                content: stringifyValue(toToolSearchOutputPayload(item)),
            }]);
            continue;
        }

        if (item.type === 'additional_tools' && Array.isArray(item.tools)) {
            appendSystem(`Additional tools available:\n${stringifyValue(item.tools)}`);
        }
    }

    const system: any[] = [
        { type: 'text', text: CLAUDE_CODE_SYSTEM, cache_control: { type: 'ephemeral' } },
    ];
    if (systemText.trim()) {
        system.push({
            type: 'text',
            text: systemText,
            cache_control: { type: 'ephemeral' },
        });
    }

    if (out.length > 0) {
        const last = out[out.length - 1];
        if (last.role === 'user' && Array.isArray(last.content) && last.content.length > 0) {
            last.content[last.content.length - 1].cache_control = { type: 'ephemeral' };
        }
    }

    void tools;
    return { system, messages: out };
}

/** Deep-fix: arrays without `items` get `items: {}`. See codex-plugin notes. */
function sanitizeJsonSchema(schema: any): any {
    if (schema == null || typeof schema !== 'object') return schema;
    if (Array.isArray(schema)) return schema.map(sanitizeJsonSchema);
    const out: any = {};
    for (const [k, v] of Object.entries(schema)) {
        out[k] = sanitizeJsonSchema(v);
    }
    if (out.type === 'array' && out.items === undefined) {
        out.items = {};
    }
    return out;
}

function getRequestToolName(tool: any): string {
    const fn = tool?.function ?? tool;
    return typeof fn?.name === 'string' ? fn.name.trim() : '';
}

function normalizeRequestTools(tools: any[] | undefined): any[] | undefined {
    if (!Array.isArray(tools) || tools.length === 0) return undefined;

    const toolsByName = new Map<string, any>();
    for (const tool of tools) {
        const toolName = getRequestToolName(tool);
        if (!toolName || toolsByName.has(toolName)) continue;
        toolsByName.set(toolName, tool);
    }

    const normalizedTools = Array.from(toolsByName.entries())
        .sort(([leftName], [rightName]) => leftName.localeCompare(rightName))
        .map(([, tool]) => tool);

    return normalizedTools.length > 0 ? normalizedTools : undefined;
}

function toAnthropicTools(tools: any[] | undefined): any[] | undefined {
    const normalizedTools = normalizeRequestTools(tools);
    if (!normalizedTools) return undefined;

    return normalizedTools.map((tool) => {
        const fn = tool?.function ?? tool;
        return {
            name: toClaudeCodeName(getRequestToolName(tool)),
            description: fn.description,
            input_schema: sanitizeJsonSchema(
                fn.parameters ?? { type: 'object', properties: {} }
            ),
        };
    });
}

function collectRequestTools(options: any): any[] | undefined {
    const tools: any[] = Array.isArray(options?.tools) ? [...options.tools] : [];
    const input = Array.isArray(options?.input) ? options.input : [];

    for (let index = input.length - 1; index >= 0; index -= 1) {
        const item = input[index];
        if (!item) continue;
        if (item.type !== 'tool_search_output') break;
        if (Array.isArray(item.tools)) {
            tools.unshift(...item.tools);
        }
    }

    return normalizeRequestTools(tools);
}

function normalizeModelId(raw: unknown): string {
    const s = String(raw ?? '').trim();
    if (!s) return 'claude-sonnet-4-0';
    return s.toLowerCase().replace(/\s+/g, '-');
}

function coercePositiveNumber(value: unknown): number | undefined {
    return typeof value === 'number' && Number.isFinite(value) && value > 0
        ? value
        : undefined;
}

function extractModelMetadata(model: any): { tokenLimit?: number; maxOutputTokens?: number } {
    return {
        tokenLimit:
            coercePositiveNumber(model?.context_window) ??
            coercePositiveNumber(model?.input_token_limit) ??
            coercePositiveNumber(model?.token_limit),
        maxOutputTokens:
            coercePositiveNumber(model?.max_output_tokens) ??
            coercePositiveNumber(model?.output_token_limit),
    };
}

function getModelMetadata(modelId: string): { tokenLimit?: number; maxOutputTokens?: number } {
    return discoveredModelMetadata.get(modelId) ?? ANTHROPIC_MODEL_METADATA[modelId] ?? {};
}

function getProviderManifest(models: ModelMetadata[]) {
    return {
        providerId: PROVIDER_ID,
        name: PROVIDER_NAME,
        description:
            'Anthropic Claude via your Claude Pro/Max subscription. On first use a browser window opens for "Sign in with Claude". No API key required.',
        capabilities: ['chat', 'tools', 'streaming'],
        requiresKey: false,
        configFields: [],
        models,
    };
}

function buildMessagesBody(options: any): any {
    const { system, messages } = toAnthropicMessagesFromOptions(options, options?.tools);
    const body: any = {
        model: normalizeModelId(options?.model),
        system,
        messages,
        max_tokens: options?.max_tokens ?? 8192,
        stream: true,
        cache_control: { type: 'ephemeral' },
    };
    if (options?.temperature !== undefined) body.temperature = options.temperature;
    const tools = toAnthropicTools(collectRequestTools(options));
    if (tools) body.tools = tools;
    return body;
}

// =============================================================================
// Anthropic SSE  →  chat-completions chunks
// =============================================================================

interface Aggregator {
    id: string;
    created: number;
    model: string;
    text: string;
    /** keyed by content_block index */
    toolCalls: Map<
        number,
        { index: number; id: string; name: string; partialJson: string }
    >;
    nextToolIndex: number;
    finish: string;
    usage?: any;
    callerTools?: any[];
    rawLLMRequest?: any;
}

function newAggregator(model: string, callerTools?: any[]): Aggregator {
    return {
        id: '',
        created: 0,
        model,
        text: '',
        toolCalls: new Map(),
        nextToolIndex: 0,
        finish: 'stop',
        usage: undefined,
        callerTools,
        rawLLMRequest: undefined,
    };
}

function ccChunk(agg: Aggregator, delta: any, finish: string | null = null): any {
    return {
        id: agg.id || `anthropic-${Date.now()}`,
        object: 'chat.completion.chunk',
        created: agg.created || Math.floor(Date.now() / 1000),
        model: agg.model,
        choices: [
            {
                index: 0,
                delta,
                finish_reason: finish,
            },
        ],
    };
}

function chatCompletionContentToText(content: any): string {
    if (typeof content === 'string') return content;
    if (content === null || content === undefined) return '';
    if (!Array.isArray(content)) {
        try {
            return JSON.stringify(content);
        } catch {
            return String(content);
        }
    }

    return content
        .map((part: any) => {
            if (!part || typeof part !== 'object') return String(part || '');
            if (part.type === 'text') return typeof part.text === 'string' ? part.text : '';
            if (typeof part.text === 'string') return part.text;
            return '';
        })
        .filter(Boolean)
        .join('');
}

function normalizeFinalResponseForCodeBolt(response: any): any {
    if (!response || typeof response !== 'object') return response;

    const existingItems = Array.isArray(response.items) ? response.items : null;
    if (existingItems) {
        return {
            ...response,
            formatVersion: 'codebolt.llm.v2',
            output_text:
                typeof response.output_text === 'string'
                    ? response.output_text
                    : existingItems
                        .filter((item: any) => item?.type === 'message' && item?.role === 'assistant')
                        .map((item: any) => chatCompletionContentToText(item.content))
                        .filter(Boolean)
                        .join('\n'),
            provider_response: response.provider_response ?? response,
        };
    }

    const assistantMessage = response.choices?.[0]?.message;
    if (!assistantMessage) {
        return {
            ...response,
            formatVersion: 'codebolt.llm.v2',
            items: [],
            output_text: typeof response.output_text === 'string' ? response.output_text : '',
            provider_response: response.provider_response ?? response,
        };
    }

    const outputText = chatCompletionContentToText(assistantMessage.content);
    const items: any[] = [];

    if (outputText || assistantMessage.content !== null) {
        items.push({
            type: 'message',
            role: 'assistant',
            content: assistantMessage.content,
        });
    }

    if (assistantMessage.reasoning?.thinking) {
        items.push({
            type: 'reasoning',
            content: assistantMessage.reasoning.thinking,
            summary: assistantMessage.reasoning.thinking,
        });
    }

    for (const toolCall of assistantMessage.tool_calls || []) {
        if (toolCall?.type !== 'function') continue;
        items.push({
            type: 'function_call',
            call_id: toolCall.id,
            name: toolCall.function?.name || '',
            arguments: toolCall.function?.arguments || '',
        });
    }

    return {
        ...response,
        formatVersion: 'codebolt.llm.v2',
        items,
        output_text: outputText,
        provider_response: response.provider_response ?? response,
    };
}

function makeFinalResponse(agg: Aggregator): any {
    const modelMetadata = getModelMetadata(agg.model);
    const toolCalls = Array.from(agg.toolCalls.values())
        .sort((a, b) => a.index - b.index)
        .map((tc) => ({
            id: tc.id,
            type: 'function',
            function: {
                name: fromClaudeCodeName(tc.name, agg.callerTools),
                arguments: tc.partialJson || '{}',
            },
        }));
    const message: any = { role: 'assistant', content: agg.text };
    if (toolCalls.length > 0) {
        message.tool_calls = toolCalls;
        if (agg.finish === 'stop') agg.finish = 'tool_calls';
    }
    return normalizeFinalResponseForCodeBolt({
        id: agg.id || `anthropic-${Date.now()}`,
        object: 'chat.completion',
        created: agg.created || Math.floor(Date.now() / 1000),
        model: agg.model,
        tokenLimit: modelMetadata.tokenLimit,
        maxOutputTokens: modelMetadata.maxOutputTokens,
        choices: [{ index: 0, message, finish_reason: agg.finish }],
        usage: agg.usage,
        rawLLMRequest: agg.rawLLMRequest,
    });
}

function mapAnthropicStopReason(r: string | undefined): string {
    switch (r) {
        case 'end_turn':
        case 'stop_sequence':
        case 'pause_turn':
            return 'stop';
        case 'max_tokens':
            return 'length';
        case 'tool_use':
            return 'tool_calls';
        default:
            return 'stop';
    }
}

function normalizeAnthropicUsage(usage: any): any {
    if (!usage || typeof usage !== 'object') {
        return usage;
    }

    const rawInputTokens = usage.input_tokens ?? usage.prompt_tokens ?? 0;
    const completionTokens = usage.output_tokens ?? usage.completion_tokens ?? 0;
    const cachedTokens = usage.cache_read_input_tokens ?? usage.cached_tokens;
    const cacheCreationTokens = usage.cache_creation_input_tokens ?? usage.cache_creation_tokens;
    const cacheInputTokens = (cachedTokens ?? 0) + (cacheCreationTokens ?? 0);
    const promptTokens = cacheInputTokens > 0 && rawInputTokens < cacheInputTokens
        ? rawInputTokens + cacheInputTokens
        : rawInputTokens;

    const computedTotalTokens = promptTokens + completionTokens;
    const rawTotalTokens = usage.total_tokens;
    const totalTokens = cacheInputTokens > 0 &&
        typeof rawTotalTokens === 'number' &&
        rawTotalTokens < computedTotalTokens
        ? computedTotalTokens
        : rawTotalTokens ?? computedTotalTokens;

    return {
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: totalTokens,
        input_tokens: promptTokens,
        output_tokens: completionTokens,
        ...(cachedTokens !== undefined ? { cached_tokens: cachedTokens } : {}),
        ...(cacheCreationTokens !== undefined ? { cache_creation_tokens: cacheCreationTokens } : {}),
        ...(cachedTokens !== undefined ? { cache_read_input_tokens: cachedTokens } : {}),
        ...(cacheCreationTokens !== undefined ? { cache_creation_input_tokens: cacheCreationTokens } : {}),
        prompt_tokens_details: {
            ...(cachedTokens !== undefined ? { cached_tokens: cachedTokens } : {}),
        },
        completion_tokens_details: {},
        provider_usage: usage,
    };
}

/** Dispatch a single Anthropic SSE event, mutating agg and emitting chunks. */
function handleAnthropicEvent(
    ev: any,
    agg: Aggregator,
    emit: (chunk: any) => void
): void {
    const t: string = ev?.type || '';

    if (t === 'message_start') {
        if (ev.message?.id && !agg.id) agg.id = ev.message.id;
        if (ev.message?.model) agg.model = ev.message.model;
        if (ev.message?.usage) {
            agg.usage = normalizeAnthropicUsage(ev.message.usage);
        }
        return;
    }

    if (t === 'content_block_start') {
        const block = ev.content_block;
        if (block?.type === 'text') {
            // First text block → emit role marker
            emit(ccChunk(agg, { role: 'assistant', content: '' }));
            return;
        }
        if (block?.type === 'tool_use') {
            const index = agg.nextToolIndex++;
            const entry = {
                index,
                id: block.id,
                name: block.name,
                partialJson: '',
            };
            agg.toolCalls.set(ev.index, entry);
            emit(
                ccChunk(agg, {
                    tool_calls: [
                        {
                            index,
                            id: entry.id,
                            type: 'function',
                            function: {
                                name: fromClaudeCodeName(entry.name, agg.callerTools),
                                arguments: '',
                            },
                        },
                    ],
                })
            );
            return;
        }
        return;
    }

    if (t === 'content_block_delta') {
        const delta = ev.delta;
        if (delta?.type === 'text_delta') {
            const text: string = delta.text ?? '';
            agg.text += text;
            emit(ccChunk(agg, { content: text }));
            return;
        }
        if (delta?.type === 'input_json_delta') {
            const entry = agg.toolCalls.get(ev.index);
            if (!entry) return;
            const partial: string = delta.partial_json ?? '';
            entry.partialJson += partial;
            emit(
                ccChunk(agg, {
                    tool_calls: [
                        {
                            index: entry.index,
                            function: { arguments: partial },
                        },
                    ],
                })
            );
            return;
        }
        // thinking_delta, signature_delta: ignored in this minimal adapter
        return;
    }

    if (t === 'content_block_stop') {
        return;
    }

    if (t === 'message_delta') {
        const reason: string | undefined = ev.delta?.stop_reason;
        if (reason) agg.finish = mapAnthropicStopReason(reason);
        if (ev.usage) {
            const providerUsage = {
                ...(agg.usage?.provider_usage || {}),
                ...ev.usage,
            };
            agg.usage = normalizeAnthropicUsage(providerUsage);
        }
        return;
    }

    if (t === 'message_stop') {
        return;
    }

    if (t === 'error') {
        const msg = ev?.error?.message || 'Anthropic request failed';
        throw new Error(msg);
    }
}

// =============================================================================
// HTTP transport
// =============================================================================

const BETA_FEATURES = [
    'claude-code-20250219',
    'oauth-2025-04-20',
    'fine-grained-tool-streaming-2025-05-14',
    'interleaved-thinking-2025-05-14',
];

function buildHeaders(accessToken: string): Record<string, string> {
    return {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        'anthropic-version': '2023-06-01',
        'anthropic-beta': BETA_FEATURES.join(','),
        'anthropic-dangerous-direct-browser-access': 'true',
        'user-agent': 'claude-cli/2.1.2 (external, cli)',
        'x-app': 'cli',
    };
}

async function getSavedCredentialsForDiscovery(): Promise<OAuthCredentials | null> {
    const SLACK_MS = 60 * 1000;
    const creds = loadCredentials();
    if (!creds) return null;

    if (creds.expires_at - SLACK_MS >= Date.now()) {
        return creds;
    }

    try {
        return await refreshAccessToken(creds);
    } catch (error: any) {
        console.warn(
            `[AnthropicPlugin] Saved credentials could not be refreshed for startup model discovery: ${error?.message || error}`
        );
        return null;
    }
}

async function fetchDynamicModelsWithCredentials(creds: OAuthCredentials): Promise<ModelMetadata[]> {
    const res = await fetch(MODELS_URL, {
        headers: {
            Authorization: `Bearer ${creds.access_token}`,
            Accept: 'application/json',
            'anthropic-version': '2023-06-01',
            'anthropic-beta': BETA_FEATURES.join(','),
            'user-agent': 'claude-cli/2.1.2 (external, cli)',
            'x-app': 'cli',
        },
    });

    if (!res.ok) {
        throw new Error(`Model discovery failed: ${res.status} ${await res.text()}`);
    }

    const payload: any = await res.json();
    const models: ModelMetadata[] = Array.isArray(payload?.data)
        ? payload.data
              .map((model: any) => {
                  const id = String(model?.id ?? '').trim();
                  if (!id) return null;
                  const metadata = {
                      ...ANTHROPIC_MODEL_METADATA[id],
                      ...extractModelMetadata(model),
                  };
                  discoveredModelMetadata.set(id, metadata);
                  return {
                      id,
                      name: String(model?.display_name ?? id).trim() || id,
                      ...metadata,
                  };
              })
              .filter(Boolean)
        : [];

    if (models.length === 0) {
        throw new Error('Model discovery returned no models');
    }

    models.sort((a, b) => a.id.localeCompare(b.id));
    return models;
}

async function registerProviderWithModels(): Promise<void> {
    let models: ModelMetadata[] = FALLBACK_MODELS;
    try {
        const savedCreds = await getSavedCredentialsForDiscovery();
        if (savedCreds) {
            models = await fetchDynamicModelsWithCredentials(savedCreds);
            console.log(`[AnthropicPlugin] Loaded ${models.length} dynamic models`);
        } else {
            console.log('[AnthropicPlugin] No saved Claude auth; registering fallback models');
        }
    } catch (error: any) {
        console.warn(
            `[AnthropicPlugin] Dynamic model discovery failed, using fallback list: ${error?.message || error}`
        );
    }

    const result = await llmProvider.register(getProviderManifest(models));
    if (!result?.success) {
        throw new Error(result?.error || 'Provider registration failed');
    }
}

async function callAnthropic(
    options: any,
    onChunk: ((chunk: any) => void) | null
): Promise<any> {
    let creds = await getValidCredentials(notifyChat);
    const body = buildMessagesBody(options);

    const doFetch = () =>
        fetch(MESSAGES_URL, {
            method: 'POST',
            headers: buildHeaders(creds.access_token),
            body: JSON.stringify(body),
        });

    let res = await doFetch();

    if (res.status === 401) {
        console.warn('[AnthropicPlugin] 401 from backend — clearing tokens and re-logging in');
        clearCredentials();
        creds = await getValidCredentials(notifyChat);
        res = await doFetch();
    }

    if (!res.ok || !res.body) {
        const text = await res.text().catch(() => '');
        throw new Error(`Anthropic error ${res.status}: ${text}`);
    }

    const agg = newAggregator(normalizeModelId(options?.model), options?.tools);
    agg.rawLLMRequest = body;
    const reader = (res.body as any).getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf('\n')) >= 0) {
            const line = buffer.slice(0, idx).trimEnd();
            buffer = buffer.slice(idx + 1);
            if (!line || line.startsWith(':') || line.startsWith('event:')) continue;
            if (!line.startsWith('data:')) continue;
            const payload = line.slice(5).trim();
            if (!payload || payload === '[DONE]') continue;

            let ev: any;
            try {
                ev = JSON.parse(payload);
            } catch {
                continue;
            }

            handleAnthropicEvent(ev, agg, (chunk) => {
                if (onChunk) onChunk(chunk);
            });
        }
    }

    return makeFinalResponse(agg);
}

// =============================================================================
// Plugin lifecycle
// =============================================================================

plugin.onStart(async (ctx: any) => {
    console.log(`[AnthropicPlugin] Starting (pluginId: ${ctx.pluginId})`);

    if (!llmProvider) {
        console.error(
            '[AnthropicPlugin] llmProvider module missing from @codebolt/plugin-sdk.'
        );
        return;
    }

    try {
        await registerProviderWithModels();
        console.log(`[AnthropicPlugin] Registered provider "${PROVIDER_ID}"`);
    } catch (error: any) {
        console.error('[AnthropicPlugin] Error registering:', error?.message || error);
        return;
    }

    llmProvider.onCompletionRequest(async (req: any) => {
        console.log(
            `[AnthropicPlugin] completionRequest ${req.requestId} model=${req.options?.model}`
        );
        try {
            const response = await callAnthropic(req.options, null);
            llmProvider.sendReply(req.requestId, response, true);
        } catch (error: any) {
            console.error('[AnthropicPlugin] completion error:', error?.message || error);
            llmProvider.sendError(req.requestId, error?.message || 'Unknown error');
        }
    });

    llmProvider.onLoginRequest(async (req: any) => {
        console.log(`[AnthropicPlugin] loginRequest ${req.requestId}`);
        try {
            await getValidCredentials(notifyChat);
            await registerProviderWithModels();
            console.log('[AnthropicPlugin] Login successful via UI trigger');
            llmProvider.sendReply(req.requestId, { authenticated: true }, true);
        } catch (error: any) {
            console.error('[AnthropicPlugin] login error:', error?.message || error);
            llmProvider.sendError(req.requestId, error?.message || 'Login failed');
        }
    });

    llmProvider.onStreamRequest(async (req: any) => {
        console.log(
            `[AnthropicPlugin] streamRequest ${req.requestId} model=${req.options?.model}`
        );
        try {
            const finalResponse = await callAnthropic(req.options, (chunk) => {
                llmProvider.sendChunk(req.requestId, chunk);
            });
            llmProvider.sendReply(req.requestId, finalResponse, true);
        } catch (error: any) {
            console.error('[AnthropicPlugin] stream error:', error?.message || error);
            llmProvider.sendError(req.requestId, error?.message || 'Unknown error');
        }
    });

    console.log('[AnthropicPlugin] Ready');
});

plugin.onStop(async () => {
    console.log('[AnthropicPlugin] Stopping...');
    try {
        if (llmProvider) {
            await llmProvider.unregister(PROVIDER_ID);
        }
    } catch (error: any) {
        console.warn('[AnthropicPlugin] Error unregistering:', error?.message || error);
    }
    console.log('[AnthropicPlugin] Stopped');
});
