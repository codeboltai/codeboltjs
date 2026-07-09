/**
 * OpenAI Codex Plugin — ChatGPT login only.
 *
 * Talks to the UNDOCUMENTED ChatGPT backend Responses API:
 *   POST https://chatgpt.com/backend-api/codex/responses
 *
 * Auth:
 *   - OAuth (PKCE) against auth.openai.com, tokens stored in
 *     ~/.codebolt/plugins/codex-plugin/auth.json (see auth.ts).
 *   - On first request the browser flow is launched automatically.
 *   - No API-key fallback. User cannot use an sk-… key with this plugin.
 *
 * ============================================================================
 * IMPORTANT: this is a MINIMAL adapter
 * ============================================================================
 * The real pi-mono provider (openai-codex-responses.ts + openai-responses-shared.ts,
 * ~1500 LOC) handles a lot that this plugin does NOT:
 *   - full message-content translation (images, tool results, reasoning blocks)
 *   - the experimental WebSocket transport
 *   - reasoning/thinking deltas
 *   - retry/backoff on 429/503
 *   - parallel tool calls, encrypted reasoning content
 *   - prompt caching, session IDs
 *
 * This plugin supports text in / text out + basic function tool calls. Anything
 * beyond that should be ported from pi-mono as needed.
 *
 * Route into the plugin: llmService → forwardStream/forwardCompletion → this file.
 * The agent side speaks chat-completions shape, so we translate both ways.
 */

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import * as sdkModule from '@codebolt/plugin-sdk';
import {
    beginLoginFlow,
    clearCredentials,
    getValidCredentials,
    loadCredentials,
    ORIGINATOR,
    refreshAccessToken,
    type OAuthCredentials,
} from './auth';

// =============================================================================
// Debug file logger — one file per request under ~/.codebolt/plugins/codex-plugin/logs
// =============================================================================

function redactDebugData(value: any): any {
    if (typeof value === 'string') {
        if (value.startsWith('data:image/')) {
            return '[base64 image data omitted from debug log]';
        }
        return value;
    }

    if (Array.isArray(value)) return value.map(redactDebugData);

    if (value && typeof value === 'object') {
        const redacted: any = {};
        for (const [key, nestedValue] of Object.entries(value)) {
            redacted[key] = redactDebugData(nestedValue);
        }
        return redacted;
    }

    return value;
}

function openDebugLog(requestId: string): {
    write: (label: string, data?: any) => void;
    close: () => void;
    path: string;
} {
    const dir = path.join(os.homedir(), '.codebolt', 'plugins', 'codex-plugin', 'logs');
    try {
        fs.mkdirSync(dir, { recursive: true });
    } catch {
        /* ignore */
    }
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const safeId = (requestId || 'noreq').slice(0, 8);
    const file = path.join(dir, `${ts}-${safeId}.log`);

    let handle: number | null = null;
    try {
        handle = fs.openSync(file, 'a');
    } catch (e) {
        console.warn('[CodexPlugin] Failed to open debug log:', (e as any)?.message);
    }

    const write = (label: string, data?: any) => {
        if (handle == null) return;
        try {
            const line =
                `[${new Date().toISOString()}] ${label}` +
                (data !== undefined ? ' ' + JSON.stringify(redactDebugData(data)) : '') +
                '\n';
            fs.writeSync(handle, line);
        } catch {
            /* ignore */
        }
    };

    const close = () => {
        if (handle == null) return;
        try {
            fs.closeSync(handle);
        } catch {
            /* ignore */
        }
        handle = null;
    };

    return { write, close, path: file };
}

function logOutgoingLLMRequest(body: any): void {
    try {
        console.log(
            `[CodexPlugin] outgoing LLM request JSON:\n${JSON.stringify(redactDebugData(body), null, 2)}`
        );
    } catch (error: any) {
        console.warn('[CodexPlugin] Failed to stringify outgoing LLM request:', error?.message || error);
    }
}

const plugin: any = (sdkModule as any).default ?? sdkModule;
const llmProvider: any =
    (sdkModule as any).llmProvider ?? (sdkModule as any).default?.llmProvider;
const chat: any = (sdkModule as any).chat ?? (sdkModule as any).default?.chat;

const PROVIDER_ID = 'openaicodex';
// IMPORTANT: normalize(name) must equal normalize(providerId), i.e.
// lowercase + strip whitespace. Keep this free of parens / extra words
// or the server's lookup key will diverge from the registered key.
const PROVIDER_NAME = 'OpenAI Codex';
const CODEX_URL = 'https://chatgpt.com/backend-api/codex/responses';
const OPENAI_MODELS_URL = 'https://api.openai.com/v1/models';
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

const OPENAI_MODEL_METADATA: Record<
    string,
    { tokenLimit?: number; maxOutputTokens?: number }
