/**
 * History Notification Functions
 *
 * This module provides functions for sending history-related notifications,
 * including conversation summarization operations.
 */
import { SummarizePreviousConversationRequestNotification, SummarizeCurentMessageRequestNotification } from '../types/notifications/history';
import { HistoryNotifications } from '../types/notificationFunctions/history';
/**
 * Sends a summarize previous conversation request notification
 * @param data - Optional data object (currently empty but may be extended)
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export declare function summarizePreviousConversation(data?: SummarizePreviousConversationRequestNotification['data'], toolUseId?: string): void;
/**
 * Sends a summarize previous conversation result notification
 * @param content - The summarization result or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export declare function sendSummarizePreviousResult(content: string | any, isError?: boolean, toolUseId?: string): void;
/**
 * Sends a summarize current message request notification
 * @param data - Summarization data containing messages and depth
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export declare function summarizeCurrentMessage(data: SummarizeCurentMessageRequestNotification['data'], toolUseId?: string): void;
/**
 * Sends a summarize current message result notification
 * @param content - The summarization result or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export declare function sendSummarizeCurrentResult(content: string | any, isError?: boolean, toolUseId?: string): void;
/**
 * History notification functions object
 */
export declare const historyNotifications: HistoryNotifications;
