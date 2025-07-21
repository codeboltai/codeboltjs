/**
 * History Notification Functions
 * 
 * This module provides functions for sending history-related notifications,
 * including conversation summarization operations.
 */

import {
    SummarizePreviousConversationRequestNotification,
    SummarizePreviousConversationResultNotification,
    SummarizeCurentMessageRequestNotification,
    SummarizeCurrentMessageResultNotification
} from '../types/notifications/history';

import {
    sendNotification,
    generateToolUseId,
    validateRequiredFields
} from './utils';

/**
 * Interface for history notification functions
 */
export interface HistoryNotifications {
    summarizePreviousConversation(data?: SummarizePreviousConversationRequestNotification['data'], toolUseId?: string): void;
    sendSummarizePreviousResult(content: string | any, isError?: boolean, toolUseId?: string): void;
    summarizeCurrentMessage(data: SummarizeCurentMessageRequestNotification['data'], toolUseId?: string): void;
    sendSummarizeCurrentResult(content: string | any, isError?: boolean, toolUseId?: string): void;
}

// ===== SUMMARIZE PREVIOUS CONVERSATION FUNCTIONS =====

/**
 * Sends a summarize previous conversation request notification
 * @param data - Optional data object (currently empty but may be extended)
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export function summarizePreviousConversation(
    data: SummarizePreviousConversationRequestNotification['data'] = {},
    toolUseId?: string
): void {
    const notification: SummarizePreviousConversationRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: "historynotify",
        action: "summarizeAllRequest",
        data
    };

    sendNotification(notification, 'history-summarize-previous');
}

/**
 * Sends a summarize previous conversation result notification
 * @param content - The summarization result or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export function sendSummarizePreviousResult(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    if (!toolUseId) {
        console.error('[HistoryNotifications] toolUseId is required for response notifications');
        return;
    }

    const notification: SummarizePreviousConversationResultNotification = {
        toolUseId,
        type: "historynotify",
        action: "summarizeAllResult",
        content,
        isError
    };

    sendNotification(notification, 'history-summarize-previous-result');
}

// ===== SUMMARIZE CURRENT MESSAGE FUNCTIONS =====

/**
 * Sends a summarize current message request notification
 * @param data - Summarization data containing messages and depth
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export function summarizeCurrentMessage(
    data: SummarizeCurentMessageRequestNotification['data'],
    toolUseId?: string
): void {
    // Validate required fields
    if (!validateRequiredFields(data, ['messages', 'depth'], 'history-summarize-current')) {
        return;
    }

    const notification: SummarizeCurentMessageRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: "historynotify",
        action: "summarizeRequest",
        data
    };

    sendNotification(notification, 'history-summarize-current');
}

/**
 * Sends a summarize current message result notification
 * @param content - The summarization result or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export function sendSummarizeCurrentResult(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    if (!toolUseId) {
        console.error('[HistoryNotifications] toolUseId is required for response notifications');
        return;
    }

    const notification: SummarizeCurrentMessageResultNotification = {
        toolUseId,
        type: "historynotify",
        action: "summarizeResult",
        content,
        isError
    };

    sendNotification(notification, 'history-summarize-current-result');
}

/**
 * History notification functions object
 */
export const historyNotifications: HistoryNotifications = {
    summarizePreviousConversation,
    sendSummarizePreviousResult,
    summarizeCurrentMessage,
    sendSummarizeCurrentResult
}; 