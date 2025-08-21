"use strict";
/**
 * Terminal Notification Functions
 *
 * This module provides functions for sending terminal-related notifications,
 * including command execution operations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.terminalNotifications = void 0;
exports.CommandExecutionRequestNotify = CommandExecutionRequestNotify;
exports.CommandExecutionResponseNotify = CommandExecutionResponseNotify;
const utils_1 = require("./utils");
const enum_1 = require("@codebolt/types/enum");
// ===== COMMAND EXECUTION FUNCTIONS =====
/**
 * Sends a command execution request notification
 * @param command - The command to execute
 * @param returnEmptyStringOnSuccess - Optional flag to return empty string on success
 * @param executeInMain - Optional flag to execute in main terminal
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
function CommandExecutionRequestNotify(command, returnEmptyStringOnSuccess, executeInMain, toolUseId) {
    // Validate required fields
    if (!(0, utils_1.validateRequiredFields)({ command }, ['command'], 'terminal-command-execution')) {
        return;
    }
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.TERMINAL_NOTIFY,
        action: enum_1.TerminalNotificationAction.EXECUTE_COMMAND_REQUEST,
        data: {
            command: command,
            returnEmptyStringOnSuccess: returnEmptyStringOnSuccess,
            executeInMain: executeInMain
        }
    };
    (0, utils_1.sendNotification)(notification, 'terminal-command-execution');
}
/**
 * Sends a command execution response notification
 * @param content - The command execution result or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
function CommandExecutionResponseNotify(content, isError = false, toolUseId) {
    if (!toolUseId) {
        console.error('[TerminalNotifications] toolUseId is required for response notifications');
        return;
    }
    const notification = {
        toolUseId,
        type: enum_1.NotificationEventType.TERMINAL_NOTIFY,
        action: enum_1.TerminalNotificationAction.EXECUTE_COMMAND_RESULT,
        content,
        isError
    };
    (0, utils_1.sendNotification)(notification, 'terminal-command-execution-response');
}
/**
 * Terminal notification functions object
 */
exports.terminalNotifications = {
    CommandExecutionRequestNotify,
    CommandExecutionResponseNotify
};
