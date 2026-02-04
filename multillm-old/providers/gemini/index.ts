import axios from 'axios';
import { handleError } from '../../utils/errorHandler';
import type { BaseProvider, LLMProvider, ChatCompletionOptions, ChatCompletionResponse, Provider, ChatMessage, ModelInfo } from '../../types';

/**
 * Gemini model token limits
 * Based on LiteLLM model_prices_and_context_window.json (2025)
 */
const GEMINI_MODEL_TOKEN_LIMITS: Record<string, { tokenLimit: number; maxOutput: number; supportsVision?: boolean; supportsTools?: boolean; supportsReasoning?: boolean }> = {
  // Gemini 3.0 series (preview)
  'gemini-3-pro-preview': { tokenLimit: 1048576, maxOutput: 65535, supportsVision: true, supportsTools: true, supportsReasoning: true },
  'gemini-3-flash-preview': { tokenLimit: 1048576, maxOutput: 65535, supportsVision: true, supportsTools: true, supportsReasoning: true },
  // Gemini 2.5 series
  'gemini-2.5-pro': { tokenLimit: 1048576, maxOutput: 65535, supportsVision: true, supportsTools: true, supportsReasoning: true },
  'gemini-2.5-flash': { tokenLimit: 1048576, maxOutput: 65535, supportsVision: true, supportsTools: true, supportsReasoning: true },
  'gemini-2.5-flash-lite': { tokenLimit: 1048576, maxOutput: 65535, supportsVision: true, supportsTools: true, supportsReasoning: true },
  // Gemini 2.0 series
  'gemini-2.0-flash': { tokenLimit: 1048576, maxOutput: 8192, supportsVision: true, supportsTools: true },
  'gemini-2.0-flash-001': { tokenLimit: 1048576, maxOutput: 8192, supportsVision: true, supportsTools: true },
  'gemini-2.0-flash-exp': { tokenLimit: 1048576, maxOutput: 8192, supportsVision: true, supportsTools: true },
  'gemini-2.0-flash-lite': { tokenLimit: 1048576, maxOutput: 8192, supportsVision: true, supportsTools: true },
  'gemini-2.0-flash-thinking-exp': { tokenLimit: 1048576, maxOutput: 65536, supportsVision: true },
  'gemini-2.0-flash-thinking-exp-01-21': { tokenLimit: 1048576, maxOutput: 65536, supportsVision: true },
  // Gemini 1.5 series
  'gemini-1.5-flash': { tokenLimit: 1048576, maxOutput: 8192, supportsVision: true, supportsTools: true },
  'gemini-1.5-flash-001': { tokenLimit: 1048576, maxOutput: 8192, supportsVision: true, supportsTools: true },
  'gemini-1.5-flash-002': { tokenLimit: 1048576, maxOutput: 8192, supportsVision: true, supportsTools: true },
  'gemini-1.5-flash-8b': { tokenLimit: 1048576, maxOutput: 8192, supportsVision: true, supportsTools: true },
  'gemini-1.5-flash-latest': { tokenLimit: 1048576, maxOutput: 8192, supportsVision: true, supportsTools: true },
  'gemini-1.5-pro': { tokenLimit: 2097152, maxOutput: 8192, supportsVision: true, supportsTools: true },
  'gemini-1.5-pro-001': { tokenLimit: 2097152, maxOutput: 8192, supportsVision: true, supportsTools: true },
  'gemini-1.5-pro-002': { tokenLimit: 2097152, maxOutput: 8192, supportsVision: true, supportsTools: true },
  'gemini-1.5-pro-latest': { tokenLimit: 1048576, maxOutput: 8192, supportsVision: true, supportsTools: true },
  // Gemini 1.0 series (legacy)
  'gemini-pro': { tokenLimit: 32768, maxOutput: 8192, supportsTools: true },
  'gemini-pro-vision': { tokenLimit: 16384, maxOutput: 4096, supportsVision: true },
};

interface GeminiMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

function transformMessages(messages: ChatMessage[]): GeminiMessage[] {
  return messages.map(message => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content || '' }]
  }));
}

