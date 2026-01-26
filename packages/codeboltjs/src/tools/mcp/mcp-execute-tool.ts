/**
 * MCP Execute Tool - Executes an MCP tool
 * Wraps the SDK's codeboltMCP.executeTool() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltMCP from '../../modules/mcp';

/**
 * Parameters for the MCPExecuteTool tool
 */
export interface MCPExecuteToolToolParams {
    /**
     * The name of the MCP server containing the tool
     */
    serverName: string;

    /**
     * The name of the tool to execute
     */
    toolName: string;

    /**
     * Optional: Parameters to pass to the tool
     */
    params?: Record<string, unknown>;
}

class MCPExecuteToolToolInvocation extends BaseToolInvocation<
    MCPExecuteToolToolParams,
    ToolResult
> {
    constructor(params: MCPExecuteToolToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await codeboltMCP.executeTool(
                this.params.serverName,
                this.params.toolName,
                this.params.params || {}
            );

            if (!response.success) {
                const errorMsg = response.error || 'Tool execution failed';
                return {
                    llmContent: `Error executing tool '${this.params.toolName}' on server '${this.params.serverName}': ${errorMsg}`,
                    returnDisplay: `Error executing MCP tool: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.MCP_TOOL_ERROR,
                    },
                };
            }

            const resultData = response.result || response.data;
            const resultString = typeof resultData === 'string'
                ? resultData
                : JSON.stringify(resultData, null, 2);

            return {
                llmContent: `Tool '${this.params.toolName}' executed successfully on server '${this.params.serverName}':\n${resultString}`,
                returnDisplay: `Successfully executed MCP tool '${this.params.toolName}'`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error executing MCP tool: ${errorMessage}`,
                returnDisplay: `Error executing MCP tool: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.MCP_TOOL_ERROR,
                },
            };
        }
    }
}

/**
 * Implementation of the MCPExecuteTool tool logic
 */
export class MCPExecuteToolTool extends BaseDeclarativeTool<
    MCPExecuteToolToolParams,
    ToolResult
> {
    static readonly Name: string = 'mcp_execute_tool';

    constructor() {
        super(
            MCPExecuteToolTool.Name,
            'MCPExecuteTool',
            'Executes an MCP (Model Context Protocol) tool on a specified server. Requires the server name, tool name, and optional parameters for the tool.',
            Kind.Execute,
            {
                properties: {
                    serverName: {
                        description:
                            'The name of the MCP server containing the tool to execute.',
                        type: 'string',
                    },
                    toolName: {
                        description:
                            'The name of the tool to execute on the specified server.',
                        type: 'string',
                    },
                    params: {
                        description:
                            'Optional: An object containing parameters to pass to the tool.',
                        type: 'object',
                        additionalProperties: true,
                    },
                },
                required: ['serverName', 'toolName'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: MCPExecuteToolToolParams,
    ): string | null {
        if (!params.serverName || params.serverName.trim() === '') {
            return "The 'serverName' parameter must be a non-empty string.";
        }

        if (!params.toolName || params.toolName.trim() === '') {
            return "The 'toolName' parameter must be a non-empty string.";
        }

        return null;
    }

    protected createInvocation(
        params: MCPExecuteToolToolParams,
    ): ToolInvocation<MCPExecuteToolToolParams, ToolResult> {
        return new MCPExecuteToolToolInvocation(params);
    }
}
