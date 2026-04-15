import { execFile } from 'child_process';
import { promisify } from 'util';
import codebolt from '@codebolt/codeboltjs';
import {
    CodexExecutor,
    CodexFormatter,
    CodexDispatcher,
    createMessageStream,
} from '@codebolt/thirdpartyagents';
import type { CodexExecutorOptions } from '@codebolt/thirdpartyagents';

import { startCodeboltMcpServer } from '@codebolt/mcp-server';

const toolsModule = require('@codebolt/codeboltjs/tools').default;
const execFileAsync = promisify(execFile);

const MCP_SERVER_NAME = 'codebolt';

async function startMcpServer() {
    const handle = await startCodeboltMcpServer({
        codebolt: codebolt as any,
        tools: toolsModule,
        transport: 'sse',
    });
    console.log(`[codex-mcp-agent] MCP server at ${handle.url}`);
    return handle;
}

async function registerMcpServer(sseUrl: string): Promise<void> {
    try {
        const { stdout, stderr } = await execFileAsync('codex', [
            'mcp', 'add', MCP_SERVER_NAME, '--url', sseUrl,
        ]);
        if (stdout) console.log(`[codex-mcp-agent] MCP register stdout: ${stdout.trim()}`);
        if (stderr) console.log(`[codex-mcp-agent] MCP register stderr: ${stderr.trim()}`);
        console.log(`[codex-mcp-agent] MCP server "${MCP_SERVER_NAME}" registered with URL: ${sseUrl}`);
    } catch (error) {
        console.error(`[codex-mcp-agent] Failed to register MCP server: ${error}`);
        throw error;
    }
}

async function unregisterMcpServer(): Promise<void> {
    try {
        await execFileAsync('codex', ['mcp', 'remove', MCP_SERVER_NAME]);
        console.log(`[codex-mcp-agent] MCP server "${MCP_SERVER_NAME}" removed`);
    } catch {
        // Ignore errors on cleanup
    }
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
let currentHandle: AgentHandle | null = null;
let steeringPollTimer: ReturnType<typeof setInterval> | null = null;

const SESSION_KEY = 'codex_session_id';

async function getSavedSessionId(): Promise<string | null> {
    try {
        const response = await (codebolt as any).cbstate.getAgentState();
        const data = response?.payload || response;
        if (data && typeof data === 'object' && data[SESSION_KEY]) {
            console.log(`[codex-mcp-agent] Resuming session: ${data[SESSION_KEY]}`);
            return data[SESSION_KEY];
        }
    } catch (err) {
        console.log('[codex-mcp-agent] No saved session found');
    }
    return null;
}

async function saveSessionId(sessionId: string): Promise<void> {
    try {
        await (codebolt as any).cbstate.addToAgentState(SESSION_KEY, sessionId);
        console.log(`[codex-mcp-agent] Session saved: ${sessionId}`);
    } catch (err) {
        console.error('[codex-mcp-agent] Failed to save session:', err);
    }
}

function createAgentHandle(
    prompt: string,
    options: CodexExecutorOptions,
    sessionId?: string | null,
): AgentHandle {
    const executor = new CodexExecutor(
        { ...options, sessionId: sessionId || undefined },
    );
    const formatter = new CodexFormatter();
    const dispatcher = new CodexDispatcher();

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
                    console.log(`[codex-mcp-agent] Steering: "${payload.instruction.substring(0, 100)}"`);
                    currentHandle.sendInput(payload.instruction);
                }
            } catch (err) {
                console.error('[codex-mcp-agent] Steering error:', err);
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

console.log('[codex-mcp-agent] Agent initializing...');

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
            console.log('[codex-mcp-agent] Empty message, skipping');
            return;
        }

        const trimmed = messageContent.trim();
        console.log(`[codex-mcp-agent] Message: "${trimmed.substring(0, 100)}"`);

        if (currentHandle && currentHandle.state === 'running') {
            console.log('[codex-mcp-agent] Agent running — sending to stdin');
            currentHandle.sendInput(trimmed);
            return;
        }

        const { projectPath } = await codebolt.project.getProjectPath();
        const cwd = projectPath || process.cwd();

        if (!mcpHandle) {
            console.log('[codex-mcp-agent] Starting MCP server...');
            mcpHandle = await startMcpServer();
            await registerMcpServer(mcpHandle.url);
        }

        const savedSession = await getSavedSessionId();

        currentHandle = createAgentHandle(trimmed, {
            cwd,
        }, savedSession);

        startSteeringPoll();

        for await (const msg of currentHandle.execute()) {
            if (msg.type === 'tool_use') {
                console.log(`[codex-mcp-agent] Tool: ${msg.toolName}`);
            } else if (msg.type === 'result') {
                console.log(`[codex-mcp-agent] Done. Cost: $${msg.usage?.costUsd?.toFixed(4) ?? '?'}`);
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
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[codex-mcp-agent] Error: ${error}`);

        // Suppress generic "Process exited with code N" errors — the actual error
        // message (e.g. rate limit) was already dispatched via the message stream.
        // Only surface genuinely unexpected errors to the user.
        if (!/^Process exited with code \d+$/.test(errorMessage)) {
            codebolt.notify.chat.AgentTextResponseNotify(
                `Error: ${errorMessage}`,
                true,
            );
            codebolt.notify.system.AgentCompletionNotify(
                `Error: ${errorMessage}`,
            );
        } else {
            // Process failed but the real error was already shown — just complete.
            codebolt.notify.system.AgentCompletionNotify('');
        }
        currentHandle = null;
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
    unregisterMcpServer().catch(() => { /* ignore */ });
}

process.on('SIGTERM', () => { console.log('[codex-mcp-agent] SIGTERM'); cleanup(); process.exit(0); });
process.on('SIGINT', () => { console.log('[codex-mcp-agent] SIGINT'); cleanup(); process.exit(0); });

console.log('[codex-mcp-agent] Agent ready. Listening for messages.');
