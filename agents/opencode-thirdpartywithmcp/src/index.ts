import codebolt from '@codebolt/codeboltjs';
import {
    OpenCodeExecutor,
    OpenCodeFormatter,
    OpenCodeDispatcher,
    createMessageStream,
} from '@codebolt/thirdpartyagents';
import type { OpenCodeExecutorOptions } from '@codebolt/thirdpartyagents';

import { startCodeboltMcpServer } from '@codebolt/mcp-server';

const toolsModule = require('@codebolt/codeboltjs/tools').default;

async function startMcpServer() {
    const handle = await startCodeboltMcpServer({
        codebolt: codebolt as any,
        tools: toolsModule,
        transport: 'sse',
    });
    console.log(`[opencode-mcp-agent] MCP server at ${handle.url}`);
    return handle;
}

class OpenCodeWithMcpExecutor extends OpenCodeExecutor {
    constructor(options: OpenCodeExecutorOptions, mcpConfigContent: string) {
        super({
            ...options,
            env: {
                ...options.env,
                OPENCODE_CONFIG_CONTENT: mergeOpenCodeConfigContent(
                    options.env?.OPENCODE_CONFIG_CONTENT || process.env.OPENCODE_CONFIG_CONTENT,
                    mcpConfigContent,
                ),
            },
        });
    }

    protected override buildArgs(prompt: string): string[] {
        const args = super.buildArgs(prompt);
        // OpenCode does not support --mcp-config. Inject MCP via OPENCODE_CONFIG_CONTENT.
        console.log('[opencode-mcp-agent] OpenCode args:', JSON.stringify(args));
        return args;
    }
}

function buildMcpConfigContent(sseUrl: string): string {
    return JSON.stringify({
        mcp: {
            codebolt: {
                type: 'remote',
                url: sseUrl,
                enabled: true,
            },
        },
    });
}

function mergeOpenCodeConfigContent(existingContent: string | undefined, mcpConfigContent: string): string {
    if (!existingContent) {
        return mcpConfigContent;
    }

    try {
        const existingConfig = JSON.parse(existingContent);
        const injectedConfig = JSON.parse(mcpConfigContent);
        return JSON.stringify(deepMergeConfig(existingConfig, injectedConfig));
    } catch (error) {
        console.warn('[opencode-mcp-agent] Failed to merge existing OPENCODE_CONFIG_CONTENT, replacing it');
        return mcpConfigContent;
    }
}

