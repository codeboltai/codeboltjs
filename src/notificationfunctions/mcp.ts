/**
 * MCP Notification Functions
 * 
 * This module provides functions for sending MCP-related notifications,
 * including MCP server operations and tool executions.
 */

import {
    GetEnabledMCPServersRequestNotification,
    GetEnabledMCPServersResultNotification,
    ListToolsFromMCPServersRequestNotification,
    ListToolsFromMCPServersResultNotification,
    GetToolsRequestNotification,
    GetToolsResultNotification,
    ExecuteToolRequestNotification,
    ExecuteToolResultNotification
} from '../types/notifications/mcp';

import { McpNotifications } from '../types/notificationFunctions/mcp';

import {
    sendNotification,
    generateToolUseId,
    validateRequiredFields
} from './utils';


// ===== GET ENABLED MCP SERVERS FUNCTIONS =====

/**
 * Sends a get enabled MCP servers request notification
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export function GetEnabledMCPServersRequestNotify(
    toolUseId?: string
): void {
    const notification: GetEnabledMCPServersRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: "mcpnotify",
        action: "getEnabledMCPServersRequest",
        data: {}
    };

    sendNotification(notification, 'mcp-get-enabled-servers');
}

/**
 * Sends a get enabled MCP servers result notification
 * @param content - The result content or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export function GetEnabledMCPServersResultNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    if (!toolUseId) {
        console.error('[McpNotifications] toolUseId is required for response notifications');
        return;
    }

    const notification: GetEnabledMCPServersResultNotification = {
        toolUseId,
        type: "mcpnotify",
        action: "getEnabledMCPServersResult",
        content,
        isError
    };

    sendNotification(notification, 'mcp-get-enabled-servers-result');
}

// ===== LIST TOOLS FROM MCP SERVERS FUNCTIONS =====

/**
 * Sends a list tools from MCP servers request notification
 * @param toolboxes - Array of toolbox names to list tools from
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export function ListToolsFromMCPServersRequestNotify(
    toolboxes: string[],
    toolUseId?: string
): void {
    // Validate required fields
    if (!validateRequiredFields({ toolboxes }, ['toolboxes'], 'mcp-list-tools')) {
        return;
    }

    const notification: ListToolsFromMCPServersRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: "mcpnotify",
        action: "listToolsFromMCPServersRequest",
        data: {
            toolboxes: toolboxes
        }
    };

    sendNotification(notification, 'mcp-list-tools');
}

/**
 * Sends a list tools from MCP servers result notification
 * @param content - The result content or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export function ListToolsFromMCPServersResultNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    if (!toolUseId) {
        console.error('[McpNotifications] toolUseId is required for response notifications');
        return;
    }

    const notification: ListToolsFromMCPServersResultNotification = {
        toolUseId,
        type: "mcpnotify",
        action: "listToolsFromMCPServersResult",
        content,
        isError
    };

    sendNotification(notification, 'mcp-list-tools-result');
}

// ===== GET TOOLS FUNCTIONS =====

/**
 * Sends a get tools request notification
 * @param tools - Array of tools with toolbox and toolName
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export function GetToolsRequestNotify(
    tools: { toolbox: string; toolName: string }[],
    toolUseId?: string
): void {
    // Validate required fields
    if (!validateRequiredFields({ tools }, ['tools'], 'mcp-get-tools')) {
        return;
    }

    const notification: GetToolsRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: "mcpnotify",
        action: "getToolsRequest",
        data: {
            tools: tools
        }
    };

    sendNotification(notification, 'mcp-get-tools');
}

/**
 * Sends a get tools result notification
 * @param content - The result content or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export function GetToolsResultNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    if (!toolUseId) {
        console.error('[McpNotifications] toolUseId is required for response notifications');
        return;
    }

    const notification: GetToolsResultNotification = {
        toolUseId,
        type: "mcpnotify",
        action: "getToolsResult",
        content,
        isError
    };

    sendNotification(notification, 'mcp-get-tools-result');
}

// ===== EXECUTE TOOL FUNCTIONS =====

/**
 * Sends an execute tool request notification
 * @param toolbox - The toolbox name
 * @param toolName - The tool name to execute
 * @param params - The parameters for the tool execution
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export function ExecuteToolRequestNotify(
    toolbox: string,
    toolName: string,
    params: any,
    toolUseId?: string
): void {
    // Validate required fields
    if (!validateRequiredFields({ toolbox, toolName, params }, ['toolbox', 'toolName', 'params'], 'mcp-execute-tool')) {
        return;
    }

    const notification: ExecuteToolRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: "mcpnotify",
        action: "executeToolRequest",
        data: {
            toolbox: toolbox,
            toolName: toolName,
            params: params
        }
    };

    sendNotification(notification, 'mcp-execute-tool');
}

/**
 * Sends an execute tool result notification
 * @param content - The result content or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export function ExecuteToolResultNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    if (!toolUseId) {
        console.error('[McpNotifications] toolUseId is required for response notifications');
        return;
    }

    const notification: ExecuteToolResultNotification = {
        toolUseId,
        type: "mcpnotify",
        action: "executeToolResult",
        content,
        isError
    };

    sendNotification(notification, 'mcp-execute-tool-result');
}

/**
 * MCP notification functions object
 */
export const mcpNotifications: McpNotifications = {
    GetEnabledMCPServersRequestNotify,
    GetEnabledMCPServersResultNotify,
    ListToolsFromMCPServersRequestNotify,
    ListToolsFromMCPServersResultNotify,
    GetToolsRequestNotify,
    GetToolsResultNotify,
    ExecuteToolRequestNotify,
    ExecuteToolResultNotify
}; 