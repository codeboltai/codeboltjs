/**
 * MCP List Servers Tool - Lists enabled MCP servers
 * Wraps the SDK's codeboltMCP.getEnabledMCPServers() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltMCP from '../../modules/mcp';

/**
 * Parameters for the MCPListServers tool
 */
export interface MCPListServersToolParams {
    // No parameters required
}

class MCPListServersToolInvocation extends BaseToolInvocation<
    MCPListServersToolParams,
    ToolResult
> {
    constructor(params: MCPListServersToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await codeboltMCP.getEnabledMCPServers();

            if (!response) {
                return {
                    llmContent: 'No MCP servers found or response was empty.',
                    returnDisplay: 'No MCP servers found',
                };
            }

            const serversData = JSON.stringify(response, null, 2);

            return {
                llmContent: `Enabled MCP Servers:\n${serversData}`,
                returnDisplay: 'Successfully retrieved enabled MCP servers',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error listing MCP servers: ${errorMessage}`,
                returnDisplay: `Error listing MCP servers: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.MCP_TOOL_ERROR,
                },
            };
        }
    }
}

/**
 * Implementation of the MCPListServers tool logic
 */
export class MCPListServersTool extends BaseDeclarativeTool<
    MCPListServersToolParams,
    ToolResult
> {
    static readonly Name: string = 'mcp_list_servers';

    constructor() {
        super(
            MCPListServersTool.Name,
            'MCPListServers',
            'Lists all enabled MCP (Model Context Protocol) servers. Returns information about the currently active MCP servers that can be used for tool execution.',
            Kind.Read,
            {
                properties: {},
                required: [],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: MCPListServersToolParams,
    ): ToolInvocation<MCPListServersToolParams, ToolResult> {
        return new MCPListServersToolInvocation(params);
    }
}
