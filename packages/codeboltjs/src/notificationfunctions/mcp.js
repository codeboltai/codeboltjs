"use strict";
/**
 * MCP Notification Functions
 *
 * This module provides functions for sending MCP-related notifications,
 * including MCP server operations and tool executions.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mcpNotifications = void 0;
exports.GetEnabledMCPServersRequestNotify = GetEnabledMCPServersRequestNotify;
exports.GetEnabledMCPServersResultNotify = GetEnabledMCPServersResultNotify;
exports.ListToolsFromMCPServersRequestNotify = ListToolsFromMCPServersRequestNotify;
exports.ListToolsFromMCPServersResultNotify = ListToolsFromMCPServersResultNotify;
exports.GetToolsRequestNotify = GetToolsRequestNotify;
exports.GetToolsResultNotify = GetToolsResultNotify;
exports.ExecuteToolRequestNotify = ExecuteToolRequestNotify;
exports.ExecuteToolResultNotify = ExecuteToolResultNotify;
const utils_1 = require("./utils");
const enum_1 = require("@codebolt/types/enum");
// ===== GET ENABLED MCP SERVERS FUNCTIONS =====
/**
 * Sends a get enabled MCP servers request notification
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
function GetEnabledMCPServersRequestNotify(toolUseId) {
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.MCP_NOTIFY,
        action: enum_1.McpNotificationAction.GET_ENABLED_MCP_SERVERS_REQUEST,
        data: {}
    };
    (0, utils_1.sendNotification)(notification, 'mcp-get-enabled-servers');
}
/**
 * Sends a get enabled MCP servers result notification
 * @param content - The result content or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
function GetEnabledMCPServersResultNotify(content, isError = false, toolUseId) {
    if (!toolUseId) {
        console.error('[McpNotifications] toolUseId is required for response notifications');
        return;
    }
    const notification = {
        toolUseId,
        type: enum_1.NotificationEventType.MCP_NOTIFY,
        action: enum_1.McpNotificationAction.GET_ENABLED_MCP_SERVERS_RESULT,
        content,
        isError
    };
    (0, utils_1.sendNotification)(notification, 'mcp-get-enabled-servers-result');
}
// ===== LIST TOOLS FROM MCP SERVERS FUNCTIONS =====
/**
 * Sends a list tools from MCP servers request notification
 * @param toolboxes - Array of toolbox names to list tools from
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
function ListToolsFromMCPServersRequestNotify(toolboxes, toolUseId) {
    // Validate required fields
    if (!(0, utils_1.validateRequiredFields)({ toolboxes }, ['toolboxes'], 'mcp-list-tools')) {
        return;
    }
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.MCP_NOTIFY,
        action: enum_1.McpNotificationAction.LIST_TOOLS_FROM_MCP_SERVERS_REQUEST,
        data: {
            toolboxes: toolboxes
        }
    };
    (0, utils_1.sendNotification)(notification, 'mcp-list-tools');
}
/**
 * Sends a list tools from MCP servers result notification
 * @param content - The result content or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
function ListToolsFromMCPServersResultNotify(content, isError = false, toolUseId) {
    if (!toolUseId) {
        console.error('[McpNotifications] toolUseId is required for response notifications');
        return;
    }
    const notification = {
        toolUseId,
        type: enum_1.NotificationEventType.MCP_NOTIFY,
        action: enum_1.McpNotificationAction.LIST_TOOLS_FROM_MCP_SERVERS_RESULT,
        content,
        isError
    };
    (0, utils_1.sendNotification)(notification, 'mcp-list-tools-result');
}
// ===== GET TOOLS FUNCTIONS =====
/**
 * Sends a get tools request notification
 * @param tools - Array of tools with toolbox and toolName
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
function GetToolsRequestNotify(tools, toolUseId) {
    // Validate required fields
    if (!(0, utils_1.validateRequiredFields)({ tools }, ['tools'], 'mcp-get-tools')) {
        return;
    }
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.MCP_NOTIFY,
        action: enum_1.McpNotificationAction.GET_TOOLS_REQUEST,
        data: {
            tools: tools
        }
    };
    (0, utils_1.sendNotification)(notification, 'mcp-get-tools');
}
/**
 * Sends a get tools result notification
 * @param content - The result content or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
function GetToolsResultNotify(content, isError = false, toolUseId) {
    if (!toolUseId) {
        console.error('[McpNotifications] toolUseId is required for response notifications');
        return;
    }
    const notification = {
        toolUseId,
        type: enum_1.NotificationEventType.MCP_NOTIFY,
        action: enum_1.McpNotificationAction.GET_TOOLS_RESULT,
        content,
        isError
    };
    (0, utils_1.sendNotification)(notification, 'mcp-get-tools-result');
}
// ===== EXECUTE TOOL FUNCTIONS =====
/**
 * Sends an execute tool request notification
 * @param toolbox - The toolbox name
 * @param toolName - The tool name to execute
 * @param params - The parameters for the tool execution
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
function ExecuteToolRequestNotify(toolbox, toolName, params, toolUseId) {
    // Validate required fields
    if (!(0, utils_1.validateRequiredFields)({ toolbox, toolName, params }, ['toolbox', 'toolName', 'params'], 'mcp-execute-tool')) {
        return;
    }
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.MCP_NOTIFY,
        action: enum_1.McpNotificationAction.EXECUTE_TOOL_REQUEST,
        data: {
            toolbox: toolbox,
            toolName: toolName,
            params: params
        }
    };
    (0, utils_1.sendNotification)(notification, 'mcp-execute-tool');
}
/**
 * Sends an execute tool result notification
 * @param content - The result content or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
function ExecuteToolResultNotify(content, isError = false, toolUseId) {
    if (!toolUseId) {
        console.error('[McpNotifications] toolUseId is required for response notifications');
        return;
    }
    const notification = {
        toolUseId,
        type: enum_1.NotificationEventType.MCP_NOTIFY,
        action: enum_1.McpNotificationAction.EXECUTE_TOOL_RESULT,
        content,
        isError
    };
    (0, utils_1.sendNotification)(notification, 'mcp-execute-tool-result');
}
/**
 * MCP notification functions object
 */
exports.mcpNotifications = {
    GetEnabledMCPServersRequestNotify,
    GetEnabledMCPServersResultNotify,
    ListToolsFromMCPServersRequestNotify,
    ListToolsFromMCPServersResultNotify,
    GetToolsRequestNotify,
    GetToolsResultNotify,
    ExecuteToolRequestNotify,
    ExecuteToolResultNotify
};
