/**
 * LLM Notification Functions
 * 
 * This module provides functions for sending LLM-related notifications,
 * including inference requests and token counting operations.
 */

import {
    LLMRequestNotification,
    LLMResponseNotification,
    LLMGetTokenCountRequestNotification,
    LLMGetTokenCountResponseNotification
} from '../types/notifications/llm';

import { LlmNotifications } from '../types/notificationFunctions/llm';

import {
    sendNotification,
    generateToolUseId,
    validateRequiredFields
} from './utils';
import { LlmNotificationAction, NotificationEventType } from '@codebolt/types';


// ===== LLM INFERENCE FUNCTIONS =====

/**
 * Sends an LLM inference request notification
 * @param data - LLM inference data containing messages, tools, and other parameters
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export function sendInferenceRequest(
    data: LLMRequestNotification['data'],
    toolUseId?: string
): void {
    const notification: LLMRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: NotificationEventType.LLM_NOTIFY,
        action: LlmNotificationAction.INFERENCE_REQUEST,
        data
    };

    sendNotification(notification, 'llm-inference-request');
}

/**
 * Sends an LLM inference response notification
 * @param content - The inference result or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export function sendInferenceResponse(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    if (!toolUseId) {
        console.error('[LlmNotifications] toolUseId is required for response notifications');
        return;
    }

    const notification: LLMResponseNotification = {
        toolUseId,
        type: NotificationEventType.LLM_NOTIFY,
        action: LlmNotificationAction.INFERENCE_RESULT,
        content,
        isError
    };

    sendNotification(notification, 'llm-inference-response');
}

// ===== LLM TOKEN COUNT FUNCTIONS =====

/**
 * Sends an LLM get token count request notification
 * @param data - Token count request data containing text and optional model/encoding
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export function getTokenCount(
    data: LLMGetTokenCountRequestNotification['data'],
    toolUseId?: string
): void {
    // Validate required fields
    if (!validateRequiredFields(data, ['text'], 'llm-token-count')) {
        return;
    }

    const notification: LLMGetTokenCountRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: NotificationEventType.LLM_NOTIFY,
        action: LlmNotificationAction.GET_TOKEN_COUNT_REQUEST,
        data
    };

    sendNotification(notification, 'llm-token-count-request');
}

/**
 * Sends an LLM get token count response notification
 * @param content - The token count result or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 * @param data - Optional additional data containing token count details
 */
export function sendTokenCountResponse(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string,
    data?: LLMGetTokenCountResponseNotification['data']
): void {
    if (!toolUseId) {
        console.error('[LlmNotifications] toolUseId is required for response notifications');
        return;
    }

    const notification: LLMGetTokenCountResponseNotification = {
        toolUseId,
        type: NotificationEventType.LLM_NOTIFY,
        action: LlmNotificationAction.GET_TOKEN_COUNT_RESULT,
        content,
        isError,
        ...(data && { data })
    };

    sendNotification(notification, 'llm-token-count-response');
}

/**
 * LLM notification functions object
 */
export const llmNotifications: LlmNotifications = {
    sendInferenceRequest,
    sendInferenceResponse,
    getTokenCount,
    sendTokenCountResponse
}; 