/**
 * Terminal Notification Functions
 * 
 * This module provides functions for sending terminal-related notifications,
 * including command execution operations.
 */

import {
    CommandExecutionRequestNotification,
    CommandExecutionResponseNotification
} from '../types/notifications/terminal';

import { TerminalNotifications } from '../types/notificationFunctions/terminal';

import {
    sendNotification,
    generateToolUseId,
    validateRequiredFields
} from './utils';


// ===== COMMAND EXECUTION FUNCTIONS =====

/**
 * Sends a command execution request notification
 * @param command - The command to execute
 * @param returnEmptyStringOnSuccess - Optional flag to return empty string on success
 * @param executeInMain - Optional flag to execute in main terminal
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export function CommandExecutionRequestNotify(
    command: string,
    returnEmptyStringOnSuccess?: boolean,
    executeInMain?: boolean,
    toolUseId?: string
): void {
    // Validate required fields
    if (!validateRequiredFields({ command }, ['command'], 'terminal-command-execution')) {
        return;
    }

    const notification: CommandExecutionRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: "terminalnotify",
        action: "executeCommandRequest",
        data: {
            command: command,
            returnEmptyStringOnSuccess: returnEmptyStringOnSuccess,
            executeInMain: executeInMain
        }
    };

    sendNotification(notification, 'terminal-command-execution');
}

/**
 * Sends a command execution response notification
 * @param content - The command execution result or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export function CommandExecutionResponseNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    if (!toolUseId) {
        console.error('[TerminalNotifications] toolUseId is required for response notifications');
        return;
    }

    const notification: CommandExecutionResponseNotification = {
        toolUseId,
        type: "terminalnotify",
        action: "executeCommandResult",
        content,
        isError
    };

    sendNotification(notification, 'terminal-command-execution-response');
}

/**
 * Terminal notification functions object
 */
export const terminalNotifications: TerminalNotifications = {
    CommandExecutionRequestNotify,
    CommandExecutionResponseNotify
}; 