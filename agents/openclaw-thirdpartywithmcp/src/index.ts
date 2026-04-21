import * as fs from 'fs';
import * as path from 'path';
import codebolt from '@codebolt/codeboltjs';
import {
    OpenClawExecutor,
    OpenClawFormatter,
    OpenClawDispatcher,
    createMessageStream,
} from '@codebolt/thirdpartyagents';
import type { OpenClawExecutorOptions } from '@codebolt/thirdpartyagents';

import { startCodeboltMcpServer } from '@codebolt/mcp-server';

const toolsModule = require('@codebolt/codeboltjs/tools').default;

async function startMcpServer() {
    const handle = await startCodeboltMcpServer({
        codebolt: codebolt as any,
        tools: toolsModule,
        transport: 'sse',
    });
    console.log(`[openclaw-mcp-agent] MCP server at ${handle.url}`);
    return handle;
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

function createAgentHandle(
    prompt: string,
    options: OpenClawExecutorOptions,
): AgentHandle {
    const executor = new OpenClawExecutor(options);
    const formatter = new OpenClawFormatter();
    const dispatcher = new OpenClawDispatcher();

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

console.log('[openclaw-mcp-agent] Agent initializing...');

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
            console.log('[openclaw-mcp-agent] Empty message, skipping');
            return;
        }

        const trimmed = messageContent.trim();
        console.log(`[openclaw-mcp-agent] Message: "${trimmed.substring(0, 100)}"`);

        if (currentHandle && currentHandle.state === 'running') {
            console.log('[openclaw-mcp-agent] Agent running — cannot send input to WebSocket executor');
            return;
        }

        // OpenClaw requires a gateway URL
        const gatewayUrl = process.env['OPENCLAW_GATEWAY_URL'] || process.env['OPENCLAW_URL'] || '';
        if (!gatewayUrl) {
            codebolt.notify.chat.AgentTextResponseNotify(
                'Error: OPENCLAW_GATEWAY_URL environment variable is required',
                true,
            );
            codebolt.notify.system.AgentCompletionNotify('Missing OPENCLAW_GATEWAY_URL');
            return;
        }

        // Start MCP server once
        if (!mcpHandle) {
            console.log('[openclaw-mcp-agent] Starting MCP server...');
            mcpHandle = await startMcpServer();
        }

        // Pass MCP server URL to OpenClaw via payloadTemplate
        currentHandle = createAgentHandle(trimmed, {
            url: gatewayUrl,
            authToken: process.env['OPENCLAW_AUTH_TOKEN'] || process.env['OPENCLAW_TOKEN'],
            sharedPassword: process.env['OPENCLAW_PASSWORD'],
            payloadTemplate: {
                mcpServers: {
                    codebolt: {
                        type: 'sse',
                        url: mcpHandle.url,
                    },
                },
            },
        });

        for await (const msg of currentHandle.execute()) {
            if (msg.type === 'tool_use') {
                console.log(`[openclaw-mcp-agent] Tool: ${msg.toolName}`);
            } else if (msg.type === 'result') {
                console.log(`[openclaw-mcp-agent] Done. Cost: $${msg.usage?.costUsd?.toFixed(4) ?? '?'}`);
            }
        }

        currentHandle = null;
    } catch (error) {
        currentHandle = null;
        console.error(`[openclaw-mcp-agent] Error: ${error}`);
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
    if (currentHandle) {
        try { currentHandle.stop(); } catch { /* ignore */ }
    }
    if (mcpHandle) {
        mcpHandle.close().catch(() => { /* ignore */ });
    }
}

process.on('SIGTERM', () => { console.log('[openclaw-mcp-agent] SIGTERM'); cleanup(); process.exit(0); });
process.on('SIGINT', () => { console.log('[openclaw-mcp-agent] SIGINT'); cleanup(); process.exit(0); });

console.log('[openclaw-mcp-agent] Agent ready. Listening for messages.');
