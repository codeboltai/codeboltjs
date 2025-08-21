"use strict";
/**
 * LLM Notification Functions
 *
 * This module provides functions for sending LLM-related notifications,
 * including inference requests and token counting operations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.llmNotifications = void 0;
exports.sendInferenceRequest = sendInferenceRequest;
exports.sendInferenceResponse = sendInferenceResponse;
exports.getTokenCount = getTokenCount;
exports.sendTokenCountResponse = sendTokenCountResponse;
const utils_1 = require("./utils");
const enum_1 = require("@codebolt/types/enum");
// ===== LLM INFERENCE FUNCTIONS =====
/**
 * Sends an LLM inference request notification
 * @param data - LLM inference data containing messages, tools, and other parameters
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
function sendInferenceRequest(data, toolUseId) {
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.LLM_NOTIFY,
        action: enum_1.LlmNotificationAction.INFERENCE_REQUEST,
        data
    };
    (0, utils_1.sendNotification)(notification, 'llm-inference-request');
}
/**
 * Sends an LLM inference response notification
 * @param content - The inference result or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
function sendInferenceResponse(content, isError = false, toolUseId) {
    if (!toolUseId) {
        console.error('[LlmNotifications] toolUseId is required for response notifications');
        return;
    }
    const notification = {
        toolUseId,
        type: enum_1.NotificationEventType.LLM_NOTIFY,
        action: enum_1.LlmNotificationAction.INFERENCE_RESULT,
        content,
        isError
    };
    (0, utils_1.sendNotification)(notification, 'llm-inference-response');
}
// ===== LLM TOKEN COUNT FUNCTIONS =====
/**
 * Sends an LLM get token count request notification
 * @param data - Token count request data containing text and optional model/encoding
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
function getTokenCount(data, toolUseId) {
    // Validate required fields
    if (!(0, utils_1.validateRequiredFields)(data, ['text'], 'llm-token-count')) {
        return;
    }
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.LLM_NOTIFY,
        action: enum_1.LlmNotificationAction.GET_TOKEN_COUNT_REQUEST,
        data
    };
    (0, utils_1.sendNotification)(notification, 'llm-token-count-request');
}
/**
 * Sends an LLM get token count response notification
 * @param content - The token count result or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 * @param data - Optional additional data containing token count details
 */
function sendTokenCountResponse(content, isError = false, toolUseId, data) {
    if (!toolUseId) {
        console.error('[LlmNotifications] toolUseId is required for response notifications');
        return;
    }
    const notification = {
        toolUseId,
        type: enum_1.NotificationEventType.LLM_NOTIFY,
        action: enum_1.LlmNotificationAction.GET_TOKEN_COUNT_RESULT,
        content,
        isError,
        ...(data && { data })
    };
    (0, utils_1.sendNotification)(notification, 'llm-token-count-response');
}
/**
 * LLM notification functions object
 */
exports.llmNotifications = {
    sendInferenceRequest,
    sendInferenceResponse,
    getTokenCount,
    sendTokenCountResponse
};
