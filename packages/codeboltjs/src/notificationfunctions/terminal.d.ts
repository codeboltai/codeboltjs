/**
 * Terminal Notification Functions
 *
 * This module provides functions for sending terminal-related notifications,
 * including command execution operations.
 */
import { TerminalNotifications } from '../types/notificationFunctions/terminal';
/**
 * Sends a command execution request notification
 * @param command - The command to execute
 * @param returnEmptyStringOnSuccess - Optional flag to return empty string on success
 * @param executeInMain - Optional flag to execute in main terminal
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export declare function CommandExecutionRequestNotify(command: string, returnEmptyStringOnSuccess?: boolean, executeInMain?: boolean, toolUseId?: string): void;
/**
 * Sends a command execution response notification
 * @param content - The command execution result or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export declare function CommandExecutionResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
/**
 * Terminal notification functions object
 */
export declare const terminalNotifications: TerminalNotifications;
