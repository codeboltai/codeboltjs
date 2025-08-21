"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// To use UserMessage functionality, install @codebolt/agent-utils
const websocket_1 = __importDefault(require("../core/websocket"));
const enum_1 = require("@codebolt/types/enum");
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
    getEnabledMCPServers: () => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.CODEBOLT_TOOLS_EVENT,
            "action": enum_1.CodeboltToolsAction.GetEnabledToolBoxes
        }, enum_1.CodeboltToolsResponse.GetEnabledToolBoxesResponse);
    },
    /**
     * Gets the list of locally available toolboxes.
     *
     * @returns Promise with the local toolboxes data
     */
    getLocalMCPServers: () => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.CODEBOLT_TOOLS_EVENT,
            "action": enum_1.CodeboltToolsAction.GetLocalToolBoxes
        }, enum_1.CodeboltToolsResponse.GetLocalToolBoxesResponse);
    },
    /**
     * Gets toolboxes mentioned in a user message.
     *
     * @param userMessage - The user message to extract mentions from
     * @returns Promise with the mentioned toolboxes
     */
    getMentionedMCPServers: (userMessage) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.CODEBOLT_TOOLS_EVENT,
            "action": enum_1.CodeboltToolsAction.GetAvailableToolBoxes
        }, enum_1.CodeboltToolsResponse.GetAvailableToolBoxesResponse);
    },
    /**
     * Searches for available toolboxes matching a query.
     *
     * @param query - The search query string
     * @returns Promise with matching toolboxes data
     */
    searchAvailableMCPServers: (query) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.CODEBOLT_TOOLS_EVENT,
            "action": enum_1.CodeboltToolsAction.SearchAvailableToolBoxes,
            "query": query
        }, enum_1.CodeboltToolsResponse.SearchAvailableToolBoxesResponse);
    },
    /**
     * Lists all tools from the specified toolboxes.
     *
     * @param toolBoxes - Array of toolbox names to list tools from
     * @returns Promise with tools from the specified toolboxes
     */
    listMcpFromServers: (toolBoxes) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.CODEBOLT_TOOLS_EVENT,
            "action": enum_1.CodeboltToolsAction.ListToolsFromToolBoxes,
            "toolBoxes": toolBoxes
        }, enum_1.CodeboltToolsResponse.ListToolsFromToolBoxesResponse);
    },
    /**
     * Configures a specific toolbox with provided configuration.
     *
     * @param name - The name of the toolbox to configure
     * @param config - Configuration object for the toolbox
     * @returns Promise with the configuration result
     */
    configureMCPServer: (name, config) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.CODEBOLT_TOOLS_EVENT,
            "action": enum_1.CodeboltToolsAction.ConfigureToolBox,
            "mcpName": name,
            "config": config
        }, enum_1.CodeboltToolsResponse.ConfigureToolBoxResponse);
    },
    /**
     * Gets detailed information about specific tools.
     *
     * @param tools - Array of toolbox and tool name pairs
     * @returns Promise with detailed information about the tools
     */
    getTools: (tools) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.CODEBOLT_TOOLS_EVENT,
            "action": enum_1.CodeboltToolsAction.GetTools,
            "toolboxes": tools
        }, enum_1.CodeboltToolsResponse.GetToolsResponse);
    },
    /**
     * Executes a specific tool with provided parameters.
     *
     * @param toolbox - The name of the toolbox containing the tool
     * @param toolName - The name of the tool to execute
     * @param params - Parameters to pass to the tool
     * @returns Promise with the execution result
     */
    executeTool: (toolbox, toolName, params) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.CODEBOLT_TOOLS_EVENT,
            "action": enum_1.CodeboltToolsAction.ExecuteTool,
            "toolName": `${toolbox}--${toolName}`,
            "params": params
        }, enum_1.CodeboltToolsResponse.ExecuteToolResponse);
    }
};
exports.default = codeboltMCP;