> = {
    // Official OpenAI model docs checked on 2026-04-27.
    'gpt-5.1': { tokenLimit: 400000, maxOutputTokens: 128000 },
    'gpt-5.1-codex-max': { tokenLimit: 400000, maxOutputTokens: 128000 },
    'gpt-5.1-codex-mini': { tokenLimit: 400000, maxOutputTokens: 128000 },
    'gpt-5.2': { tokenLimit: 400000, maxOutputTokens: 128000 },
    'gpt-5.2-codex': { tokenLimit: 400000, maxOutputTokens: 128000 },
    'gpt-5.3-codex': { tokenLimit: 400000, maxOutputTokens: 128000 },
    'gpt-5.4': { tokenLimit: 1000000, maxOutputTokens: 128000 },
    'gpt-5.5': { tokenLimit: 1000000, maxOutputTokens: 128000 },
};

const FALLBACK_MODELS = [
    { id: 'gpt-5.1', name: 'gpt-5.1' },
    { id: 'gpt-5.1-codex-max', name: 'gpt-5.1-codex-max' },
    { id: 'gpt-5.1-codex-mini', name: 'gpt-5.1-codex-mini' },
    { id: 'gpt-5.2', name: 'gpt-5.2' },
    { id: 'gpt-5.2-codex', name: 'gpt-5.2-codex' },
    { id: 'gpt-5.3-codex', name: 'gpt-5.3-codex' },
    { id: 'gpt-5.4', name: 'gpt-5.4' },
    { id: 'gpt-5.5', name: 'gpt-5.5' },
].map((model) => ({
    ...model,
    ...OPENAI_MODEL_METADATA[model.id],
}));

function notifyChat(message: string): void {
    try {
        chat?.sendNotificationEvent?.(message, 'debug');
    } catch {
        /* ignore */
    }
}

// =============================================================================
// chat-completions  →  Responses API  (request translation)
// =============================================================================

/**
 * Convert an array of chat-completions messages into the Responses API
 * `instructions` + `input` shape. Minimal: text content only.
 *
 * Chat-completions:          Responses API:
 *   { role: 'system',         instructions: string
 *     content: string }
 *   { role: 'user',           input: [{ role: 'user',
 *     content: string|parts }            content: [{type:'input_text', text}] }]
 *   { role: 'assistant',      input: [{ role: 'assistant',
 *     content, tool_calls }             content: [{type:'output_text', text}] },
 *                                      {type:'function_call', ...}]
 *   { role: 'tool',           input: [{ type: 'function_call_output',
 *     tool_call_id, content }           call_id, output }]
 */
function buildDataImageUrl(mediaType: unknown, data: unknown): string | null {
    if (typeof data !== 'string' || !data.trim()) return null;
    const normalizedData = data.trim();
    if (normalizedData.startsWith('data:image/')) return normalizedData;

    const normalizedMediaType =
        typeof mediaType === 'string' && mediaType.trim()
            ? mediaType.trim()
            : 'image/png';
    return `data:${normalizedMediaType};base64,${normalizedData}`;
}

function toResponsesImagePart(part: any): any | null {
    if (!part || typeof part !== 'object') return null;

    if (part.type === 'image_url') {
        const imageUrl =
            typeof part.image_url === 'string'
                ? part.image_url
                : part.image_url?.url;
        if (typeof imageUrl === 'string' && imageUrl.trim()) {
            return { type: 'input_image', image_url: imageUrl };
        }
    }

    if (part.type === 'image') {
        if (typeof part.image === 'string' && part.image.trim()) {
            return { type: 'input_image', image_url: part.image };
        }

        if (part.source?.type === 'base64') {
            const imageUrl = buildDataImageUrl(part.source.media_type, part.source.data);
            if (imageUrl) return { type: 'input_image', image_url: imageUrl };
        }

        const imageUrl = buildDataImageUrl(part.media_type, part.data);
        if (imageUrl) return { type: 'input_image', image_url: imageUrl };
    }

    return null;
}

function extractText(content: any): string {
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
        return content
            .map((part: any) => {
                if (typeof part === 'string') return part;
                if (typeof part?.text === 'string') return part.text;
                if (typeof part?.content === 'string') return part.content;
                return '';
            })
            .join('');
    }
    return '';
}

function toResponsesUserContent(content: any): any[] {
    if (typeof content === 'string') return [{ type: 'input_text', text: content }];
    if (!Array.isArray(content)) return [{ type: 'input_text', text: extractText(content) }];

    const responseParts: any[] = [];
    for (const part of content) {
        if (typeof part === 'string') {
            if (part) responseParts.push({ type: 'input_text', text: part });
            continue;
        }

        if (part?.type === 'text' && typeof part.text === 'string') {
            responseParts.push({ type: 'input_text', text: part.text });
            continue;
        }

        if (part?.type === 'input_text' && typeof part.text === 'string') {
            responseParts.push({ type: 'input_text', text: part.text });
            continue;
        }

        const imagePart = toResponsesImagePart(part);
        if (imagePart) responseParts.push(imagePart);
    }

    return responseParts.length > 0 ? responseParts : [{ type: 'input_text', text: '' }];
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
            tools: Array.isArray(item.tools) ? item.tools : [],
            resources,
        },
    };
}

