import axios from 'axios';
import { handleError } from '../../utils/errorHandler';
import type { BaseProvider, LLMProvider, ChatCompletionOptions, ChatCompletionResponse, Provider, ChatMessage, ModelInfo } from '../../types';

/**
 * Groq model token limits
 * Based on LiteLLM model_prices_and_context_window.json (2025)
 */
const GROQ_MODEL_TOKEN_LIMITS: Record<string, { tokenLimit: number; maxOutput?: number; supportsTools?: boolean; supportsVision?: boolean; supportsReasoning?: boolean }> = {
  // Llama 4 series (latest)
  'meta-llama/llama-4-maverick-17b-128e-instruct': { tokenLimit: 131072, maxOutput: 8192, supportsVision: true, supportsTools: true },
  'meta-llama/llama-4-scout-17b-16e-instruct': { tokenLimit: 131072, maxOutput: 8192, supportsVision: true, supportsTools: true },
  // Llama 3.3 series
  'llama-3.3-70b-versatile': { tokenLimit: 128000, maxOutput: 32768, supportsTools: true },
  'llama-3.3-70b-specdec': { tokenLimit: 8192, maxOutput: 8192 },
  // Llama 3.2 series
  'llama-3.2-90b-vision-preview': { tokenLimit: 8192, maxOutput: 8192 },
  'llama-3.2-11b-vision-preview': { tokenLimit: 8192, maxOutput: 8192 },
  'llama-3.2-3b-preview': { tokenLimit: 8192, maxOutput: 8192 },
  'llama-3.2-1b-preview': { tokenLimit: 8192, maxOutput: 8192 },
  // Llama 3.1 series
  'llama-3.1-70b-versatile': { tokenLimit: 128000, maxOutput: 8192, supportsTools: true },
  'llama-3.1-8b-instant': { tokenLimit: 128000, maxOutput: 8192, supportsTools: true },
  // Llama Guard
  'meta-llama/llama-guard-4-12b': { tokenLimit: 8192, maxOutput: 8192 },
  // Llama 3 series
  'llama3-70b-8192': { tokenLimit: 8192, maxOutput: 8192, supportsTools: true },
  'llama3-8b-8192': { tokenLimit: 8192, maxOutput: 8192, supportsTools: true },
  // Llama 2 series (legacy)
  'llama2-70b-4096': { tokenLimit: 4096, maxOutput: 4096 },
  // Mixtral
  'mixtral-8x7b-32768': { tokenLimit: 32768, maxOutput: 32768, supportsTools: true },
  // Qwen series
  'qwen/qwen3-32b': { tokenLimit: 131000, maxOutput: 131000, supportsTools: true, supportsReasoning: true },
  // GPT-OSS models
  'openai/gpt-oss-120b': { tokenLimit: 131072, maxOutput: 32766, supportsTools: true, supportsReasoning: true },
  'openai/gpt-oss-20b': { tokenLimit: 131072, maxOutput: 32768, supportsTools: true, supportsReasoning: true },
  // Moonshot/Kimi
  'moonshotai/kimi-k2-instruct-0905': { tokenLimit: 262144, maxOutput: 16384, supportsTools: true },
  // Gemma
  'gemma2-9b-it': { tokenLimit: 8192, maxOutput: 8192, supportsTools: true },
  'gemma-7b-it': { tokenLimit: 8192, maxOutput: 8192, supportsTools: true },
};

interface GroqErrorResponse {
  error: {
    message: string;
    type?: string;
    code?: string;
  };
}

interface GroqMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

function transformMessages(messages: ChatMessage[]): GroqMessage[] {
  return messages.map(message => ({
    role: message.role === 'function' || message.role === 'tool' ? 'user' : 
          message.role === 'assistant' ? 'assistant' : 
          message.role === 'system' ? 'system' : 'user',
    content: message.content || ''
  }));
}

class Groq implements LLMProvider {
  private defaultModels: string[];
  public model: string | null;
  public device_map: string | null;
  public apiKey: string | null;
  public apiEndpoint: string | null;
  public provider: "groq";

  constructor(
    model: string | null = null,
    device_map: string | null = null,
    apiKey: string | null = null,
    apiEndpoint: string | null = null
  ) {
    this.defaultModels = [
      "mixtral-8x7b-32768",
      "llama2-70b-4096",
      "gemma-7b-it"
    ];
    this.model = model || "mixtral-8x7b-32768";
    this.device_map = device_map;
    this.apiKey = apiKey;
    this.apiEndpoint = apiEndpoint ?? "https://api.groq.com/v1";
    this.provider = "groq";
  }

  async createCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    try {
      if (!options.messages || options.messages.length === 0) {
        throw new Error("Messages array must not be empty");
      }

      if (!this.apiKey) {
        throw new Error("API key is required");
      }

      const response = await axios.post(
        `${this.apiEndpoint}/chat/completions`,
        {
          model: options.model || this.model || "mixtral-8x7b-32768",
          messages: transformMessages(options.messages),
          temperature: options.temperature,
          max_tokens: options.max_tokens,
          top_p: options.top_p,
          stream: options.stream,
          stop: options.stop
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`
          }
        }
      );

      if (options.stream) {
        return {
          id: 'stream',
          object: 'chat.completion.chunk',
          created: Date.now(),
          model: options.model || this.model || "mixtral-8x7b-32768",
          choices: [{
            index: 0,
            message: {
              role: 'assistant',
              content: ''
            },
            finish_reason: null
          }],
          usage: {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0
          }
        };
      }

      const modelId = options.model || this.model || "mixtral-8x7b-32768";
      const limits = GROQ_MODEL_TOKEN_LIMITS[modelId];

      return {
        id: response.data.id,
        object: 'chat.completion',
        created: response.data.created,
        model: response.data.model,
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: response.data.choices[0].message.content
          },
          finish_reason: response.data.choices[0].finish_reason
        }],
        usage: response.data.usage,
        tokenLimit: limits?.tokenLimit,
        maxOutputTokens: limits?.maxOutput
      };
    } catch (error) {
      const errorResponse = handleError(error) as { error: string | GroqErrorResponse['error'] };
      if (typeof errorResponse.error === 'object' && 'message' in errorResponse.error) {
        throw new Error(errorResponse.error.message);
      } else {
        throw new Error(String(errorResponse.error));
      }
    }
  }

  async getModels(): Promise<ModelInfo[]> {
    return this.defaultModels.map(modelId => {
      const limits = GROQ_MODEL_TOKEN_LIMITS[modelId];
      return {
        id: modelId,
        name: modelId,
        provider: "Groq",
        type: 'chat' as const,
        tokenLimit: limits?.tokenLimit,
        maxOutputTokens: limits?.maxOutput,
        supportsTools: limits?.supportsTools,
        supportsVision: limits?.supportsVision,
        supportsReasoning: limits?.supportsReasoning
      };
    });
  }
}

export default Groq; 