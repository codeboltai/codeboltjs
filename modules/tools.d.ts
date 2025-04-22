import { UserMessage } from '../utils';
/**
 * Object containing methods for interacting with Codebolt MCP (Model Context Protocol) tools.
 * Provides functionality to discover, list, and execute tools.
 */
declare const codeboltMCP: {
    /**
     * Gets the list of currently enabled toolboxes.
     *
     * @returns Promise with the enabled toolboxes data
     */
    getEnabledToolBoxes: () => Promise<any>;
    /**
     * Gets the list of locally available toolboxes.
     *
     * @returns Promise with the local toolboxes data
     */
    getLocalToolBoxes: () => Promise<any>;
    /**
     * Gets toolboxes mentioned in a user message.
     *
     * @param userMessage - The user message to extract mentions from
     * @returns Promise with the mentioned toolboxes
     */
    getMentionedToolBoxes: (userMessage: UserMessage) => Promise<any>;
    /**
     * Gets all available toolboxes.
     *
     * @returns Promise with all available toolboxes data
     */
    getAvailableToolBoxes: () => Promise<any>;
    /**
     * Searches for available toolboxes matching a query.
     *
     * @param query - The search query string
     * @returns Promise with matching toolboxes data
     */
    searchAvailableToolBoxes: (query: string) => Promise<any>;
    /**
     * Lists all tools from the specified toolboxes.
     *
     * @param toolBoxes - Array of toolbox names to list tools from
     * @returns Promise with tools from the specified toolboxes
     */
    listToolsFromToolBoxes: (toolBoxes: string[]) => Promise<any>;
    /**
     * Configures a specific toolbox with provided configuration.
     *
     * @param name - The name of the toolbox to configure
     * @param config - Configuration object for the toolbox
     * @returns Promise with the configuration result
     */
    configureToolBox: (name: string, config: any) => Promise<any>;
    /**
     * Gets detailed information about specific tools.
     *
     * @param tools - Array of toolbox and tool name pairs
     * @returns Promise with detailed information about the tools
     */
    getTools: (tools: {
        toolbox: string;
        toolName: string;
    }[]) => Promise<any[]>;
    /**
     * Executes a specific tool with provided parameters.
     *
     * @param toolbox - The name of the toolbox containing the tool
     * @param toolName - The name of the tool to execute
     * @param params - Parameters to pass to the tool
     * @returns Promise with the execution result
     */
    executeTool: (toolbox: string, toolName: string, params: any) => Promise<any>;
};
export default codeboltMCP;
