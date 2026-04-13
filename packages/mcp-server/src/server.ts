import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    ErrorCode,
    McpError,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * Duck-typed interface for the codeboltjs tools module.
 * Avoids hard import of @codebolt/codeboltjs — the caller passes this in.
 */
export interface CodeboltToolsModule {
    getToolNames(): string[];
    getTool(name: string): CodeboltDeclarativeTool | undefined;
    hasTool(name: string): boolean;
    executeTool(
        name: string,
        params: object,
        signal?: AbortSignal,
    ): Promise<CodeboltToolResult>;
}

export interface CodeboltDeclarativeTool {
    name: string;
    description: string;
    schema: {
        type: "function";
        function: {
            name: string;
            description: string;
            parameters: {
                type: "object";
                properties: Record<string, unknown>;
                required?: string[];
                additionalProperties?: boolean;
            };
        };
    };
}

export interface CodeboltToolResult {
    llmContent: string | unknown;
    returnDisplay?: string | unknown;
    error?: {
        message: string;
        type?: string;
    };
}

export interface CreateServerOptions {
    /** The codeboltjs tools module (import tools from '@codebolt/codeboltjs') */
    tools: CodeboltToolsModule;
    /** Server name shown to MCP clients. Default: "codebolt" */
    serverName?: string;
    /** Server version. Default: "1.0.0" */
    serverVersion?: string;
    /**
     * Optional list of tool names to expose. If omitted, all tools from
     * tools.getToolNames() are exposed.
     */
    toolFilter?: string[];
    /**
     * Prefix added to tool names in MCP. Default: "codebolt".
     * Set to "" for no prefix. Tools become "{prefix}_{toolName}" or just "{toolName}".
     */
    toolPrefix?: string;
}

/**
 * Resolves the list of declarative tools to expose based on options.
 */
function resolveTools(
    tools: CodeboltToolsModule,
    filter?: string[],
): CodeboltDeclarativeTool[] {
    const names = filter ?? tools.getToolNames();
    const resolved: CodeboltDeclarativeTool[] = [];

    for (const name of names) {
        const tool = tools.getTool(name);
        if (tool) {
            resolved.push(tool);
        }
    }

    return resolved;
}

/**
 * Builds the MCP tool name from a codebolt tool name.
 */
function mcpToolName(toolName: string, prefix: string): string {
    return prefix ? `${prefix}_${toolName}` : toolName;
}

/**
 * Extracts the original codebolt tool name from an MCP tool name.
 */
function codeboltToolName(mcpName: string, prefix: string): string {
    if (prefix && mcpName.startsWith(`${prefix}_`)) {
        return mcpName.slice(prefix.length + 1);
    }
    return mcpName;
}

/**
 * Creates an MCP Server instance with all codebolt tools registered.
 *
 * Does NOT start any transport — the caller connects a transport
 * (SSE, stdio, etc.) via server.connect(transport).
 */
export function createCodeboltMcpServer(options: CreateServerOptions): Server {
    const {
        tools,
        serverName = "codebolt",
        serverVersion = "1.0.0",
        toolFilter,
        toolPrefix = "codebolt",
    } = options;

    const declaredTools = resolveTools(tools, toolFilter);
    const prefix = toolPrefix;

    // Build a lookup from MCP name → codebolt name for fast resolution
    const mcpToCb = new Map<string, string>();
    for (const t of declaredTools) {
        mcpToCb.set(mcpToolName(t.name, prefix), t.name);
    }

    const server = new Server(
        { name: serverName, version: serverVersion },
        { capabilities: { tools: {} } },
    );

    // ── tools/list ──
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        return {
            tools: declaredTools.map((tool) => ({
                name: mcpToolName(tool.name, prefix),
                description: tool.description,
                inputSchema: tool.schema.function.parameters,
            })),
        };
    });

    // ── tools/call ──
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const requestedName = request.params.name;
        const originalName = mcpToCb.get(requestedName);

        if (!originalName) {
            throw new McpError(
                ErrorCode.MethodNotFound,
                `Unknown tool: ${requestedName}`,
            );
        }

        const args = (request.params.arguments ?? {}) as object;

        try {
            const result = await tools.executeTool(originalName, args);

            const text =
                typeof result.llmContent === "string"
                    ? result.llmContent
                    : JSON.stringify(result.llmContent);

            if (result.error) {
                return {
                    content: [{ type: "text" as const, text }],
                    isError: true,
                };
            }

            return {
                content: [{ type: "text" as const, text }],
            };
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            return {
                content: [{ type: "text" as const, text: `Error: ${message}` }],
                isError: true,
            };
        }
    });

    server.onerror = (error) => {
        console.error("[codebolt-mcp] Server error:", error);
    };

    return server;
}
