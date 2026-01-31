
// To use UserMessage functionality, install @codebolt/agent-utils
import cbws from '../core/websocket';
import tools from '../tools';
import type { AnyDeclarativeTool, ToolResult } from '../tools/types';
import {
    GetEnabledToolBoxesResponse,
    GetLocalToolBoxesResponse,
    GetAvailableToolBoxesResponse,
    SearchAvailableToolBoxesResponse,
    ListToolsFromToolBoxesResponse,
    ConfigureToolBoxResponse,
    GetToolsResponse,
    ExecuteToolResponse,
    MCPUserMessage,
    MCPConfiguration,
    ToolParameters,
    GetMcpToolsResponse,
    GetMcpListResponse,
    GetAllMCPToolsResponse,
    GetEnabledMCPSResponse,
    ConfigureMCPToolResponse
} from '@codebolt/types/sdk';
import { EventType, CodeboltToolsAction, CodeboltToolsResponse } from '@codebolt/types/enum';

const CODEBOLT_TOOLBOX = 'codebolt';

/**
 * Checks if toolbox is the codebolt local toolbox (case-insensitive)
 */
function isCodeboltToolbox(toolbox: string): boolean {
    return toolbox.toLowerCase() === CODEBOLT_TOOLBOX;
}

/**
 * Converts a local declarative tool to OpenAI tool format.
 * Prefixes tool name with 'codebolt--' for consistent naming.
 */
function convertLocalToolToOpenAIFormat(tool: AnyDeclarativeTool) {
    return {
        type: 'function' as const,
        function: {
            name: `${CODEBOLT_TOOLBOX}--${tool.name}`,
            description: tool.description,
            parameters: tool.schema.function.parameters
        }
    };
}

/**
 * Extracts the actual tool name from a prefixed tool name.
 * e.g., "codebolt--read_file" -> "read_file"
 */
function extractToolName(prefixedName: string): string {
    const prefix = `${CODEBOLT_TOOLBOX}--`;
    return prefixedName.startsWith(prefix)
        ? prefixedName.substring(prefix.length)
        : prefixedName;
}

/**
 * Object containing methods for interacting with Codebolt MCP (Model Context Protocol) tools.
 * Provides functionality to discover, list, and execute tools.
 */
