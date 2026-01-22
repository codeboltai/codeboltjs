/**
 * Search MCP Tool - Searches for available MCP tools
 * Wraps the SDK's codebaseSearch.searchMcpTool() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codebaseSearch from '../../modules/codebaseSearch';

/**
 * Parameters for the SearchMcpTool tool
 */
export interface SearchMcpToolToolParams {
    /**
     * The search query to find relevant MCP tools
     */
    query: string;

    /**
     * Optional tags to filter the search results
     */
    tags?: string[];
}

class SearchMcpToolToolInvocation extends BaseToolInvocation<
    SearchMcpToolToolParams,
    ToolResult
> {
    constructor(params: SearchMcpToolToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            // Call the SDK's codebaseSearch module
            const response = await codebaseSearch.searchMcpTool(
                this.params.query,
                this.params.tags
            );

            // McpToolSearchResponse has {success, results: any[], message?}
            if (!response.success) {
                const errorMsg = response.message || 'Unknown error';
                return {
                    llmContent: `Error searching MCP tools: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.MCP_TOOL_ERROR,
                    },
                };
            }

            // Format the results - results is any[]
            const tools = response.results || [];

            if (tools.length === 0) {
                return {
                    llmContent: `No MCP tools found for query: "${this.params.query}"`,
                    returnDisplay: `No tools found`,
                };
            }

            let output = `Found ${tools.length} MCP tool(s) for: "${this.params.query}"\n\n`;

            for (const tool of tools) {
                const name = tool.name || tool.toolName;
                const server = tool.server || tool.serverName || tool.mcpName;
                const description = tool.description;
                const score = tool.score || tool.relevance;

                output += `--- ${server ? `${server}::` : ''}${name}${score ? ` (score: ${score.toFixed(2)})` : ''} ---\n`;
                if (description) {
                    output += `${description}\n`;
                }
                if (tool.parameters || tool.inputSchema) {
                    output += `Parameters: ${JSON.stringify(tool.parameters || tool.inputSchema, null, 2)}\n`;
                }
                output += '\n';
            }

            return {
                llmContent: output,
                returnDisplay: `Found ${tools.length} MCP tool(s)`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error searching MCP tools: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the SearchMcpTool tool logic
 */
export class SearchMcpToolTool extends BaseDeclarativeTool<
    SearchMcpToolToolParams,
    ToolResult
> {
    static readonly Name: string = 'search_mcp_tool';

    constructor() {
        super(
            SearchMcpToolTool.Name,
            'SearchMcpTool',
            `Searches for available MCP (Model Context Protocol) tools that can help with a task. Use this to discover what tools are available and their capabilities.`,
            Kind.Search,
            {
                properties: {
                    query: {
                        description:
                            "Description of what you need a tool for (e.g., 'send email', 'database query', 'file conversion').",
                        type: 'string',
                    },
                    tags: {
                        description:
                            "Optional tags to filter results (e.g., ['database', 'api']).",
                        type: 'array',
                        items: { type: 'string' },
                    },
                },
                required: ['query'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: SearchMcpToolToolParams,
    ): string | null {
        if (params.query.trim() === '') {
            return "The 'query' parameter must be non-empty.";
        }

        return null;
    }

    protected createInvocation(
        params: SearchMcpToolToolParams,
    ): ToolInvocation<SearchMcpToolToolParams, ToolResult> {
        return new SearchMcpToolToolInvocation(params);
    }
}