function toResponsesInput(messages: any[]): { instructions: string; input: any[] } {
    let instructions = '';
    const input: any[] = [];
    const seenFunctionCallIds = new Set<string>();

    for (const msg of messages ?? []) {
        if (!msg) continue;

        if (msg.role === 'system') {
            const text = extractText(msg.content);
            instructions = instructions ? `${instructions}\n\n${text}` : text;
            continue;
        }

        if (msg.role === 'user') {
            input.push({
                role: 'user',
                content: toResponsesUserContent(msg.content),
            });
            continue;
        }

        if (msg.role === 'assistant') {
            const text = extractText(msg.content);
            if (text) {
                input.push({
                    role: 'assistant',
                    content: [{ type: 'output_text', text }],
                });
            }
            for (const tc of msg.tool_calls ?? []) {
                if (tc.id) seenFunctionCallIds.add(tc.id);
                input.push({
                    type: 'function_call',
                    call_id: tc.id,
                    name: tc.function?.name,
                    arguments: tc.function?.arguments ?? '',
                });
            }
            continue;
        }

        if (msg.role === 'tool') {
            if (!seenFunctionCallIds.has(msg.tool_call_id)) {
                input.push({
                    role: 'user',
                    content: [{
                        type: 'input_text',
                        text: `Tool result for ${msg.tool_call_id}:\n${extractText(msg.content)}`,
                    }],
                });
                continue;
            }
            input.push({
                type: 'function_call_output',
                call_id: msg.tool_call_id,
                output: extractText(msg.content),
            });
            continue;
        }
    }

    return { instructions, input };
}

function toResponsesInputFromOptions(options: any): { instructions: string; input: any[] } {
    const hasInputItems = Array.isArray(options?.input) && options.input.length > 0;
    if (!hasInputItems) {
        const result = toResponsesInput(options?.messages ?? []);
        if (options?.instructions) {
            result.instructions = result.instructions
                ? `${options.instructions}\n\n${result.instructions}`
                : String(options.instructions);
        }
        return result;
    }

    let instructions = String(options?.instructions || '');
    const input: any[] = [];
    const seenFunctionCallIds = new Set<string>();

    const appendInstruction = (text: string) => {
        if (!text.trim()) return;
        instructions = instructions ? `${instructions}\n\n${text}` : text;
    };

    for (const item of options.input ?? []) {
        if (!item) continue;

        if (!item.type || item.type === 'message') {
            const role = item.role === 'developer' ? 'system' : item.role;
            if (role === 'system') {
                appendInstruction(extractText(item.content));
                continue;
            }
            if (role === 'user') {
                input.push({ role: 'user', content: toResponsesUserContent(item.content) });
                continue;
            }
            if (role === 'assistant') {
                const text = extractText(item.content);
                if (text) {
                    input.push({ role: 'assistant', content: [{ type: 'output_text', text }] });
                }
                continue;
            }
            if (role === 'tool') {
                if (!seenFunctionCallIds.has(item.tool_call_id)) {
                    input.push({
                        role: 'user',
                        content: [{
                            type: 'input_text',
                            text: `Tool result for ${item.tool_call_id}:\n${extractText(item.content)}`,
                        }],
                    });
                    continue;
                }
                input.push({
                    type: 'function_call_output',
                    call_id: item.tool_call_id,
                    output: extractText(item.content),
                });
                continue;
            }
        }

        if (item.type === 'function_call' || item.type === 'tool_search_call') {
            const callId = item.call_id || item.id;
            if (callId) seenFunctionCallIds.add(callId);
            input.push({
                type: 'function_call',
                call_id: callId,
                name: item.type === 'tool_search_call' ? 'tool_search' : item.name,
                arguments: stringifyValue(item.arguments || {}),
            });
            continue;
        }

        if (item.type === 'function_call_output') {
            if (!seenFunctionCallIds.has(item.call_id)) {
                input.push({
                    role: 'user',
                    content: [{
                        type: 'input_text',
                        text: `Tool result for ${item.call_id}:\n${stringifyValue(item.output)}`,
                    }],
                });
                continue;
            }
            input.push({
                type: 'function_call_output',
                call_id: item.call_id,
                output: stringifyValue(item.output),
            });
            continue;
        }

        if (item.type === 'tool_search_output') {
            if (!seenFunctionCallIds.has(item.call_id || item.id)) {
                input.push({
                    role: 'user',
                    content: [{
                        type: 'input_text',
                        text: `Tool search result for ${item.call_id || item.id}:\n${stringifyValue(toToolSearchOutputPayload(item))}`,
                    }],
                });
                continue;
            }
            input.push({
                type: 'function_call_output',
                call_id: item.call_id || item.id,
                output: stringifyValue(toToolSearchOutputPayload(item)),
            });
            continue;
        }

        if (item.type === 'additional_tools' && Array.isArray(item.tools)) {
            appendInstruction(`Additional tools available:\n${stringifyValue(item.tools)}`);
        }
    }

    return { instructions, input };
}

/**
 * Deep-walk a JSON-Schema-ish object and fix common strict-mode violations
 * that the Codex/Responses backend rejects:
 *   - `type: "array"` without `items`  →  add `items: {}`
 *   - `type: "object"` with `properties` but no `additionalProperties`  →
 *     leave as-is (Responses accepts it; don't touch, may break tools)
 * The walker is defensive: it mutates a deep clone, never the original.
 */
