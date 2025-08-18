/**
 * LLM SDK Function Types
 * Types for the cbllm module functions
 */

// Base response interface for LLM operations
export interface BaseLLMSDKResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

// LLM response interface
export interface LLMResponse extends BaseLLMSDKResponse {
  content: string;
  role: 'assistant';
  model?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  finish_reason?: string;
  choices?: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
}