export class Gemini implements LLMProvider {
  private chatModels = ['gemini-2.0-flash', 'gemini-pro', 'gemini-pro-vision'];
  public model: string | null;
  public device_map: string | null;
  public apiKey: string | null;
  public apiEndpoint: string | null;
  public provider: "gemini";

  constructor(
    model: string | null = null,
    device_map: string | null = null,
    apiKey: string | null = null,
    apiEndpoint: string | null = null
  ) {
    this.model = model || 'gemini-2.0-flash';
    this.device_map = device_map;
    this.apiKey = apiKey;
    this.apiEndpoint = apiEndpoint ?? 'https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/google-ai-studio';
    this.provider = "gemini";
  }

  get name(): string {
    return 'gemini';
  }

  get id(): number {
    return 2;
  }

  get logo(): string {
    return 'gemini-logo.png';
  }

  get category(): 'cloudProviders' | 'localProviders' | 'codebolt' {
    return 'cloudProviders';
  }

  get keyAdded(): boolean {
    return !!this.apiKey;
  }

  private transformToGeminiRequest(options: ChatCompletionOptions) {
    return {
      contents: transformMessages(options.messages),
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_NONE"
        }
      ],
      generationConfig: {
        temperature: options.temperature,
        topP: options.top_p,
        maxOutputTokens: options.max_tokens,
        topK: 40,
        stopSequences: options.stop ? (Array.isArray(options.stop) ? options.stop : [options.stop]) : []
      }
    };
  }

  private transformFromGeminiResponse(response: any, modelName: string): ChatCompletionResponse {
    return {
      id: `gemini-${Date.now()}`,
      object: 'chat.completion',
      created: Date.now(),
      model: modelName,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: response.data.candidates[0].content.parts[0].text
        },
        finish_reason: 'stop'
      }],
      usage: {
        prompt_tokens: response.data.usageMetadata?.promptTokenCount || 0,
        completion_tokens: response.data.usageMetadata?.candidatesTokenCount || 0,
        total_tokens: (response.data.usageMetadata?.promptTokenCount || 0) + (response.data.usageMetadata?.candidatesTokenCount || 0)
      }
    };
  }

  async createCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    try {
      if (!this.apiKey) {
        throw new Error('API key is required for Gemini');
      }

      if (!options.messages || options.messages.length === 0) {
        throw new Error('At least one message is required');
      }

      const modelName = options.model || this.model || 'gemini-pro';

      // Validate model name before making the API call
      if (!this.chatModels.includes(modelName)) {
        throw new Error(`Model ${modelName} not found. Available models: ${this.chatModels.join(', ')}`);
      }

      try {
        const response = await axios.post(
          `${this.apiEndpoint}/v1/models/${modelName}:generateContent`,
          this.transformToGeminiRequest(options),
          {
            headers: {
              'x-goog-api-key': this.apiKey,
              'Content-Type': 'application/json'
            }
          }
        );

        const geminiResponse = this.transformFromGeminiResponse(response, modelName);
        const limits = GEMINI_MODEL_TOKEN_LIMITS[modelName];
        geminiResponse.tokenLimit = limits?.tokenLimit;
        geminiResponse.maxOutputTokens = limits?.maxOutput;
        return geminiResponse;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401 || error.response?.status === 403) {
            throw new Error('Invalid API key');
          }
          if (error.response?.status === 404) {
            throw new Error(`Model ${modelName} not found`);
          }
          throw new Error(error.response?.data?.error?.message || error.message);
        }
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }

  async getModels(): Promise<ModelInfo[]> {
    return this.chatModels.map(modelId => {
      const limits = GEMINI_MODEL_TOKEN_LIMITS[modelId];
      return {
        id: modelId,
        name: modelId,
        provider: 'Gemini',
        type: 'chat' as const,
        tokenLimit: limits?.tokenLimit,
        maxOutputTokens: limits?.maxOutput,
        supportsVision: limits?.supportsVision,
        supportsTools: limits?.supportsTools,
        supportsReasoning: limits?.supportsReasoning
      };
    });
  }
}

export default Gemini; 