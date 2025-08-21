"use strict";
/**
 * Chat Notification Functions
 *
 * This module provides functions for sending chat-related notifications,
 * including user messages, agent responses, and chat history operations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatNotifications = void 0;
exports.UserMessageRequestNotify = UserMessageRequestNotify;
exports.AgentTextResponseNotify = AgentTextResponseNotify;
exports.GetChatHistoryRequestNotify = GetChatHistoryRequestNotify;
exports.GetChatHistoryResultNotify = GetChatHistoryResultNotify;
const utils_1 = require("./utils");
const enum_1 = require("@codebolt/types/enum");
/**
 * Sends a user message request
 *
 * @param message - The user message
 * @param payload - Optional payload data
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 *
 * Requirements: 3.1 - WHEN I call `codebolt.notify.chat.UserMessageRequestNotify()` THEN the system SHALL send a UserMessageRequestNotification via WebSocket
 */
function UserMessageRequestNotify(message, payload, toolUseId) {
    // Validate required fields
    if (!(0, utils_1.validateRequiredFields)({ message }, ['message'], 'chat.UserMessageRequestNotify')) {
        return;
    }
    // Create the notification
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.CHAT_NOTIFY,
        action: enum_1.ChatNotificationAction.SEND_MESSAGE_REQUEST,
        data: {
            message: message,
            payload: payload
        }
    };
    // Send the notification
    (0, utils_1.sendNotification)(notification, 'chat.UserMessageRequestNotify');
}
/**
 * Sends an agent text response
 *
 * @param content - The response content (string or any object)
 * @param isError - Whether this is an error response (default: false)
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 * @param data - Optional additional data including message, timestamp, agentId, and conversationId
 *
 * Requirements: 3.2 - WHEN I call `codebolt.notify.chat.AgentTextResponseNotify()` THEN the system SHALL send an AgentTextResponseNotification via WebSocket
 */
function AgentTextResponseNotify(content, isError = false, toolUseId, data) {
    // Validate content is provided
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for chat.AgentTextResponseNotify');
        return;
    }
    // Create the notification
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.CHAT_NOTIFY,
        action: enum_1.ChatNotificationAction.AGENT_TEXT_RESPONSE,
        content: content,
        isError: isError,
        data: data
    };
    // Send the notification
    (0, utils_1.sendNotification)(notification, 'chat.AgentTextResponseNotify');
}
/**
 * Requests chat history
 *
 * @param data - Optional data including sessionId
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 *
 * Requirements: 3.3 - WHEN I call `codebolt.notify.chat.GetChatHistoryRequestNotify()` THEN the system SHALL send a GetChatHistoryRequestNotification via WebSocket
 */
function GetChatHistoryRequestNotify(data, toolUseId) {
    // Create the notification
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.CHAT_NOTIFY,
        action: enum_1.ChatNotificationAction.GET_CHAT_HISTORY_REQUEST,
        data: data || {}
    };
    // Send the notification
    (0, utils_1.sendNotification)(notification, 'chat.GetChatHistoryRequestNotify');
}
/**
 * Sends chat history result
 *
 * @param content - The chat history content (string or any object)
 * @param isError - Whether this is an error response (default: false)
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 *
 * Requirements: 3.4 - WHEN I call `codebolt.notify.chat.GetChatHistoryResultNotify()` THEN the system SHALL send a GetChatHistoryResultNotification via WebSocket
 */
function GetChatHistoryResultNotify(content, isError = false, toolUseId) {
    // Validate content is provided
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for chat.GetChatHistoryResultNotify');
        return;
    }
    // Create the notification
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.CHAT_NOTIFY,
        action: enum_1.ChatNotificationAction.GET_CHAT_HISTORY_RESULT,
        content: content,
        isError: isError
    };
    // Send the notification
    (0, utils_1.sendNotification)(notification, 'chat.GetChatHistoryResultNotify');
}
/**
 * Chat notification functions object
 */
exports.chatNotifications = {
    UserMessageRequestNotify,
    AgentTextResponseNotify,
    GetChatHistoryRequestNotify,
    GetChatHistoryResultNotify
};
// Default export
exports.default = exports.chatNotifications;
