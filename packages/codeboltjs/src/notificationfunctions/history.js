"use strict";
/**
 * History Notification Functions
 *
 * This module provides functions for sending history-related notifications,
 * including conversation summarization operations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.historyNotifications = void 0;
exports.summarizePreviousConversation = summarizePreviousConversation;
exports.sendSummarizePreviousResult = sendSummarizePreviousResult;
exports.summarizeCurrentMessage = summarizeCurrentMessage;
exports.sendSummarizeCurrentResult = sendSummarizeCurrentResult;
const utils_1 = require("./utils");
const enum_1 = require("@codebolt/types/enum");
// ===== SUMMARIZE PREVIOUS CONVERSATION FUNCTIONS =====
/**
 * Sends a summarize previous conversation request notification
 * @param data - Optional data object (currently empty but may be extended)
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
function summarizePreviousConversation(data = {}, toolUseId) {
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.HISTORY_NOTIFY,
        action: enum_1.HistoryNotificationAction.SUMMARIZE_ALL_REQUEST,
        data
    };
    (0, utils_1.sendNotification)(notification, 'history-summarize-previous');
}
/**
 * Sends a summarize previous conversation result notification
 * @param content - The summarization result or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
function sendSummarizePreviousResult(content, isError = false, toolUseId) {
    if (!toolUseId) {
        console.error('[HistoryNotifications] toolUseId is required for response notifications');
        return;
    }
    const notification = {
        toolUseId,
        type: enum_1.NotificationEventType.HISTORY_NOTIFY,
        action: enum_1.HistoryNotificationAction.SUMMARIZE_ALL_RESULT,
        content,
        isError
    };
    (0, utils_1.sendNotification)(notification, 'history-summarize-previous-result');
}
// ===== SUMMARIZE CURRENT MESSAGE FUNCTIONS =====
/**
 * Sends a summarize current message request notification
 * @param data - Summarization data containing messages and depth
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
function summarizeCurrentMessage(data, toolUseId) {
    // Validate required fields
    if (!(0, utils_1.validateRequiredFields)(data, ['messages', 'depth'], 'history-summarize-current')) {
        return;
    }
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.HISTORY_NOTIFY,
        action: enum_1.HistoryNotificationAction.SUMMARIZE_REQUEST,
        data
    };
    (0, utils_1.sendNotification)(notification, 'history-summarize-current');
}
/**
 * Sends a summarize current message result notification
 * @param content - The summarization result or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
function sendSummarizeCurrentResult(content, isError = false, toolUseId) {
    if (!toolUseId) {
        console.error('[HistoryNotifications] toolUseId is required for response notifications');
        return;
    }
    const notification = {
        toolUseId,
        type: enum_1.NotificationEventType.HISTORY_NOTIFY,
        action: enum_1.HistoryNotificationAction.SUMMARIZE_RESULT,
        content,
        isError
    };
    (0, utils_1.sendNotification)(notification, 'history-summarize-current-result');
}
/**
 * History notification functions object
 */
exports.historyNotifications = {
    summarizePreviousConversation,
    sendSummarizePreviousResult,
    summarizeCurrentMessage,
    sendSummarizeCurrentResult
};
