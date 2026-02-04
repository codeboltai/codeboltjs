import axios from 'axios';
import { handleError } from '../../utils/errorHandler';
import type { BaseProvider, LLMProvider, ChatCompletionOptions, ChatCompletionResponse, Provider, ChatMessage, ModelInfo } from '../../types';

/**
 * Grok model token limits
 * Based on LiteLLM model_prices_and_context_window.json (2025)
 */
const GROK_MODEL_TOKEN_LIMITS: Record<string, { tokenLimit: number; maxOutput: number; supportsTools?: boolean; supportsVision?: boolean; supportsReasoning?: boolean }> = {
  // Grok 4 series (latest)
  'grok-4': { tokenLimit: 256000, maxOutput: 256000, supportsTools: true },
  // Grok 3 series (reasoning)
  'grok-3': { tokenLimit: 131072, maxOutput: 131072, supportsTools: true },
  'grok-3-mini': { tokenLimit: 131072, maxOutput: 131072, supportsTools: true, supportsReasoning: true },
  'grok-3-fast': { tokenLimit: 131072, maxOutput: 131072, supportsTools: true },
  'grok-3-mini-fast': { tokenLimit: 131072, maxOutput: 131072, supportsTools: true, supportsReasoning: true },
  // Grok 2 series
  'grok-2': { tokenLimit: 32768, maxOutput: 32768, supportsTools: true },
  'grok-2-mini': { tokenLimit: 131072, maxOutput: 131072, supportsTools: true },
  'grok-2-vision': { tokenLimit: 32768, maxOutput: 32768, supportsVision: true, supportsTools: true },
  'grok-2-vision-1212': { tokenLimit: 32768, maxOutput: 32768, supportsVision: true, supportsTools: true },
  'grok-2-1212': { tokenLimit: 131072, maxOutput: 131072, supportsTools: true },
  // Grok vision
  'grok-vision-beta': { tokenLimit: 8192, maxOutput: 8192, supportsVision: true },
  // Grok beta
  'grok-beta': { tokenLimit: 131072, maxOutput: 8192, supportsTools: true },
};

interface GrokMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

function transformMessages(messages: ChatMessage[]): GrokMessage[] {
  return messages.map(message => ({
    role: message.role === 'function' || message.role === 'tool' ? 'user' : 
          message.role === 'assistant' ? 'assistant' : 
          message.role === 'system' ? 'system' : 'user',
    content: message.content || ''
  }));
}

class Grok implements LLMProvider {
  private defaultModels: string[];
  public model: string | null;
  public device_map: string | null;
  public apiKey: string | null;
  public apiEndpoint: string | null;
  public provider: "grok";

  constructor(
    model: string | null = null,
    device_map: string | null = null,
    apiKey: string | null = null,
    apiEndpoint: string | null = null
  ) {
    this.defaultModels = ["grok-2"];
    this.model = model || "grok-2";
    this.device_map = device_map;
    this.apiKey = apiKey;
    this.apiEndpoint = apiEndpoint ?? "https://api.grok.x.ai/v1";
    this.provider = "grok";
  }

  async createCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    try {
      const response = await axios.post(
        `${this.apiEndpoint}/chat/completions`,
        {
          model: options.model || this.model || "grok-2",
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

      const modelId = options.model || this.model || "grok-2";
      const limits = GROK_MODEL_TOKEN_LIMITS[modelId];

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
      throw handleError(error);
    }
  }

  async getModels(): Promise<ModelInfo[]> {
    return this.defaultModels.map(modelId => {
      const limits = GROK_MODEL_TOKEN_LIMITS[modelId];
      return {
        id: modelId,
        name: modelId,
        provider: "Grok",
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

export default Grok; 