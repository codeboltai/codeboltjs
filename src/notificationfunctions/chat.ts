/**
 * Chat Notification Functions
 * 
 * This module provides functions for sending chat-related notifications,
 * including user messages, agent responses, and chat history operations.
 */

import {
    UserMessageRequestNotification,
    AgentTextResponseNotification,
    GetChatHistoryRequestNotification,
    GetChatHistoryResultNotification
} from '../types/notifications/chat';

import { ChatNotifications } from '../types/notificationFunctions/chat';

import {
    sendNotification,
    generateToolUseId,
    validateRequiredFields,
    createErrorResponse,
    createSuccessResponse
} from './utils';


/**
 * Sends a user message request
 * 
 * @param message - The user message
 * @param payload - Optional payload data
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 * 
 * Requirements: 3.1 - WHEN I call `codebolt.notify.chat.UserMessageRequestNotify()` THEN the system SHALL send a UserMessageRequestNotification via WebSocket
 */
export function UserMessageRequestNotify(
    message: string,
    payload?: any,
    toolUseId?: string
): void {
    // Validate required fields
    if (!validateRequiredFields({ message }, ['message'], 'chat.UserMessageRequestNotify')) {
        return;
    }

    // Create the notification
    const notification: UserMessageRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: "chatnotify",
        action: "sendMessageRequest",
        data: {
            message: message,
            payload: payload
        }
    };

    // Send the notification
    sendNotification(notification, 'chat.UserMessageRequestNotify');
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
export function AgentTextResponseNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string,
    data?: AgentTextResponseNotification['data']
): void {
    // Validate content is provided
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for chat.AgentTextResponseNotify');
        return;
    }

    // Create the notification
    const notification: AgentTextResponseNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: "chatnotify",
        action: "agentTextResponse",
        content: content,
        isError: isError,
        data: data
    };

    // Send the notification
    sendNotification(notification, 'chat.AgentTextResponseNotify');
}

/**
 * Requests chat history
 * 
 * @param data - Optional data including sessionId
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 * 
 * Requirements: 3.3 - WHEN I call `codebolt.notify.chat.GetChatHistoryRequestNotify()` THEN the system SHALL send a GetChatHistoryRequestNotification via WebSocket
 */
export function GetChatHistoryRequestNotify(
    data?: GetChatHistoryRequestNotification['data'],
    toolUseId?: string
): void {
    // Create the notification
    const notification: GetChatHistoryRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: "chatnotify",
        action: "getChatHistoryRequest",
        data: data || {}
    };

    // Send the notification
    sendNotification(notification, 'chat.GetChatHistoryRequestNotify');
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
export function GetChatHistoryResultNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    // Validate content is provided
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for chat.GetChatHistoryResultNotify');
        return;
    }

    // Create the notification
    const notification: GetChatHistoryResultNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: "chatnotify",
        action: "getChatHistoryResult",
        content: content,
        isError: isError
    };

    // Send the notification
    sendNotification(notification, 'chat.GetChatHistoryResultNotify');
}

/**
 * Chat notification functions object
 */
export const chatNotifications: ChatNotifications = {
    UserMessageRequestNotify,
    AgentTextResponseNotify,
    GetChatHistoryRequestNotify,
    GetChatHistoryResultNotify
};

// Default export
export default chatNotifications;