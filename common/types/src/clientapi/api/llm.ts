// LLM API types

export interface LLMProvider {
  id: string;
  name: string;
  displayName: string;
  type: string;
  apiKey?: string;
  baseUrl?: string;
  isEnabled: boolean;
  models?: LLMModel[];
  config?: Record<string, unknown>;
}

export interface LLMModel {
  id: string;
  name: string;
  displayName?: string;
  providerId: string;
  contextWindow?: number;
  maxOutputTokens?: number;
  supportsVision?: boolean;
  supportsTools?: boolean;
  isDefault?: boolean;
}

export interface LLMConfig {
  providerId: string;
  modelId: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
}

export interface LLMChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | unknown[];
  name?: string;
  toolCallId?: string;
}

export interface LLMChatRequest {
  messages: LLMChatMessage[];
  config?: LLMConfig;
  stream?: boolean;
}

export interface LLMChatResponse {
  id: string;
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
}

export interface LLMPricingInfo {
  providerId: string;
  modelId: string;
  inputCostPer1k?: number;
  outputCostPer1k?: number;
}

export interface LLMUpdateKeyRequest {
  providerId: string;
  apiKey: string;
}

export interface LLMSetDefaultRequest {
  providerId: string;
  modelId: string;
}

export interface LLMGetModelsRequest {
  providerId: string;
}

export interface LLMDownloadModelRequest {
  modelId: string;
  providerId?: string;
}

export interface LLMCancelDownloadRequest {
  modelId: string;
}

export interface LLMDownloadStatus {
  modelId: string;
  status: string;
  progress?: number;
}

export interface LLMLocalAgentConfig {
  agentName: string;
  providerId?: string;
  modelId?: string;
  [key: string]: unknown;
}
