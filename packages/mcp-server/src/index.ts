import http from "http";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    createCodeboltMcpServer,
    type CreateServerOptions,
    type CodeboltToolsModule,
} from "./server.js";

// ── Public types ──

export type {
    CodeboltToolsModule,
    CodeboltDeclarativeTool,
    CodeboltToolResult,
    CreateServerOptions,
} from "./server.js";

export interface CodeboltMcpServerOptions {
    /**
     * The codebolt instance (must already be connected via WebSocket).
     * Used to access codebolt.tools (the tools module) if `tools` is not
     * provided explicitly.
     */
    codebolt?: { tools?: CodeboltToolsModule; [key: string]: unknown };

    /**
     * Explicit tools module. Takes precedence over codebolt.tools.
     * Pass `import tools from '@codebolt/codeboltjs/tools'` or the
     * `tools` property from the codebolt singleton.
     */
    tools?: CodeboltToolsModule;

    /** Transport type. Default: "sse" */
    transport?: "sse" | "stdio";

    /** Port for SSE transport. 0 = random available port. Default: 0 */
    port?: number;

    /** Hostname for SSE transport. Default: "127.0.0.1" */
    hostname?: string;

    /** MCP server name shown to clients. Default: "codebolt" */
    serverName?: string;

    /** Subset of tool names to expose. Default: all tools. */
    toolFilter?: string[];

    /** Prefix for MCP tool names. Default: "codebolt". Set "" for no prefix. */
    toolPrefix?: string;
}

export interface CodeboltMcpServerHandle {
    /** Port the SSE server is listening on (0 for stdio) */
    port: number;
    /** Full SSE endpoint URL, e.g. "http://127.0.0.1:54321/sse" (empty for stdio) */
    url: string;
    /** The underlying MCP Server instance */
    server: Server;
    /** Gracefully shut down the MCP server and HTTP server */
    close(): Promise<void>;
}

/**
 * Resolve the tools module from the options.
 * Priority: explicit `tools` > `codebolt.tools` > require('@codebolt/codeboltjs').tools
 */
function resolveToolsModule(options: CodeboltMcpServerOptions): CodeboltToolsModule {
    if (options.tools) {
        return options.tools;
    }

    // Try codebolt instance's tools property
    const cb = options.codebolt as any;
    if (cb?.tools && typeof cb.tools.getToolNames === "function") {
        return cb.tools;
    }

    // Last resort: try to require codeboltjs (works when in same process)
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const codeboltjs = require("@codebolt/codeboltjs");
        const toolsMod = codeboltjs.tools || codeboltjs.default?.tools;
        if (toolsMod && typeof toolsMod.getToolNames === "function") {
            return toolsMod;
        }
    } catch {
        // not available
    }

    throw new Error(
        "[codebolt-mcp] Cannot resolve tools module. " +
        "Pass `tools` explicitly or ensure @codebolt/codeboltjs is available.",
    );
}

// ── SSE transport ──

async function startSSE(
    mcpServer: Server,
    options: CodeboltMcpServerOptions,
): Promise<CodeboltMcpServerHandle> {
    const port = options.port ?? 0;
    const hostname = options.hostname ?? "127.0.0.1";

    // Track transports by session ID so multiple connections can coexist,
    // though in practice there will be one (Claude Code).
    const transports = new Map<string, SSEServerTransport>();

    const httpServer = http.createServer(async (req, res) => {
        const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

        if (req.method === "GET" && url.pathname === "/sse") {
            console.log("[codebolt-mcp] SSE client connected");

            const transport = new SSEServerTransport("/messages", res);
            transports.set(transport.sessionId, transport);

            // Clean up when the client disconnects
            res.on("close", () => {
                transports.delete(transport.sessionId);
                console.log("[codebolt-mcp] SSE client disconnected");
            });

            await mcpServer.connect(transport);
            return;
        }

        if (req.method === "POST" && url.pathname === "/messages") {
            // The session ID is passed as a query parameter by the SSE transport
            const sessionId = url.searchParams.get("sessionId");
            const transport = sessionId ? transports.get(sessionId) : undefined;

            if (!transport) {
                res.writeHead(400, { "Content-Type": "text/plain" });
                res.end("No active SSE session for this sessionId");
                return;
            }

            await transport.handlePostMessage(req, res);
            return;
        }

        // Health check
        if (req.method === "GET" && url.pathname === "/health") {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ status: "ok", sessions: transports.size }));
            return;
        }

        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
    });

    return new Promise<CodeboltMcpServerHandle>((resolve, reject) => {
        httpServer.on("error", reject);

        httpServer.listen(port, hostname, () => {
            const addr = httpServer.address();
            const actualPort =
                typeof addr === "object" && addr ? addr.port : port;
            const sseUrl = `http://${hostname}:${actualPort}/sse`;

            console.log(`[codebolt-mcp] SSE server listening on ${sseUrl}`);

            resolve({
                port: actualPort,
                url: sseUrl,
                server: mcpServer,
                close: async () => {
                    // Close all active transports
                    for (const transport of transports.values()) {
                        try {
                            await transport.close?.();
                        } catch { /* ignore */ }
                    }
                    transports.clear();

                    await mcpServer.close();

                    await new Promise<void>((res, rej) => {
                        httpServer.close((err) => (err ? rej(err) : res()));
                    });

                    console.log("[codebolt-mcp] Server stopped");
                },
            });
        });
    });
}

// ── Stdio transport ──

async function startStdio(
    mcpServer: Server,
): Promise<CodeboltMcpServerHandle> {
    const transport = new StdioServerTransport();
    await mcpServer.connect(transport);

    console.error("[codebolt-mcp] Running on stdio transport");

    return {
        port: 0,
        url: "",
        server: mcpServer,
        close: async () => {
            await transport.close?.();
            await mcpServer.close();
        },
    };
}

// ── Main entry point ──

/**
 * Start a Codebolt MCP server that exposes codeboltjs tools to MCP clients
 * like Claude Code.
 *
 * @example
 * ```typescript
 * import codebolt from '@codebolt/codeboltjs';
 * import { startCodeboltMcpServer } from '@codebolt/mcp-server';
 *
 * // Wait for codeboltjs to connect
 * await codebolt.waitForConnection();
 *
 * const handle = await startCodeboltMcpServer({
 *     codebolt,
 *     transport: 'sse',
 * });
 *
 * console.log(`MCP server at ${handle.url}`);
 * // → "http://127.0.0.1:54321/sse"
 * // Pass this URL to Claude Code via --mcp-config
 * ```
 */
export async function startCodeboltMcpServer(
    options: CodeboltMcpServerOptions = {},
): Promise<CodeboltMcpServerHandle> {
    const toolsModule = resolveToolsModule(options);

    const toolNames = toolsModule.getToolNames();
    const filtered = options.toolFilter
        ? toolNames.filter((n) => options.toolFilter!.includes(n))
        : toolNames;

    console.log(
        `[codebolt-mcp] Registering ${filtered.length} tools` +
        (options.toolFilter ? ` (filtered from ${toolNames.length})` : ""),
    );

    const mcpServer = createCodeboltMcpServer({
        tools: toolsModule,
        serverName: options.serverName,
        toolFilter: options.toolFilter,
        toolPrefix: options.toolPrefix,
    });

    const transport = options.transport ?? "sse";

    if (transport === "stdio") {
        return startStdio(mcpServer);
    }

    return startSSE(mcpServer, options);
}

// Re-export the low-level server factory for advanced use
export { createCodeboltMcpServer } from "./server.js";