function sanitizeJsonSchema(schema: any): any {
    if (schema == null || typeof schema !== 'object') return schema;
    if (Array.isArray(schema)) return schema.map(sanitizeJsonSchema);

    const out: any = {};
    for (const [k, v] of Object.entries(schema)) {
        out[k] = sanitizeJsonSchema(v);
    }

    // Fix: array without items → give it an open items schema.
    if (out.type === 'array' && out.items === undefined) {
        out.items = {};
    }

    // anyOf/oneOf/allOf: items rule also applies to each branch (already
    // recursed into above).

    return out;
}

function toResponsesTools(tools: any[] | undefined): any[] | undefined {
    if (!Array.isArray(tools) || tools.length === 0) return undefined;
    const mapped: any[] = [];
    for (const t of tools) {
        if (t?.type === 'function' && t.function) {
            mapped.push({
                type: 'function',
                name: t.function.name,
                description: t.function.description,
                parameters: sanitizeJsonSchema(t.function.parameters),
                strict: false,
            });
            continue;
        }

        if (t?.type === 'function' && t.name) {
            mapped.push({
                type: 'function',
                name: t.name,
                description: t.description,
                parameters: sanitizeJsonSchema(t.parameters ?? { type: 'object', properties: {} }),
                strict: false,
            });
            continue;
        }

        if (t?.type === 'namespace' && Array.isArray(t.tools)) {
            const nestedTools = toResponsesTools(t.tools);
            if (nestedTools) mapped.push(...nestedTools);
            continue;
        }

        if (t?.type === 'tool_search') {
            mapped.push({
                type: 'function',
                name: 'tool_search',
                description: t.description || 'Search for available tools and resources.',
                parameters: sanitizeJsonSchema(
                    t.parameters ?? {
                        type: 'object',
                        properties: {
                            query: { type: 'string' },
                            limit: { type: 'number' },
                        },
                        required: ['query'],
                    }
                ),
                strict: false,
            });
            continue;
        }

        if (t?.type === 'provider_tool' && t.definition?.type === 'function') {
            const fn = t.definition.function ?? t.definition;
            if (fn?.name) {
                mapped.push({
                    type: 'function',
                    name: fn.name,
                    description: fn.description,
                    parameters: sanitizeJsonSchema(fn.parameters ?? { type: 'object', properties: {} }),
                    strict: false,
                });
            }
        }
    }
    return mapped.length > 0 ? mapped : undefined;
}

/**
 * Normalize whatever the UI/agent passed as the model id into the literal
 * id the ChatGPT-account backend expects. The picker sometimes sends the
 * display name ("GPT-5.1 Codex Max") instead of the id.
 */
function normalizeModelId(raw: unknown): string {
    const s = String(raw ?? '').trim();
    if (!s) return 'gpt-5.1-codex-max';
    // Collapse whitespace to dashes, lowercase. "GPT-5.1 Codex Max" → "gpt-5.1-codex-max".
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
    return discoveredModelMetadata.get(modelId) ?? OPENAI_MODEL_METADATA[modelId] ?? {};
}

function getProviderManifest(models: ModelMetadata[]) {
    return {
        providerId: PROVIDER_ID,
        name: PROVIDER_NAME,
        description:
            'OpenAI Codex via your ChatGPT subscription. On first use a browser window opens for "Sign in with ChatGPT". No API key required.',
        capabilities: ['chat', 'tools', 'streaming'],
        requiresKey: false,
        configFields: [],
        models,
    };
}

function buildResponsesBody(options: any): any {
    const { instructions, input } = toResponsesInputFromOptions(options);
    const body: any = {
        model: normalizeModelId(options?.model),
        store: false,
        stream: true,
        instructions,
        input,
        text: { verbosity: 'medium' },
        include: ['reasoning.encrypted_content'],
        tool_choice: 'auto',
        parallel_tool_calls: true,
    };
    const tools = toResponsesTools(options?.tools);
    if (tools) body.tools = tools;
    if (options?.temperature !== undefined) body.temperature = options.temperature;
    if (options?.cache?.prompt_cache_key) {
        body.prompt_cache_key = options.cache.prompt_cache_key;
    }
    return body;
}

// =============================================================================
// Responses SSE  →  chat-completions chunks  (response translation)
// =============================================================================

/**
 * Runtime state while consuming the Codex SSE stream.
 *
 * Modeled on multillm/providers/zai/index.ts's streaming loop:
 *   1. Every chunk is pushed to `chunks[]` AND forwarded to the live onChunk.
 *   2. After the stream ends, `aggregateStreamChunks(chunks, model)` builds
 *      the final ChatCompletionResponse — same helper zai uses.
 *
 * The `id` / `created` / `model` / `roleSent` / `nextToolIndex` fields are
 * only used while translating Codex Responses events into chat-completion
 * chunks. The chunks themselves are the source of truth.
 */
