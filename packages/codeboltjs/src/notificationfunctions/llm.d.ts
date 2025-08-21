/**
 * LLM Notification Functions
 *
 * This module provides functions for sending LLM-related notifications,
 * including inference requests and token counting operations.
 */
import { LLMRequestNotification, LLMGetTokenCountRequestNotification, LLMGetTokenCountResponseNotification } from '../types/notifications/llm';
import { LlmNotifications } from '../types/notificationFunctions/llm';
/**
 * Sends an LLM inference request notification
 * @param data - LLM inference data containing messages, tools, and other parameters
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export declare function sendInferenceRequest(data: LLMRequestNotification['data'], toolUseId?: string): void;
/**
 * Sends an LLM inference response notification
 * @param content - The inference result or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export declare function sendInferenceResponse(content: string | any, isError?: boolean, toolUseId?: string): void;
/**
 * Sends an LLM get token count request notification
 * @param data - Token count request data containing text and optional model/encoding
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export declare function getTokenCount(data: LLMGetTokenCountRequestNotification['data'], toolUseId?: string): void;
/**
 * Sends an LLM get token count response notification
 * @param content - The token count result or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 * @param data - Optional additional data containing token count details
 */
export declare function sendTokenCountResponse(content: string | any, isError?: boolean, toolUseId?: string, data?: LLMGetTokenCountResponseNotification['data']): void;
/**
 * LLM notification functions object
 */
export declare const llmNotifications: LlmNotifications;
