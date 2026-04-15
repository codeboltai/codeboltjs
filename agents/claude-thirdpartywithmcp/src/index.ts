import * as fs from 'fs';
import * as path from 'path';
import codebolt from '@codebolt/codeboltjs';
import {
    ClaudeExecutor,
    ClaudeFormatter,
    ClaudeDispatcher,
    createMessageStream,
} from '@codebolt/thirdpartyagents';
import type { ClaudeExecutorOptions } from '@codebolt/thirdpartyagents';

// ============================================================================
// OPTION A: In-process MCP server (uses codeboltjs tools singleton directly)
//
// No extra dependency needed — tools are imported from the same codeboltjs
// process. Simpler, fewer moving parts.
//
// Uncomment this block and comment out Option B to use.
// ============================================================================

// import { startCodeboltMcpServer } from '@codebolt/codeboltjs/mcp-server';
//
// async function startMcpServer() {
//     const handle = await startCodeboltMcpServer({ transport: 'sse' });
//     console.log(`[mcp-agent] Option A: In-process MCP server at ${handle.url}`);
//     return handle;
// }

// ============================================================================
// OPTION B: Standalone @codebolt/mcp-server package
//
// Uses the separate @codebolt/mcp-server package. Accepts codebolt instance
// and tools module as parameters. Good for testing independently.
//
// This is the active option. Comment this block and uncomment Option A to switch.
// ============================================================================

import { startCodeboltMcpServer } from '@codebolt/mcp-server';

// NOTE: `import { tools } from '@codebolt/codeboltjs'` doesn't work because
// codeboltjs's index.js does `module.exports = codebolt` which replaces the
// entire exports object, wiping out the named `tools` re-export.
// We import the tools submodule directly via a webpack alias (see webpack.config.js).
// eslint-disable-next-line @typescript-eslint/no-var-requires
const toolsModule = require('@codebolt/codeboltjs/tools').default;

async function startMcpServer() {
    const handle = await startCodeboltMcpServer({
        codebolt: codebolt as any,
        tools: toolsModule,
        transport: 'sse',
    });
    console.log(`[mcp-agent] Option B: Standalone MCP server at ${handle.url}`);
    return handle;
}

// ============================================================================
// Custom executor: injects --mcp-config into Claude Code CLI args
// ============================================================================

class ClaudeWithMcpExecutor extends ClaudeExecutor {
    private mcpConfigPath: string;

    constructor(options: ClaudeExecutorOptions, mcpConfigPath: string) {
        super(options);
        this.mcpConfigPath = mcpConfigPath;
    }

    protected override buildArgs(prompt: string): string[] {
        // Get the standard args from parent:
        //   ['--print', '--output-format', 'stream-json', '--verbose', ...flags, prompt]
        const args = super.buildArgs(prompt);

        // Insert --mcp-config BEFORE the prompt (always last arg)
        const promptArg = args.pop()!;
        args.push('--mcp-config', this.mcpConfigPath);
        // Pass prompt via -p flag to avoid positional arg ambiguity
        args.push('-p', promptArg);

        console.log('[mcp-agent] Claude args:', JSON.stringify(args));
        return args;
    }
}

// ============================================================================
// Write a temporary MCP config file that tells Claude Code about the SSE server
// ============================================================================

function writeMcpConfig(sseUrl: string, cwd: string): string {
    const config = {
        mcpServers: {
            codebolt: {
                type: 'sse',
                url: sseUrl,
            },
        },
    };

    // Use os.tmpdir() for reliable write access, project dir may not be writable
    const os = require('os');
    const configDir = path.join(os.tmpdir(), 'codebolt-mcp');
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
    }

    const configPath = path.join(configDir, `mcp-config-${process.pid}.json`);
    const content = JSON.stringify(config, null, 2);
    fs.writeFileSync(configPath, content, 'utf-8');

    // Verify the file was actually written
    if (fs.existsSync(configPath)) {
        console.log(`[mcp-agent] MCP config written to ${configPath}`);
        console.log(`[mcp-agent] MCP config content: ${content}`);
    } else {
        console.error(`[mcp-agent] ERROR: MCP config file was NOT written to ${configPath}`);
    }

    return configPath;
}

// ============================================================================
// Agent state
// ============================================================================

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

/**
 * Create a Claude Code agent handle with MCP config injected.
 * Uses the lower-level ThirdPartyAgents classes directly so we can
 * swap in our custom executor.
 */
function createAgentHandle(
    prompt: string,
    options: ClaudeExecutorOptions,
    configPath: string,
): AgentHandle {
    const executor = new ClaudeWithMcpExecutor(options, configPath);
    const formatter = new ClaudeFormatter();
    const dispatcher = new ClaudeDispatcher();

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

// ============================================================================
// Message handler
// ============================================================================

console.log('[mcp-agent] Agent initializing...');

codebolt.onMessage(async (userMessage: any) => {
    try {
        // Extract message content
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
            console.log('[mcp-agent] Empty message, skipping');
            return;
        }

        const trimmed = messageContent.trim();
        console.log(`[mcp-agent] Message: "${trimmed.substring(0, 100)}"`);

        // If an agent is already running, send input to its stdin
        if (currentHandle && currentHandle.state === 'running') {
            console.log('[mcp-agent] Agent running — sending to stdin');
            currentHandle.sendInput(trimmed);
            return;
        }

        const { projectPath } = await codebolt.project.getProjectPath();
        const cwd = projectPath || process.cwd();

        // ── Start MCP server once, reuse across messages ──
        if (!mcpHandle) {
            console.log('[mcp-agent] Starting MCP server...');
            mcpHandle = await startMcpServer();
            mcpConfigPath = writeMcpConfig(mcpHandle.url, cwd);
        }

        // Parse permission mode from /plan or /execute prefix
        let prompt = trimmed;
        let permissionMode: 'plan' | 'bypassPermissions' = 'bypassPermissions';
        if (trimmed.startsWith('/plan ')) {
            permissionMode = 'plan';
            prompt = trimmed.slice(6).trim();
        } else if (trimmed.startsWith('/execute ')) {
            prompt = trimmed.slice(9).trim();
        }

        // Create and run the agent with MCP config injected
        currentHandle = createAgentHandle(prompt, {
            cwd,
            permissionMode,
        }, mcpConfigPath!);

        for await (const msg of currentHandle.execute()) {
            // ThirdPartyAgents library already dispatched to codebolt.notify.*
            // We log here for observability
            if (msg.type === 'tool_use') {
                console.log(`[mcp-agent] Tool: ${msg.toolName}`);
            } else if (msg.type === 'result') {
                console.log(`[mcp-agent] Done. Cost: $${msg.usage?.costUsd?.toFixed(4) ?? '?'}`);
            }
        }

        currentHandle = null;
    } catch (error) {
        currentHandle = null;
        console.error(`[mcp-agent] Error: ${error}`);
        codebolt.notify.chat.AgentTextResponseNotify(
            `Error: ${error instanceof Error ? error.message : String(error)}`,
            true,
        );
        codebolt.notify.system.AgentCompletionNotify(
            `Error: ${error instanceof Error ? error.message : String(error)}`,
        );
    }
});

// ── Cleanup on exit ──

function cleanup() {
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

process.on('SIGTERM', () => {
    console.log('[mcp-agent] SIGTERM received, cleaning up...');
    cleanup();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('[mcp-agent] SIGINT received, cleaning up...');
    cleanup();
    process.exit(0);
});

console.log('[mcp-agent] Agent ready. Listening for messages.');