interface Aggregator {
    id: string;
    created: number;
    model: string;
    /** Tracked so we know which tool_call belongs to which output_index */
    toolCalls: Map<
        number,
        { index: number; id: string; name: string; args: string }
    >;
    /** Emitted chat-completion chunks — consumed by aggregateStreamChunks at end */
    chunks: any[];
    /** Have we emitted the initial role: 'assistant' chunk yet? */
    roleSent: boolean;
    /** Fallback text captured from output_item.done when deltas were missing */
    fallbackText: string;
    usage?: any;
}

function newAggregator(model: string): Aggregator {
    return {
        id: '',
        created: 0,
        model,
        toolCalls: new Map(),
        chunks: [],
        roleSent: false,
        fallbackText: '',
        usage: undefined,
    };
}

/** Base StreamChunk scaffold — matches the shape multillm's openai provider
 *  constructs at packages/multillm/providers/openai/index.ts:271-298. */
function baseChunk(agg: Aggregator, delta: any, finishReason: any = null): any {
    return {
        id: agg.id || `codex-${Date.now()}`,
        object: 'chat.completion.chunk',
        created: agg.created || Math.floor(Date.now() / 1000),
        model: agg.model,
        choices: [
            {
                index: 0,
                delta,
                finish_reason: finishReason,
            },
        ],
    };
}

/** Emit, in order:
 *    1. A role chunk (`{role:'assistant'}`) the first time we see any output.
 *    2. A content chunk (`{content: delta}`) for each text delta, ONLY when delta is non-empty.
 */
function emitTextDelta(
    agg: Aggregator,
    delta: string,
    emit: (chunk: any) => void
): void {
    if (!agg.roleSent) {
        emit(baseChunk(agg, { role: 'assistant' }));
        agg.roleSent = true;
    }
    if (delta) emit(baseChunk(agg, { content: delta }));
}

function emitToolCallStart(
    agg: Aggregator,
    index: number,
    id: string,
    name: string,
    emit: (chunk: any) => void
): void {
    if (!agg.roleSent) {
        emit(baseChunk(agg, { role: 'assistant' }));
        agg.roleSent = true;
    }
    emit(
        baseChunk(agg, {
            tool_calls: [
                {
                    index,
                    id,
                    type: 'function',
                    function: { name, arguments: '' },
                },
            ],
        })
    );
}

function emitToolCallArgsDelta(
    agg: Aggregator,
    index: number,
    argsDelta: string,
    emit: (chunk: any) => void
): void {
    if (!argsDelta) return;
    emit(
        baseChunk(agg, {
            tool_calls: [
                {
                    index,
                    function: { arguments: argsDelta },
                },
            ],
        })
    );
}

/**
 * Aggregate an array of StreamChunks into text + tool_calls + usage, ported
 * verbatim from multillm/utils/sseParser.ts:aggregateStreamChunks so our
 * final response is built with the EXACT same logic zai and openai use.
 */
