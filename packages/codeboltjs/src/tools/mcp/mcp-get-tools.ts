/**
 * MCP Get Tools Tool - Gets available MCP tools
 * Wraps the SDK's codeboltMCP.getMcpTools() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltMCP from '../../modules/mcp';

/**
 * Parameters for the MCPGetTools tool
 */
export interface MCPGetToolsToolParams {
    /**
     * Optional: The name of the MCP server to get tools from.
     * If not provided, gets tools from all enabled servers.
     */
    serverName?: string;
}

class MCPGetToolsToolInvocation extends BaseToolInvocation<
    MCPGetToolsToolParams,
    ToolResult
> {
    constructor(params: MCPGetToolsToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            // If serverName is provided, wrap it in an array; otherwise pass undefined to get all
            const mcpNames = this.params.serverName
                ? [this.params.serverName]
                : undefined;

            const response = await codeboltMCP.getMcpTools(mcpNames);

            // The mcp module returns { tools: [...] }
            // Access via type assertion to match actual module response
            const toolsArray = (response as { tools?: unknown[] }).tools || [];

            if (toolsArray.length === 0) {
                const serverInfo = this.params.serverName
                    ? ` from server '${this.params.serverName}'`
                    : '';
                return {
                    llmContent: `No MCP tools found${serverInfo}.`,
                    returnDisplay: `No MCP tools found${serverInfo}`,
                };
            }

            const toolsData = JSON.stringify(toolsArray, null, 2);
            const serverInfo = this.params.serverName
                ? ` from server '${this.params.serverName}'`
                : ' from all enabled servers';

            return {
                llmContent: `Available MCP Tools${serverInfo}:\n${toolsData}`,
                returnDisplay: `Successfully retrieved ${toolsArray.length} MCP tools${serverInfo}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting MCP tools: ${errorMessage}`,
                returnDisplay: `Error getting MCP tools: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.MCP_TOOL_ERROR,
                },
            };
        }
    }
}

/**
 * Implementation of the MCPGetTools tool logic
 */
export class MCPGetToolsTool extends BaseDeclarativeTool<
    MCPGetToolsToolParams,
    ToolResult
> {
    static readonly Name: string = 'mcp_get_tools';

    constructor() {
        super(
            MCPGetToolsTool.Name,
            'MCPGetTools',
            'Gets available MCP (Model Context Protocol) tools. Can optionally filter by a specific server name. Returns tool definitions including names, descriptions, and parameters.',
            Kind.Read,
            {
                properties: {
                    serverName: {
                        description:
                            'Optional: The name of the MCP server to get tools from. If not provided, returns tools from all enabled servers.',
                        type: 'string',
                    },
                },
                required: [],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: MCPGetToolsToolParams,
    ): ToolInvocation<MCPGetToolsToolParams, ToolResult> {
        return new MCPGetToolsToolInvocation(params);
    }
}
