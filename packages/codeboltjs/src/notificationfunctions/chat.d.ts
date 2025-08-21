/**
 * Chat Notification Functions
 *
 * This module provides functions for sending chat-related notifications,
 * including user messages, agent responses, and chat history operations.
 */
import { AgentTextResponseNotification, GetChatHistoryRequestNotification } from '../types/notifications/chat';
import { ChatNotifications } from '../types/notificationFunctions/chat';
/**
 * Sends a user message request
 *
 * @param message - The user message
 * @param payload - Optional payload data
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 *
 * Requirements: 3.1 - WHEN I call `codebolt.notify.chat.UserMessageRequestNotify()` THEN the system SHALL send a UserMessageRequestNotification via WebSocket
 */
export declare function UserMessageRequestNotify(message: string, payload?: any, toolUseId?: string): void;
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
export declare function AgentTextResponseNotify(content: string | any, isError?: boolean, toolUseId?: string, data?: AgentTextResponseNotification['data']): void;
/**
 * Requests chat history
 *
 * @param data - Optional data including sessionId
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 *
 * Requirements: 3.3 - WHEN I call `codebolt.notify.chat.GetChatHistoryRequestNotify()` THEN the system SHALL send a GetChatHistoryRequestNotification via WebSocket
 */
export declare function GetChatHistoryRequestNotify(data?: GetChatHistoryRequestNotification['data'], toolUseId?: string): void;
/**
 * Sends chat history result
 *
 * @param content - The chat history content (string or any object)
 * @param isError - Whether this is an error response (default: false)
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 *
 * Requirements: 3.4 - WHEN I call `codebolt.notify.chat.GetChatHistoryResultNotify()` THEN the system SHALL send a GetChatHistoryResultNotification via WebSocket
 */
export declare function GetChatHistoryResultNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
/**
 * Chat notification functions object
 */
export declare const chatNotifications: ChatNotifications;
export default chatNotifications;