function aggregateStreamChunks(
    chunks: any[],
    model: string
): {
    id: string;
    content: string;
    toolCalls: any[];
    finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null;
    usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
} {
    let content = '';
    let toolCalls: any[] = [];
    let finishReason:
        | 'stop'
        | 'length'
        | 'tool_calls'
        | 'content_filter'
        | null = null;
    let usage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
    let id = `chatcmpl_${Date.now()}`;

    for (const chunk of chunks) {
        if (chunk.id) id = chunk.id;
        for (const choice of chunk.choices ?? []) {
            if (choice.delta?.content) {
                content += choice.delta.content;
            }
            if (choice.delta?.tool_calls) {
                for (const tc of choice.delta.tool_calls) {
                    if (!toolCalls[tc.index]) {
                        toolCalls[tc.index] = {
                            id: tc.id || `call_${Date.now()}_${tc.index}`,
                            type: 'function',
                            function: { name: '', arguments: '' },
                        };
                    }
                    if (tc.function?.name) {
                        toolCalls[tc.index].function.name += tc.function.name;
                    }
                    if (tc.function?.arguments) {
                        toolCalls[tc.index].function.arguments +=
                            tc.function.arguments;
                    }
                    if (tc.id) toolCalls[tc.index].id = tc.id;
                }
            }
            if (choice.finish_reason) {
                finishReason = choice.finish_reason;
            }
        }
        if (chunk.usage) usage = chunk.usage;
    }
    toolCalls = toolCalls.filter(Boolean);
    void model;
    return { id, content, toolCalls, finishReason, usage };
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

function normalizeResponsesUsage(usage: any): any {
    if (!usage || typeof usage !== 'object') {
        return usage;
    }

    const promptTokens = usage.input_tokens ?? usage.prompt_tokens ?? 0;
    const completionTokens = usage.output_tokens ?? usage.completion_tokens ?? 0;
    const cachedTokens = usage.input_tokens_details?.cached_tokens
        ?? usage.prompt_tokens_details?.cached_tokens
        ?? usage.cached_tokens;
    const reasoningTokens = usage.output_tokens_details?.reasoning_tokens
        ?? usage.completion_tokens_details?.reasoning_tokens
        ?? usage.reasoning_tokens;

    return {
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: usage.total_tokens ?? promptTokens + completionTokens,
        input_tokens: promptTokens,
        output_tokens: completionTokens,
        ...(cachedTokens !== undefined ? { cached_tokens: cachedTokens } : {}),
        ...(reasoningTokens !== undefined ? { reasoning_tokens: reasoningTokens } : {}),
        input_tokens_details: usage.input_tokens_details,
        output_tokens_details: usage.output_tokens_details,
        prompt_tokens_details: {
            ...(usage.prompt_tokens_details || {}),
            ...(cachedTokens !== undefined ? { cached_tokens: cachedTokens } : {}),
        },
        completion_tokens_details: {
            ...(usage.completion_tokens_details || {}),
            ...(reasoningTokens !== undefined ? { reasoning_tokens: reasoningTokens } : {}),
        },
        provider_usage: usage,
    };
}

/** Build the final ChatCompletionResponse in the EXACT shape zai uses
 *  (packages/multillm/providers/zai/index.ts:372-397). */
function makeFinalResponse(agg: Aggregator, modelName: string): any {
    const aggregated = aggregateStreamChunks(agg.chunks, modelName);
    const modelMetadata = getModelMetadata(modelName);

    // If deltas produced no text but we captured fallback text from
    // output_item.done, use that instead.
    const content = aggregated.content || agg.fallbackText || null;

    return normalizeFinalResponseForCodeBolt({
        id: aggregated.id,
        object: 'chat.completion',
        created: agg.created || Math.floor(Date.now() / 1000),
        model: modelName,
        tokenLimit: modelMetadata.tokenLimit,
        maxOutputTokens: modelMetadata.maxOutputTokens,
        choices: [
            {
                index: 0,
                message: {
                    role: 'assistant',
                    content,
                    tool_calls:
                        aggregated.toolCalls.length > 0
                            ? aggregated.toolCalls
                            : undefined,
                },
                finish_reason: aggregated.finishReason ?? 'stop',
            },
        ],
        usage: aggregated.usage,
    });
}

/**
 * Handle a single Responses API SSE event. Mutates `agg` and emits any
 * chat-completions chunks via `emit`.
 *
 * Only the events we actually need for text + basic tool calls are handled.
 * Reasoning deltas, image outputs, etc. are ignored.
 */
function handleResponsesEvent(
    ev: any,
    agg: Aggregator,
    emit: (chunk: any) => void
): void {
    const t: string = ev?.type || '';

    if (t === 'response.created' || t === 'response.in_progress') {
        if (ev.response?.id && !agg.id) agg.id = ev.response.id;
        if (ev.response?.created_at && !agg.created)
            agg.created = ev.response.created_at;
        if (ev.response?.model) agg.model = ev.response.model;
        return;
    }

    if (t === 'response.output_text.delta') {
        const delta: string = ev.delta ?? '';
        if (delta) emitTextDelta(agg, delta, emit);
        return;
    }

    if (t === 'response.output_item.added') {
        const item = ev.item;
        if (item?.type === 'function_call') {
            const index =
                typeof ev.output_index === 'number' ? ev.output_index : agg.toolCalls.size;
            const entry = {
                index,
                id: item.call_id || item.id || `call_${index}`,
                name: item.name || '',
                args: item.arguments || '',
            };
            agg.toolCalls.set(index, entry);
            emitToolCallStart(agg, index, entry.id, entry.name, emit);
            if (entry.args) emitToolCallArgsDelta(agg, index, entry.args, emit);
        }
        return;
    }

    if (
        t === 'response.function_call_arguments.delta' ||
        t === 'response.tool_call_arguments.delta'
    ) {
        const index = typeof ev.output_index === 'number' ? ev.output_index : 0;
        const entry = agg.toolCalls.get(index);
        if (entry) {
            const d: string = ev.delta ?? '';
            entry.args += d;
            emitToolCallArgsDelta(agg, index, d, emit);
        }
        return;
    }

    if (
        t === 'response.function_call_arguments.done' ||
        t === 'response.tool_call_arguments.done'
    ) {
        const index = typeof ev.output_index === 'number' ? ev.output_index : 0;
        const entry = agg.toolCalls.get(index);
        if (entry && typeof ev.arguments === 'string') {
            entry.args = ev.arguments;
        }
        return;
    }

    // Safety net: if streaming text deltas were empty or incomplete, capture
    // the full text from the finalized item. Stored in fallbackText and used
    // at the end if the chunk aggregator found no content.
    if (t === 'response.output_item.done') {
        const item = ev.item;
        if (item?.type === 'message' && Array.isArray(item.content)) {
            const fullText = item.content
                .map((c: any) => (c?.type === 'output_text' ? c.text : c?.refusal ?? ''))
                .join('');
            if (fullText) {
                agg.fallbackText = fullText;
                // Also emit a delta chunk so the UI streams it if this is the
                // first time we're seeing the text.
                emitTextDelta(agg, fullText, emit);
            }
        } else if (item?.type === 'function_call') {
            // Find the aggregator entry by call_id and snap to final arguments
            for (const entry of agg.toolCalls.values()) {
                if (entry.id === item.call_id || entry.id === item.id) {
                    if (typeof item.arguments === 'string') entry.args = item.arguments;
                    break;
                }
            }
        }
        return;
    }

    if (t === 'response.completed') {
        // Emit a terminal finish_reason chunk so the aggregator picks it up.
        let finishReason: 'stop' | 'length' | 'tool_calls' = 'stop';
        const status: string = ev.response?.status;
        if (status === 'incomplete') finishReason = 'length';
        else if (agg.toolCalls.size > 0) finishReason = 'tool_calls';

        if (ev.response?.usage) {
            agg.usage = normalizeResponsesUsage(ev.response.usage);
        }

        // Terminal chunk carrying finish_reason + usage.
        emit({
            id: agg.id || `codex-${Date.now()}`,
            object: 'chat.completion.chunk',
            created: agg.created || Math.floor(Date.now() / 1000),
            model: agg.model,
            choices: [{ index: 0, delta: {}, finish_reason: finishReason }],
            usage: agg.usage,
        });
        return;
    }

    if (t === 'response.failed' || t === 'error') {
        const msg = ev?.response?.error?.message || ev?.error?.message || 'Codex request failed';
        throw new Error(msg);
    }
}

// =============================================================================
// HTTP transport
// =============================================================================

function buildHeaders(accessToken: string, accountId: string): Record<string, string> {
    return {
        Authorization: `Bearer ${accessToken}`,
        'chatgpt-account-id': accountId,
        originator: ORIGINATOR,
        'OpenAI-Beta': 'responses=experimental',
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        'User-Agent': `codebolt-codex-plugin (${process.platform} ${process.arch})`,
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
            `[CodexPlugin] Saved credentials could not be refreshed for startup model discovery: ${error?.message || error}`
        );
        return null;
    }
}

