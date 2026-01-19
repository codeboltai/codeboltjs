
// To use UserMessage functionality, install @codebolt/agent-utils
import cbws from '../core/websocket';
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
     * @returns Promise with tools from the specified toolboxes
     */
    listMcpFromServers: (toolBoxes: string[]): Promise<ListToolsFromToolBoxesResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.CODEBOLT_TOOLS_EVENT,
                "action": CodeboltToolsAction.ListToolsFromToolBoxes,
                "toolBoxes": toolBoxes
            },
            CodeboltToolsResponse.ListToolsFromToolBoxesResponse
        );
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
     * @param tools - Array of toolbox and tool name pairs
     * @returns Promise with detailed information about the tools
     */
    getTools: (tools: { toolbox: string, toolName: string }[]): Promise<GetToolsResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.CODEBOLT_TOOLS_EVENT,
                "action": CodeboltToolsAction.GetTools,
                "toolboxes": tools
            },
            CodeboltToolsResponse.GetToolsResponse
        );
    },


    

    /**
     * Executes a specific tool with provided parameters.
     *
     * @param toolbox - The name of the toolbox containing the tool
     * @param toolName - The name of the tool to execute
     * @param params - Parameters to pass to the tool
     * @returns Promise with the execution result
     */
    executeTool: (toolbox: string, toolName: string, params: ToolParameters): Promise<ExecuteToolResponse> => {
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
    getMcpTools: (mcpNames?: string[]): Promise<GetMcpToolsResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.CODEBOLT_TOOLS_EVENT,
                "action": CodeboltToolsAction.GetMcpTools,
                "mcpNames": mcpNames
            },
            CodeboltToolsResponse.GetMcpToolsResponse
        );
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
    getAllMcpTools: (): Promise<GetAllMCPToolsResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.CODEBOLT_TOOLS_EVENT,
                "action": CodeboltToolsAction.GetAllMcpTools
            },
            CodeboltToolsResponse.GetAllMcpToolsResponse
        );
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