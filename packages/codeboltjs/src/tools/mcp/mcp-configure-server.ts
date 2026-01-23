/**
 * MCP Configure Server Tool - Configures an MCP server
 * Wraps the SDK's codeboltMCP.configureMCPServer() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import type { MCPConfiguration } from '@codebolt/types/sdk';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltMCP from '../../modules/mcp';

/**
 * Parameters for the MCPConfigureServer tool
 */
export interface MCPConfigureServerToolParams {
    /**
     * The name of the MCP server to configure
     */
    serverName: string;

    /**
     * Configuration object for the MCP server
     */
    config: Record<string, unknown>;
}

class MCPConfigureServerToolInvocation extends BaseToolInvocation<
    MCPConfigureServerToolParams,
    ToolResult
> {
    constructor(params: MCPConfigureServerToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            // Build MCPConfiguration with serverName and additional config
            const mcpConfig: MCPConfiguration = {
                serverName: this.params.serverName,
                ...this.params.config
            };
            const response = await codeboltMCP.configureMCPServer(
                this.params.serverName,
                mcpConfig
            );

            if (!response) {
                return {
                    llmContent: `MCP server '${this.params.serverName}' configuration completed (no response data).`,
                    returnDisplay: `Successfully configured MCP server '${this.params.serverName}'`,
                };
            }

            const responseData = JSON.stringify(response, null, 2);

            return {
                llmContent: `MCP server '${this.params.serverName}' configured successfully:\n${responseData}`,
                returnDisplay: `Successfully configured MCP server '${this.params.serverName}'`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error configuring MCP server '${this.params.serverName}': ${errorMessage}`,
                returnDisplay: `Error configuring MCP server: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.MCP_TOOL_ERROR,
                },
            };
        }
    }
}

/**
 * Implementation of the MCPConfigureServer tool logic
 */
export class MCPConfigureServerTool extends BaseDeclarativeTool<
    MCPConfigureServerToolParams,
    ToolResult
> {
    static readonly Name: string = 'mcp_configure_server';

    constructor() {
        super(
            MCPConfigureServerTool.Name,
            'MCPConfigureServer',
            'Configures an MCP (Model Context Protocol) server with the provided configuration object. Use this to update server settings, credentials, or other configuration options.',
            Kind.Edit,
            {
                properties: {
                    serverName: {
                        description:
                            'The name of the MCP server to configure.',
                        type: 'string',
                    },
                    config: {
                        description:
                            'Configuration object containing the settings to apply to the MCP server.',
                        type: 'object',
                        additionalProperties: true,
                    },
                },
                required: ['serverName', 'config'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: MCPConfigureServerToolParams,
    ): string | null {
        if (!params.serverName || params.serverName.trim() === '') {
            return "The 'serverName' parameter must be a non-empty string.";
        }

        if (!params.config || typeof params.config !== 'object') {
            return "The 'config' parameter must be a valid configuration object.";
        }

        return null;
    }

    protected createInvocation(
        params: MCPConfigureServerToolParams,
    ): ToolInvocation<MCPConfigureServerToolParams, ToolResult> {
        return new MCPConfigureServerToolInvocation(params);
    }
}
