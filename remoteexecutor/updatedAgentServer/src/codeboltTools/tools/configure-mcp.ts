/**
 * Configure MCP Tool - Configures MCP servers
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import { Kind } from '../types';
import type { ConfigManager } from '../config';

/**
 * Parameters for the ConfigureMcp tool
 */
export interface ConfigureMcpToolParams {
    /**
     * The name of the MCP server to configure
     */
    serverName: string;

    /**
     * The configuration for the MCP server
     */
    config: Record<string, any>;
}

class ConfigureMcpToolInvocation extends BaseToolInvocation<
    ConfigureMcpToolParams,
    ToolResult
> {
    constructor(
        private readonly config: ConfigManager,
        params: ConfigureMcpToolParams,
    ) {
        super(params);
    }

    getDescription(): string {
        return `Configuring MCP server: ${this.params.serverName}`;
    }

    async execute(
        signal: AbortSignal,
        updateOutput?: (output: string) => void,
    ): Promise<ToolResult> {
        try {
            // Import handleConfigureMcpTool to use existing logic
            const { handleConfigureMcpTool } = await import('../../cliLib/mcpService.cli');

            // Use the exact same logic as mcpService.cli.ts
            const result = await handleConfigureMcpTool(this.params);

            if (result && result[0] === false) {
                // Success case
                return {
                    llmContent: result[1] || 'MCP server configured successfully',
                    returnDisplay: result[1] || 'MCP server configured successfully'
                };
            } else {
                // Error case
                return {
                    llmContent: '',
                    returnDisplay: '',
                    error: {
                        type: ToolErrorType.MCP_TOOL_ERROR,
                        message: result[1] || 'Failed to configure MCP server'
                    }
                };
            }
        } catch (error) {
            return {
                llmContent: '',
                returnDisplay: '',
                error: {
                    type: ToolErrorType.MCP_TOOL_ERROR,
                    message: `Failed to configure MCP server: ${error.message || error}`
                }
            };
        }
    }
}

export class ConfigureMcpTool extends BaseDeclarativeTool<
    ConfigureMcpToolParams,
    ToolResult
> {
    static readonly Name: string = 'configure_mcp';

    constructor(private readonly config: ConfigManager) {
        super(
            ConfigureMcpTool.Name,
            'Configure MCP',
            'Configure the settings for a specific MCP tool. This tool allows you to update the configuration of an MCP tool by specifying the server name and the new configuration settings.',
            Kind.Execute,
            {
                type: 'object',
                properties: {
                    serverName: {
                        type: 'string',
                        description: 'The name of the MCP server to configure. do not use the mcp_id'
                    },
                    config: {
                        type: 'object',
                        properties: {
                            command: {
                                type: 'string',
                                description: 'The command to execute (e.g., \'npx\')'
                            },
                            args: {
                                type: 'array',
                                items: {
                                    type: 'string'
                                },
                                description: 'Array of command arguments'
                            }
                        },
                        required: ['command', 'args'],
                        description: 'The configuration settings for the MCP tool matching the mcp_servers.json format'
                    }
                },
                required: ['serverName', 'config']
            }
        );
    }

    protected override validateToolParamValues(
        params: ConfigureMcpToolParams,
    ): string | null {
        if (!params.serverName || params.serverName.trim() === '') {
            return 'Parameter "serverName" must be a non-empty string.';
        }
        if (!params.config || typeof params.config !== 'object') {
            return 'Parameter "config" must be a valid object.';
        }
        return null;
    }

    protected createInvocation(params: ConfigureMcpToolParams) {
        return new ConfigureMcpToolInvocation(this.config, params);
    }
}
