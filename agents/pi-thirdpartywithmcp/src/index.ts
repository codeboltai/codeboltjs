import * as fs from 'fs';
import * as path from 'path';
import codebolt from '@codebolt/codeboltjs';
import {
    PiExecutor,
    PiFormatter,
    PiDispatcher,
    createMessageStream,
} from '@codebolt/thirdpartyagents';
import type { PiExecutorOptions } from '@codebolt/thirdpartyagents';

import { startCodeboltMcpServer } from '@codebolt/mcp-server';

const toolsModule = require('@codebolt/codeboltjs/tools').default;

async function startMcpServer() {
    const handle = await startCodeboltMcpServer({
        codebolt: codebolt as any,
        tools: toolsModule,
        transport: 'sse',
    });
    console.log(`[pi-mcp-agent] MCP server at ${handle.url}`);
    return handle;
}

class PiWithMcpExecutor extends PiExecutor {
    private mcpConfigPath: string;

    constructor(options: PiExecutorOptions, mcpConfigPath: string) {
        super(options);
        this.mcpConfigPath = mcpConfigPath;
    }

    protected override buildArgs(prompt: string): string[] {
        const args = super.buildArgs(prompt);
        // Pi args end with prompt. Insert --mcp-config before it.
        const promptArg = args.pop()!;
        args.push('--mcp-config', this.mcpConfigPath);
        args.push(promptArg);
        console.log('[pi-mcp-agent] Pi args:', JSON.stringify(args));
        return args;
    }
}

function writeMcpConfig(sseUrl: string): string {
    const config = {
        mcpServers: {
            codebolt: {
                type: 'sse',
                url: sseUrl,
            },
        },
    };
    const os = require('os');
    const configDir = path.join(os.tmpdir(), 'codebolt-mcp');
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
    }
    const configPath = path.join(configDir, `mcp-config-pi-${process.pid}.json`);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    console.log(`[pi-mcp-agent] MCP config written to ${configPath}`);
    return configPath;
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
let mcpConfigPath: string | null = null;
let currentHandle: AgentHandle | null = null;
let steeringPollTimer: ReturnType<typeof setInterval> | null = null;

const SESSION_KEY = 'pi_session_id';

async function getSavedSessionId(): Promise<string | null> {
    try {
        const response = await (codebolt as any).cbstate.getAgentState();
        const data = response?.payload || response;
        if (data && typeof data === 'object' && data[SESSION_KEY]) {
            console.log(`[pi-mcp-agent] Resuming session: ${data[SESSION_KEY]}`);
            return data[SESSION_KEY];
        }
    } catch (err) {
        console.log('[pi-mcp-agent] No saved session found');
    }
    return null;
}

async function saveSessionId(sessionId: string): Promise<void> {
    try {
        await (codebolt as any).cbstate.addToAgentState(SESSION_KEY, sessionId);
        console.log(`[pi-mcp-agent] Session saved: ${sessionId}`);
    } catch (err) {
        console.error('[pi-mcp-agent] Failed to save session:', err);
    }
}

function createAgentHandle(
    prompt: string,
    options: PiExecutorOptions,
    configPath: string,
    sessionId?: string | null,
): AgentHandle {
    const executor = new PiWithMcpExecutor(
        { ...options, sessionId: sessionId || undefined },
        configPath,
    );
    const formatter = new PiFormatter();
    const dispatcher = new PiDispatcher();

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
                    console.log(`[pi-mcp-agent] Steering: "${payload.instruction.substring(0, 100)}"`);
                    currentHandle.sendInput(payload.instruction);
                }
            } catch (err) {
                console.error('[pi-mcp-agent] Steering error:', err);
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

console.log('[pi-mcp-agent] Agent initializing...');

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
            console.log('[pi-mcp-agent] Empty message, skipping');
            return;
        }

        const trimmed = messageContent.trim();
        console.log(`[pi-mcp-agent] Message: "${trimmed.substring(0, 100)}"`);

        if (currentHandle && currentHandle.state === 'running') {
            console.log('[pi-mcp-agent] Agent running — sending to stdin');
            currentHandle.sendInput(trimmed);
            return;
        }

        const { projectPath } = await codebolt.project.getProjectPath();
        const cwd = projectPath || process.cwd();

        if (!mcpHandle) {
            console.log('[pi-mcp-agent] Starting MCP server...');
            mcpHandle = await startMcpServer();
            mcpConfigPath = writeMcpConfig(mcpHandle.url);
        }

        const savedSession = await getSavedSessionId();

        currentHandle = createAgentHandle(trimmed, {
            cwd,
        }, mcpConfigPath!, savedSession);

        startSteeringPoll();

        for await (const msg of currentHandle.execute()) {
            if (msg.type === 'tool_use') {
                console.log(`[pi-mcp-agent] Tool: ${msg.toolName}`);
            } else if (msg.type === 'result') {
                console.log(`[pi-mcp-agent] Done. Cost: $${msg.usage?.costUsd?.toFixed(4) ?? '?'}`);
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
        console.error(`[pi-mcp-agent] Error: ${error}`);
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
    if (mcpConfigPath && fs.existsSync(mcpConfigPath)) {
        try { fs.unlinkSync(mcpConfigPath); } catch { /* ignore */ }
    }
}

process.on('SIGTERM', () => { console.log('[pi-mcp-agent] SIGTERM'); cleanup(); process.exit(0); });
process.on('SIGINT', () => { console.log('[pi-mcp-agent] SIGINT'); cleanup(); process.exit(0); });

console.log('[pi-mcp-agent] Agent ready. Listening for messages.');
