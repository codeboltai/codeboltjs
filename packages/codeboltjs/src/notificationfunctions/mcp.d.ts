/**
 * MCP Notification Functions
 *
 * This module provides functions for sending MCP-related notifications,
 * including MCP server operations and tool executions.
 */
import { McpNotifications } from '../types/notificationFunctions/mcp';
/**
 * Sends a get enabled MCP servers request notification
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export declare function GetEnabledMCPServersRequestNotify(toolUseId?: string): void;
/**
 * Sends a get enabled MCP servers result notification
 * @param content - The result content or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export declare function GetEnabledMCPServersResultNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
/**
 * Sends a list tools from MCP servers request notification
 * @param toolboxes - Array of toolbox names to list tools from
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export declare function ListToolsFromMCPServersRequestNotify(toolboxes: string[], toolUseId?: string): void;
/**
 * Sends a list tools from MCP servers result notification
 * @param content - The result content or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export declare function ListToolsFromMCPServersResultNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
/**
 * Sends a get tools request notification
 * @param tools - Array of tools with toolbox and toolName
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export declare function GetToolsRequestNotify(tools: {
    toolbox: string;
    toolName: string;
}[], toolUseId?: string): void;
/**
 * Sends a get tools result notification
 * @param content - The result content or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export declare function GetToolsResultNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
/**
 * Sends an execute tool request notification
 * @param toolbox - The toolbox name
 * @param toolName - The tool name to execute
 * @param params - The parameters for the tool execution
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export declare function ExecuteToolRequestNotify(toolbox: string, toolName: string, params: any, toolUseId?: string): void;
/**
 * Sends an execute tool result notification
 * @param content - The result content or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export declare function ExecuteToolResultNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
/**
 * MCP notification functions object
 */
export declare const mcpNotifications: McpNotifications;