const codeboltMCP = {
    /**
     * Gets the list of currently enabled toolboxes.
     * 
     * @returns Promise with the enabled toolboxes data
     */
    getEnabledMCPServers: (): Promise<GetEnabledToolBoxesResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.CODEBOLT_TOOLS_EVENT,
                "action": CodeboltToolsAction.GetEnabledToolBoxes
            },
            CodeboltToolsResponse.GetEnabledToolBoxesResponse
        );
    },

    /**
     * Gets the list of locally available toolboxes.
     * 
     * @returns Promise with the local toolboxes data
     */
    getLocalMCPServers: (): Promise<GetLocalToolBoxesResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.CODEBOLT_TOOLS_EVENT,
                "action": CodeboltToolsAction.GetLocalToolBoxes
            },
            CodeboltToolsResponse.GetLocalToolBoxesResponse
        );
    },

    /**
     * Gets toolboxes mentioned in a user message.
     * 
     * @param userMessage - The user message to extract mentions from
     * @returns Promise with the mentioned toolboxes
     */
    getMentionedMCPServers: (userMessage: MCPUserMessage): Promise<GetAvailableToolBoxesResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.CODEBOLT_TOOLS_EVENT,
                "action": CodeboltToolsAction.GetAvailableToolBoxes
            },
            CodeboltToolsResponse.GetAvailableToolBoxesResponse
        );
    },

    /**
     * Searches for available toolboxes matching a query.
     * 
     * @param query - The search query string
     * @returns Promise with matching toolboxes data
     */
    searchAvailableMCPServers: (query: string): Promise<SearchAvailableToolBoxesResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.CODEBOLT_TOOLS_EVENT,
                "action": CodeboltToolsAction.SearchAvailableToolBoxes,
                "query": query
            },
            CodeboltToolsResponse.SearchAvailableToolBoxesResponse
        );
    },

    /**
     * Lists all tools from the specified toolboxes.
     *
     * @param toolBoxes - Array of toolbox names to list tools from
     * @returns Promise with tools from the specified toolboxes (in OpenAI format)
     */
    listMcpFromServers: async (toolBoxes: string[]): Promise<ListToolsFromToolBoxesResponse> => {
        const hasCodebolt = toolBoxes.some(tb => isCodeboltToolbox(tb));
        const otherToolBoxes = toolBoxes.filter(tb => !isCodeboltToolbox(tb));

        // Type matches ListToolsFromToolBoxesResponse.data.tools (OpenAI format)
        const toolsList: Array<{
            type: 'function';
            function: {
                name: string;
                description: string;
                parameters: Record<string, unknown>;
            };
        }> = [];

        // Get local codebolt tools in OpenAI format (names prefixed as codebolt--<toolName>)
        if (hasCodebolt) {
            const localTools = tools.getRegistry().getAllTools().map(tool => convertLocalToolToOpenAIFormat(tool));
            toolsList.push(...localTools);
        }

        // Get remote tools if needed
        if (otherToolBoxes.length > 0) {
            const response = await cbws.messageManager.sendAndWaitForResponse(
                {
                    "type": EventType.CODEBOLT_TOOLS_EVENT,
                    "action": CodeboltToolsAction.ListToolsFromToolBoxes,
                    "toolBoxes": otherToolBoxes
                },
                CodeboltToolsResponse.ListToolsFromToolBoxesResponse
            );
            if (response.data?.tools) {
                toolsList.push(...response.data.tools);
            }
        }

        return { data: { tools: toolsList } };
    },

    /**
     * Configures a specific toolbox with provided configuration.
     * 
     * @param name - The name of the toolbox to configure
     * @param config - Configuration object for the toolbox
     * @returns Promise with the configuration result
     */
    configureMCPServer: (name: string, config: MCPConfiguration): Promise<ConfigureToolBoxResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.CODEBOLT_TOOLS_EVENT,
                "action": CodeboltToolsAction.ConfigureToolBox,
                "mcpName": name,
                "config": config
            },
            CodeboltToolsResponse.ConfigureToolBoxResponse
        );
    },

    /**
     * Gets detailed information about specific tools.
     *
     * @param toolRequests - Array of toolbox and tool name pairs
     * @returns Promise with detailed information about the tools
     */
    getTools: async (toolRequests: { toolbox: string, toolName: string }[]): Promise<GetToolsResponse> => {
        const codeboltRequests = toolRequests.filter(t => isCodeboltToolbox(t.toolbox));
        const otherRequests = toolRequests.filter(t => !isCodeboltToolbox(t.toolbox));

        let result: Array<{ toolbox: string; toolName: string; description?: string; parameters?: Record<string, unknown> }> = [];

        // Get local codebolt tools
        if (codeboltRequests.length > 0) {
            for (const req of codeboltRequests) {
                const actualToolName = extractToolName(req.toolName);
                const tool = tools.getTool(actualToolName);
                if (tool) {
                    result.push({
                        toolbox: CODEBOLT_TOOLBOX,
                        toolName: `${CODEBOLT_TOOLBOX}--${tool.name}`,
                        description: tool.description,
                        parameters: tool.schema.function.parameters
                    });
                }
            }
        }

        // Get remote tools if needed
        if (otherRequests.length > 0) {
            const response = await cbws.messageManager.sendAndWaitForResponse(
                {
                    "type": EventType.CODEBOLT_TOOLS_EVENT,
                    "action": CodeboltToolsAction.GetTools,
                    "toolboxes": otherRequests
                },
                CodeboltToolsResponse.GetToolsResponse
            );
            if (response.data) {
                result = [...result, ...response.data];
            }
        }

        return { data: result } as GetToolsResponse;
    },


    

    /**
     * Executes a specific tool with provided parameters.
     *
     * @param toolbox - The name of the toolbox containing the tool
     * @param toolName - The name of the tool to execute
     * @param params - Parameters to pass to the tool
     * @returns Promise with the execution result
     */
    executeTool: async (toolbox: string, toolName: string, params: ToolParameters): Promise<ExecuteToolResponse> => {
        // Handle local codebolt tools
        if (isCodeboltToolbox(toolbox)) {
            // Extract actual tool name (in case it comes prefixed)
            const actualToolName = extractToolName(toolName);

            if (!tools.hasTool(actualToolName)) {
                return {
                    success: false,
                    error: `Tool '${actualToolName}' not found in codebolt toolbox`
                } as ExecuteToolResponse;
            }

            const result: ToolResult = await tools.executeTool(actualToolName, params as object);

            // Match MCP service "executeToolResponse" semantics used by the app:
            // - data: [false, toolResponse] on success
            // - data: [true, errorMessage] on error
            const toolResponse =
                typeof result.llmContent === 'string'
                    ? result.llmContent
                    : JSON.stringify(result.llmContent);

            if (result.error) {
                return {
                    success: false,
                    status: 'error',
                    error: result.error.message,
                    result: toolResponse,
                    data: [true, result.error.message],
                } as ExecuteToolResponse;
            }

            return {
                success: true,
                status: 'success',
                result: toolResponse,
                data: [false, toolResponse],
            } as ExecuteToolResponse;
        }

        // Use websocket for other toolboxes
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.CODEBOLT_TOOLS_EVENT,
                "action": CodeboltToolsAction.ExecuteTool,
                "toolName": `${toolbox}--${toolName}`,
                "params": params
            },
            CodeboltToolsResponse.ExecuteToolResponse
        );
    },

    /**
     * Gets MCP tools from the specified servers.
     *
     * @param mcpNames - Array of MCP server names to get tools from
     * @returns Promise with MCP tools data
     */
    getMcpTools: async (mcpNames?: string[]): Promise<GetMcpToolsResponse> => {
        const includesCodebolt = !mcpNames || mcpNames.some(n => isCodeboltToolbox(n));
        const otherMcpNames = mcpNames?.filter(n => !isCodeboltToolbox(n));

        let result: ReturnType<typeof convertLocalToolToOpenAIFormat>[] = [];

        // Include local codebolt tools (names prefixed as codebolt--<toolName>)
        if (includesCodebolt) {
            const localTools = tools.getRegistry().getAllTools().map(convertLocalToolToOpenAIFormat);
            result = [...result, ...localTools];
        }

        // Get remote MCP tools if needed
        if (!mcpNames || (otherMcpNames && otherMcpNames.length > 0)) {
            const response = await cbws.messageManager.sendAndWaitForResponse(
                {
                    "type": EventType.CODEBOLT_TOOLS_EVENT,
                    "action": CodeboltToolsAction.GetMcpTools,
                    "mcpNames": otherMcpNames
                },
                CodeboltToolsResponse.GetMcpToolsResponse
            );
            if (response.tools) {
                result = [...result, ...response.tools];
            }
        }

        return { tools: result } as GetMcpToolsResponse;
    },

    /**
     * Gets the list of available MCP servers.
     *
     * @returns Promise with MCP server list
     */
    getMcpList: (): Promise<GetMcpListResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.CODEBOLT_TOOLS_EVENT,
                "action": CodeboltToolsAction.GetMcpList
            },
            CodeboltToolsResponse.GetMcpListResponse
        );
    },

    /**
     * Gets all tools from all enabled MCP servers.
     *
     * @returns Promise with all MCP tools data
     */
    getAllMcpTools: async (): Promise<GetAllMCPToolsResponse> => {
        // Get local codebolt tools
        const localTools = tools.getRegistry().getAllTools().map(convertLocalToolToOpenAIFormat);

        // Get remote MCP tools
        const response = await cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.CODEBOLT_TOOLS_EVENT,
                "action": CodeboltToolsAction.GetAllMcpTools
            },
            CodeboltToolsResponse.GetAllMcpToolsResponse
        );

        const remoteTools = response.tools || [];

        return { tools: [...localTools, ...remoteTools] } as GetAllMCPToolsResponse;
    },

    /**
     * Gets the list of enabled MCP servers.
     *
     * @returns Promise with enabled MCP servers data
     */
    getEnabledMcps: (): Promise<GetEnabledMCPSResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.CODEBOLT_TOOLS_EVENT,
                "action": CodeboltToolsAction.GetEnabledMcps
            },
            CodeboltToolsResponse.GetEnabledMcpsResponse
        );
    },

    /**
     * Configures a specific MCP tool with provided configuration.
     *
     * @param mcpName - The name of the MCP server
     * @param toolName - The name of the tool to configure
     * @param config - Configuration object for the tool
     * @returns Promise with the configuration result
     */
    configureMcpTool: (mcpName: string, toolName: string, config: Record<string, unknown>): Promise<ConfigureMCPToolResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.CODEBOLT_TOOLS_EVENT,
                "action": CodeboltToolsAction.ConfigureMcpTool,
                "mcpName": mcpName,
                "toolName": toolName,
                "config": config
            },
            CodeboltToolsResponse.ConfigureMcpToolResponse
        );
    }
};

export default codeboltMCP;