async function fetchDynamicModelsWithCredentials(
    creds: OAuthCredentials
): Promise<Array<{ id: string; name: string }>> {
    const res = await fetch(OPENAI_MODELS_URL, {
        headers: {
            Authorization: `Bearer ${creds.access_token}`,
            'chatgpt-account-id': creds.account_id,
            originator: ORIGINATOR,
            Accept: 'application/json',
            'User-Agent': `codebolt-codex-plugin (${process.platform} ${process.arch})`,
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
                  const metadata = extractModelMetadata(model);
                  discoveredModelMetadata.set(id, metadata);
                  return {
                      id,
                      name: id,
                      ...metadata,
                  };
              })
              .filter(Boolean)
        : [];

    if (models.length === 0) {
        throw new Error('Model discovery returned no models');
    }

    models.sort((a: { id: string }, b: { id: string }) => a.id.localeCompare(b.id));
    return models;
}

async function registerProviderWithModels(): Promise<void> {
    let models: ModelMetadata[] = FALLBACK_MODELS;
    try {
        const savedCreds = await getSavedCredentialsForDiscovery();
        if (savedCreds) {
            models = await fetchDynamicModelsWithCredentials(savedCreds);
            console.log(`[CodexPlugin] Loaded ${models.length} dynamic models`);
        } else {
            console.log('[CodexPlugin] No saved ChatGPT auth; registering fallback models');
        }
    } catch (error: any) {
        console.warn(
            `[CodexPlugin] Dynamic model discovery failed, using fallback list: ${error?.message || error}`
        );
    }

    const result = await llmProvider.register(getProviderManifest(models));
    if (!result?.success) {
        throw new Error(result?.error || 'Provider registration failed');
    }
}

async function callCodex(
    options: any,
    onChunk: ((chunk: any) => void) | null,
    requestId: string
): Promise<any> {
    const log = openDebugLog(requestId);
    console.log(`[CodexPlugin] debug log: ${log.path}`);

    try {
        let creds = await getValidCredentials(notifyChat);
        const body = buildResponsesBody(options);
        log.write('REQUEST_BODY', body);
        logOutgoingLLMRequest(body);
        log.write('REQUEST_HEADERS', {
            ...buildHeaders(creds.access_token, creds.account_id),
            Authorization: 'Bearer <redacted>',
        });

        const doFetch = () =>
            fetch(CODEX_URL, {
                method: 'POST',
                headers: buildHeaders(creds.access_token, creds.account_id),
                body: JSON.stringify(body),
            });

        let res = await doFetch();

        if (res.status === 401) {
            console.warn('[CodexPlugin] 401 — clearing tokens and re-logging in');
            log.write('AUTH_401_RETRY');
            clearCredentials();
            creds = await getValidCredentials(notifyChat);
            res = await doFetch();
        }

        log.write('RESPONSE_STATUS', { status: res.status, ok: res.ok });

        if (!res.ok || !res.body) {
            const text = await res.text().catch(() => '');
            log.write('RESPONSE_ERROR_BODY', { text });
            throw new Error(`Codex backend error ${res.status}: ${text}`);
        }

        const agg = newAggregator(normalizeModelId(options?.model));
        const reader = (res.body as any).getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let eventCount = 0;
        let chunkCount = 0;

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
                if (!payload || payload === '[DONE]') {
                    if (payload === '[DONE]') log.write('SSE_DONE');
                    continue;
                }

                let ev: any;
                try {
                    ev = JSON.parse(payload);
                } catch (e) {
                    log.write('SSE_PARSE_ERROR', { line: payload, error: String(e) });
                    continue;
                }

                eventCount++;
                log.write(`SSE_EVENT[${eventCount}]`, ev);

                handleResponsesEvent(ev, agg, (chunk) => {
                    agg.chunks.push(chunk);
                    chunkCount++;
                    log.write(`EMIT_CHUNK[${chunkCount}]`, chunk);
                    if (onChunk) onChunk(chunk);
                });
            }
        }

        const modelName = normalizeModelId(options?.model);
        const finalResponse = makeFinalResponse(agg, modelName);
        finalResponse.rawLLMRequest = redactDebugData(body);
        log.write('FINAL_RESPONSE', finalResponse);

        const toolSummary =
            agg.toolCalls.size > 0
                ? ' [' +
                  Array.from(agg.toolCalls.values())
                      .map(
                          (tc) =>
                              `${tc.name}(${tc.args.slice(0, 40)}${tc.args.length > 40 ? '…' : ''})`
                      )
                      .join(', ') +
                  ']'
                : '';
        const finalText: string = finalResponse.choices?.[0]?.message?.content ?? '';
        const finish = finalResponse.choices?.[0]?.finish_reason;
        const summary = `events=${eventCount} chunks=${chunkCount} textLen=${finalText.length} toolCalls=${agg.toolCalls.size} finish=${finish}${toolSummary}`;
        log.write('SUMMARY', summary);
        console.log(`[CodexPlugin] stream done: ${summary}`);

        return finalResponse;
    } catch (err: any) {
        log.write('FATAL', { message: err?.message, stack: err?.stack });
        throw err;
    } finally {
        log.close();
    }
}