function deepMergeConfig(base: unknown, injected: unknown): unknown {
    if (!isPlainObject(base) || !isPlainObject(injected)) {
        return injected;
    }

    const merged: Record<string, unknown> = { ...base };
    for (const [key, value] of Object.entries(injected)) {
        merged[key] = key in merged
            ? deepMergeConfig(merged[key], value)
            : value;
    }
    return merged;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

type McpHandle = Awaited<ReturnType<typeof startMcpServer>>;
type AgentHandle = {
    execute: () => AsyncIterable<any>;
    stop: () => void;
    sendInput: (text: string) => void;
    readonly state: string;
    readonly sessionId: string | null;
};

let mcpHandle: McpHandle | null = null;
let mcpConfigContent: string | null = null;
let currentHandle: AgentHandle | null = null;
let steeringPollTimer: ReturnType<typeof setInterval> | null = null;

const SESSION_KEY = 'opencode_session_id';

async function getSavedSessionId(): Promise<string | null> {
    try {
        const response = await (codebolt as any).cbstate.getAgentState();
        const data = response?.payload || response;
        if (data && typeof data === 'object' && data[SESSION_KEY]) {
            console.log(`[opencode-mcp-agent] Resuming session: ${data[SESSION_KEY]}`);
            return data[SESSION_KEY];
        }
    } catch (err) {
        console.log('[opencode-mcp-agent] No saved session found');
    }
    return null;
}

async function saveSessionId(sessionId: string): Promise<void> {
    try {
        await (codebolt as any).cbstate.addToAgentState(SESSION_KEY, sessionId);
        console.log(`[opencode-mcp-agent] Session saved: ${sessionId}`);
    } catch (err) {
        console.error('[opencode-mcp-agent] Failed to save session:', err);
    }
}

function createAgentHandle(
    prompt: string,
    options: OpenCodeExecutorOptions,
    configContent: string,
    sessionId?: string | null,
): AgentHandle {
    const executor = new OpenCodeWithMcpExecutor(
        { ...options, sessionId: sessionId || undefined },
        configContent,
    );
    const formatter = new OpenCodeFormatter();
    const dispatcher = new OpenCodeDispatcher();

    const stream = createMessageStream(
        executor,
        formatter,
        dispatcher,
        codebolt as any,
        prompt,
    );

    return {
        execute: () => stream,
        stop: () => executor.stop(),
        sendInput: (text: string) => executor.sendInput(text),
        get state() { return executor.state; },
        get sessionId() { return executor.sessionId; },
    };
}

const eventQueue = (codebolt as any).agentEventQueue;

function startSteeringPoll() {
    if (steeringPollTimer) return;
    steeringPollTimer = setInterval(() => {
        if (!currentHandle || currentHandle.state !== 'running') return;
        if (!eventQueue || typeof eventQueue.getPendingExternalEvents !== 'function') return;
        const pendingEvents = eventQueue.getPendingExternalEvents();
        for (const event of pendingEvents) {
            try {
                const payload = event?.payload || event?.data?.payload || event;
                if (payload?.type === 'steering' && payload?.instruction) {
                    console.log(`[opencode-mcp-agent] Steering: "${payload.instruction.substring(0, 100)}"`);
                    currentHandle.sendInput(payload.instruction);
                }
            } catch (err) {
                console.error('[opencode-mcp-agent] Steering error:', err);
            }
        }
    }, 500);
}

function stopSteeringPoll() {
    if (steeringPollTimer) {
        clearInterval(steeringPollTimer);
        steeringPollTimer = null;
    }
}

console.log('[opencode-mcp-agent] Agent initializing...');

codebolt.onMessage(async (userMessage: any) => {
    try {
        let messageContent = '';
        if (typeof userMessage === 'string') {
            messageContent = userMessage;
        } else if (userMessage && typeof userMessage === 'object') {
            messageContent = userMessage.userMessage
                || userMessage.content
                || userMessage.message
                || userMessage.text
                || '';
        }

        if (!messageContent.trim()) {
            console.log('[opencode-mcp-agent] Empty message, skipping');
            return;
        }

        const trimmed = messageContent.trim();
        console.log(`[opencode-mcp-agent] Message: "${trimmed.substring(0, 100)}"`);

        if (currentHandle && currentHandle.state === 'running') {
            console.log('[opencode-mcp-agent] Agent running — sending to stdin');
            currentHandle.sendInput(trimmed);
            return;
        }

        const { projectPath } = await codebolt.project.getProjectPath();
        const cwd = projectPath || process.cwd();

        if (!mcpHandle) {
            console.log('[opencode-mcp-agent] Starting MCP server...');
            mcpHandle = await startMcpServer();
            mcpConfigContent = buildMcpConfigContent(mcpHandle.url);
            console.log('[opencode-mcp-agent] MCP config injected via OPENCODE_CONFIG_CONTENT');
        }

        const savedSession = await getSavedSessionId();

        currentHandle = createAgentHandle(trimmed, {
            cwd,
        }, mcpConfigContent!, savedSession);

        startSteeringPoll();

        for await (const msg of currentHandle.execute()) {
            if (msg.type === 'tool_use') {
                console.log(`[opencode-mcp-agent] Tool: ${msg.toolName}`);
            } else if (msg.type === 'result') {
                console.log(`[opencode-mcp-agent] Done. Cost: $${msg.usage?.costUsd?.toFixed(4) ?? '?'}`);
            }
        }

        stopSteeringPoll();
        if (currentHandle?.sessionId) {
            await saveSessionId(currentHandle.sessionId);
        }
        currentHandle = null;
    } catch (error) {
        stopSteeringPoll();
        if (currentHandle?.sessionId) {
            await saveSessionId(currentHandle.sessionId).catch(() => {});
        }
        currentHandle = null;
        console.error(`[opencode-mcp-agent] Error: ${error}`);
        codebolt.notify.chat.AgentTextResponseNotify(
            `Error: ${error instanceof Error ? error.message : String(error)}`,
            true,
        );
        codebolt.notify.system.AgentCompletionNotify(
            `Error: ${error instanceof Error ? error.message : String(error)}`,
        );
    }
});

function cleanup() {
    stopSteeringPoll();
    if (currentHandle) {
        try { currentHandle.stop(); } catch { /* ignore */ }
    }
    if (mcpHandle) {
        mcpHandle.close().catch(() => { /* ignore */ });
    }
}

process.on('SIGTERM', () => { console.log('[opencode-mcp-agent] SIGTERM'); cleanup(); process.exit(0); });
process.on('SIGINT', () => { console.log('[opencode-mcp-agent] SIGINT'); cleanup(); process.exit(0); });

console.log('[opencode-mcp-agent] Agent ready. Listening for messages.');
