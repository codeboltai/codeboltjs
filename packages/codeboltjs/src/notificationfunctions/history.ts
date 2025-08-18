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

import { HistoryNotifications } from '../types/notificationFunctions/history';

import {
    sendNotification,
    generateToolUseId,
    validateRequiredFields
} from './utils';

import { HistoryNotificationAction, NotificationEventType } from '@codebolt/types/enum'; 


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
        type: NotificationEventType.HISTORY_NOTIFY,
        action: HistoryNotificationAction.SUMMARIZE_ALL_REQUEST,
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
        type: NotificationEventType.HISTORY_NOTIFY,
        action: HistoryNotificationAction.SUMMARIZE_ALL_RESULT,
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
        type: NotificationEventType.HISTORY_NOTIFY,
        action: HistoryNotificationAction.SUMMARIZE_REQUEST,
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
        type: NotificationEventType.HISTORY_NOTIFY,
        action: HistoryNotificationAction.SUMMARIZE_RESULT,
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