// =============================================================================
// Plugin lifecycle
// =============================================================================

plugin.onStart(async (ctx: any) => {
    console.log(`[CodexPlugin] Starting (pluginId: ${ctx.pluginId})`);

    if (!llmProvider) {
        console.error(
            '[CodexPlugin] llmProvider module missing from @codebolt/plugin-sdk. Rebuild the SDK and reinstall.'
        );
        return;
    }

    try {
        await registerProviderWithModels();
        console.log(`[CodexPlugin] Registered provider "${PROVIDER_ID}"`);
    } catch (error: any) {
        console.error('[CodexPlugin] Error registering provider:', error?.message || error);
        return;
    }

    llmProvider.onCompletionRequest(async (req: any) => {
        console.log(
            `[CodexPlugin] completionRequest ${req.requestId} model=${req.options?.model}`
        );
        try {
            const response = await callCodex(req.options, null, req.requestId);
            llmProvider.sendReply(req.requestId, response, true);
        } catch (error: any) {
            console.error('[CodexPlugin] completion error:', error?.message || error);
            llmProvider.sendError(req.requestId, error?.message || 'Unknown error');
        }
    });

    llmProvider.onLoginRequest(async (req: any) => {
        console.log(`[CodexPlugin] loginRequest ${req.requestId}`);
        try {
            const wantsAuthUrl = req.options?.returnAuthUrl === true;
            if (wantsAuthUrl && !loadCredentials()) {
                const flow = beginLoginFlow(console.log, notifyChat);
                flow.completion
                    .then(async () => {
                        await registerProviderWithModels();
                        console.log('[CodexPlugin] Login successful via UI URL');
                    })
                    .catch((error: any) => {
                        console.error('[CodexPlugin] login error:', error?.message || error);
                    });
                llmProvider.sendReply(
                    req.requestId,
                    {
                        authenticated: false,
                        pending: true,
                        authUrl: flow.authorizeUrl,
                        redirectUri: flow.redirectUri,
                    },
                    true
                );
                return;
            }

            const creds = await getValidCredentials(notifyChat);
            await registerProviderWithModels();
            console.log('[CodexPlugin] Login successful via UI trigger');
            llmProvider.sendReply(req.requestId, { authenticated: true, account_id: creds.account_id }, true);
        } catch (error: any) {
            console.error('[CodexPlugin] login error:', error?.message || error);
            llmProvider.sendError(req.requestId, error?.message || 'Login failed');
        }
    });

    llmProvider.onStreamRequest(async (req: any) => {
        console.log(
            `[CodexPlugin] streamRequest ${req.requestId} model=${req.options?.model}`
        );
        try {
            const finalResponse = await callCodex(
                req.options,
                (chunk) => {
                    llmProvider.sendChunk(req.requestId, chunk);
                },
                req.requestId
            );
            llmProvider.sendReply(req.requestId, finalResponse, true);
        } catch (error: any) {
            console.error('[CodexPlugin] stream error:', error?.message || error);
            llmProvider.sendError(req.requestId, error?.message || 'Unknown error');
        }
    });

    console.log('[CodexPlugin] Ready');
});

plugin.onStop(async () => {
    console.log('[CodexPlugin] Stopping...');
    try {
        if (llmProvider) {
            await llmProvider.unregister(PROVIDER_ID);
        }
    } catch (error: any) {
        console.warn('[CodexPlugin] Error unregistering provider:', error?.message || error);
    }
    console.log('[CodexPlugin] Stopped');
});
