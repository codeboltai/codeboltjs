import { LLMRequestNotification, LLMGetTokenCountRequestNotification, LLMGetTokenCountResponseNotification } from '../notifications/llm';
/**
 * Interface for LLM notification functions
 */
export interface LlmNotifications {
    sendInferenceRequest(data: LLMRequestNotification['data'], toolUseId?: string): void;
    sendInferenceResponse(content: string | any, isError?: boolean, toolUseId?: string): void;
    getTokenCount(data: LLMGetTokenCountRequestNotification['data'], toolUseId?: string): void;
    sendTokenCountResponse(content: string | any, isError?: boolean, toolUseId?: string, data?: LLMGetTokenCountResponseNotification['data']): void;
}
