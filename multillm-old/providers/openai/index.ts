import axios from 'axios';
import { handleError } from '../../utils/errorHandler';
import { OpenAI as OpenAIApi, AzureOpenAI } from 'openai';
import type { ChatCompletion, ChatCompletionChunk, ChatCompletionCreateParams, ChatCompletionMessageParam, ChatCompletionSystemMessageParam, ChatCompletionUserMessageParam, ChatCompletionAssistantMessageParam, ChatCompletionFunctionMessageParam } from 'openai/resources/chat';
import type { Stream } from 'openai/streaming';
import type { BaseProvider, LLMProvider, ChatCompletionOptions, ChatCompletionResponse, Provider, ChatMessage, ModelInfo } from '../../types';

/**
 * OpenAI model token limits
 * Based on LiteLLM model_prices_and_context_window.json (2025)
 */
const OPENAI_MODEL_TOKEN_LIMITS: Record<string, { tokenLimit: number; maxOutput?: number; supportsVision?: boolean; supportsTools?: boolean; supportsReasoning?: boolean }> = {
  // GPT-4.1 series (1M+ context)
  'gpt-4.1': { tokenLimit: 1047576, maxOutput: 32768, supportsVision: true, supportsTools: true },
  'gpt-4.1-2025-04-14': { tokenLimit: 1047576, maxOutput: 32768, supportsVision: true, supportsTools: true },
  'gpt-4.1-mini': { tokenLimit: 1047576, maxOutput: 32768, supportsVision: true, supportsTools: true },
  'gpt-4.1-mini-2025-04-14': { tokenLimit: 1047576, maxOutput: 32768, supportsVision: true, supportsTools: true },
  'gpt-4.1-nano': { tokenLimit: 1047576, maxOutput: 32768, supportsVision: true, supportsTools: true },
  'gpt-4.1-nano-2025-04-14': { tokenLimit: 1047576, maxOutput: 32768, supportsVision: true, supportsTools: true },
  // GPT-4.5 preview
  'gpt-4.5-preview': { tokenLimit: 128000, maxOutput: 16384, supportsVision: true, supportsTools: true },
  'gpt-4.5-preview-2025-02-27': { tokenLimit: 128000, maxOutput: 16384, supportsVision: true, supportsTools: true },
  // GPT-4o series
  'gpt-4o': { tokenLimit: 128000, maxOutput: 16384, supportsVision: true, supportsTools: true },
  'gpt-4o-mini': { tokenLimit: 128000, maxOutput: 16384, supportsVision: true, supportsTools: true },
  'gpt-4o-2024-11-20': { tokenLimit: 128000, maxOutput: 16384, supportsVision: true, supportsTools: true },
  'gpt-4o-2024-08-06': { tokenLimit: 128000, maxOutput: 16384, supportsVision: true, supportsTools: true },
  'gpt-4o-2024-05-13': { tokenLimit: 128000, maxOutput: 4096, supportsVision: true, supportsTools: true },
  'gpt-4o-mini-2024-07-18': { tokenLimit: 128000, maxOutput: 16384, supportsVision: true, supportsTools: true },
  'chatgpt-4o-latest': { tokenLimit: 128000, maxOutput: 4096, supportsVision: true, supportsTools: true },
  // GPT-4 Turbo
  'gpt-4-turbo': { tokenLimit: 128000, maxOutput: 4096, supportsVision: true, supportsTools: true },
  'gpt-4-turbo-2024-04-09': { tokenLimit: 128000, maxOutput: 4096, supportsVision: true, supportsTools: true },
  'gpt-4-turbo-preview': { tokenLimit: 128000, maxOutput: 4096, supportsTools: true },
  'gpt-4-0125-preview': { tokenLimit: 128000, maxOutput: 4096, supportsTools: true },
  'gpt-4-1106-preview': { tokenLimit: 128000, maxOutput: 4096, supportsTools: true },
  'gpt-4-vision-preview': { tokenLimit: 128000, maxOutput: 4096, supportsVision: true },
  // GPT-4 base
  'gpt-4': { tokenLimit: 8192, maxOutput: 4096, supportsTools: true },
  'gpt-4-0613': { tokenLimit: 8192, maxOutput: 4096, supportsTools: true },
  'gpt-4-32k': { tokenLimit: 32768, maxOutput: 4096 },
  'gpt-4-32k-0613': { tokenLimit: 32768, maxOutput: 4096 },
  // GPT-3.5 Turbo
  'gpt-3.5-turbo': { tokenLimit: 16385, maxOutput: 4096, supportsTools: true },
  'gpt-3.5-turbo-0125': { tokenLimit: 16385, maxOutput: 4096, supportsTools: true },
  'gpt-3.5-turbo-1106': { tokenLimit: 16385, maxOutput: 4096, supportsTools: true },
  'gpt-3.5-turbo-16k': { tokenLimit: 16385, maxOutput: 4096 },
  'gpt-3.5-turbo-instruct': { tokenLimit: 4096, maxOutput: 4096 },
  // o1 reasoning models
  'o1': { tokenLimit: 200000, maxOutput: 100000, supportsVision: true, supportsTools: true, supportsReasoning: true },
  'o1-2024-12-17': { tokenLimit: 200000, maxOutput: 100000, supportsVision: true, supportsTools: true, supportsReasoning: true },
  'o1-preview': { tokenLimit: 128000, maxOutput: 32768, supportsVision: true, supportsReasoning: true },
  'o1-preview-2024-09-12': { tokenLimit: 128000, maxOutput: 32768, supportsVision: true, supportsReasoning: true },
  'o1-mini': { tokenLimit: 128000, maxOutput: 65536, supportsVision: true, supportsReasoning: true },
  'o1-mini-2024-09-12': { tokenLimit: 128000, maxOutput: 65536, supportsVision: true, supportsReasoning: true },
  // o3 reasoning models
  'o3': { tokenLimit: 200000, maxOutput: 100000, supportsVision: true, supportsTools: true, supportsReasoning: true },
  'o3-2025-04-16': { tokenLimit: 200000, maxOutput: 100000, supportsVision: true, supportsTools: true, supportsReasoning: true },
  'o3-mini': { tokenLimit: 200000, maxOutput: 100000, supportsTools: true, supportsReasoning: true },
  'o3-mini-2025-01-31': { tokenLimit: 200000, maxOutput: 100000, supportsTools: true, supportsReasoning: true },
  // o4 reasoning models
  'o4-mini': { tokenLimit: 200000, maxOutput: 100000, supportsVision: true, supportsTools: true, supportsReasoning: true },
  'o4-mini-2025-04-16': { tokenLimit: 200000, maxOutput: 100000, supportsVision: true, supportsTools: true, supportsReasoning: true },
  // Embedding models
  'text-embedding-3-small': { tokenLimit: 8191 },
  'text-embedding-3-large': { tokenLimit: 8191 },
  'text-embedding-ada-002': { tokenLimit: 8191 },
};

function transformMessages(messages: ChatMessage[]): ChatCompletionMessageParam[] {
  return messages.map(message => {
    if (message.role === 'function') {
      const functionMessage: ChatCompletionFunctionMessageParam = {
        role: 'function',
        name: message.name || 'unknown',
        content: message.content || ''
      };
      return functionMessage;
    }
    
    if (message.role === 'assistant' && message.tool_calls) {
      const assistantMessage: ChatCompletionAssistantMessageParam = {
        role: 'assistant',
        content: message.content || '',
        tool_calls: message.tool_calls
      };
      return assistantMessage;
    }
    
    if (message.role === 'system') {
      const systemMessage: ChatCompletionSystemMessageParam = {
        role: 'system',
        content: message.content || ''
      };
      return systemMessage;
    }
    
    const userMessage: ChatCompletionUserMessageParam = {
      role: 'user',
      content: message.content || ''
    };
    return userMessage;
  });
}

class OpenAI implements LLMProvider {
  private options: BaseProvider;
  private client: OpenAIApi | AzureOpenAI;
  private embeddingModels: string[];
  private chatModels: string[];
  public model: string | null;
  public device_map: string | null;
  public apiKey: string | null;
  public apiEndpoint: string | null;
  public provider: "openai";

  constructor(
    model: string | null = null,
    device_map: string | null = null,
    apiKey: string | null = null,
    apiEndpoint: string | null = null
  ) {
    this.embeddingModels = ["text-embedding-3-small", "text-embedding-3-large", "text-embedding-ada-002"];
    this.chatModels = ["gpt-4", "gpt-3.5-turbo"];
    this.model = model;
    this.device_map = device_map;
    this.apiKey = apiKey;
    this.apiEndpoint = apiEndpoint ?? "https://api.openai.com/v1";
    this.provider = "openai";
    
    this.options = { model, device_map, apiKey, apiEndpoint: this.apiEndpoint };

    if (this.options.apiEndpoint?.toLowerCase().includes("azure.com")) {
      this.client = new AzureOpenAI({
        baseURL: apiEndpoint,
        apiKey: apiKey ?? undefined,
        apiVersion: "2024-02-15-preview",
      });
    } else {
      this.client = new OpenAIApi({
        baseURL: this.apiEndpoint,
        apiKey: apiKey ?? undefined,
      });
    }
  }

  async createCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    try {
      const modelId = options.model || this.model || "gpt-3.5-turbo";
      const completion = await this.client.chat.completions.create({
        // @ts-ignore
        messages: options.messages,
        model: modelId,
        temperature: options.temperature,
        top_p: options.top_p,
        max_tokens: options.max_tokens,
        stream: options.stream,
        tools: options.tools,
        stop: options.stop,
      });

      const limits = OPENAI_MODEL_TOKEN_LIMITS[modelId];
      const response = completion as unknown as ChatCompletionResponse;
      response.tokenLimit = limits?.tokenLimit;
      response.maxOutputTokens = limits?.maxOutput;
      return response;
    } catch (error) {
      throw handleError(error);
    }
  }

  async getModels(): Promise<ModelInfo[]> {
    try {
      const response = await axios.get(`${this.apiEndpoint}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      return response.data.data
        .map((model: any) => {
          const modelId = model.id;
          const limits = OPENAI_MODEL_TOKEN_LIMITS[modelId];

          // Determine model type
          let type: ModelInfo['type'] = 'chat';
          if (modelId.includes('embedding')) {
            type = 'embedding';
          } else if (modelId.includes('dall-e') || modelId.includes('image')) {
            type = 'image';
          } else if (modelId.includes('whisper') || modelId.includes('tts')) {
            type = 'audio';
          }

          return {
            id: modelId,
            name: modelId,
            provider: "OpenAI",
            type,
            tokenLimit: limits?.tokenLimit,
            maxOutputTokens: limits?.maxOutput,
            supportsVision: limits?.supportsVision,
            supportsTools: limits?.supportsTools,
            supportsReasoning: limits?.supportsReasoning
          };
        });
    } catch (error) {
      throw handleError(error);
    }
  }

  async createEmbedding(input: string | string[], model: string) {
    try {
      const response = await axios.post(
        `${this.apiEndpoint}/embeddings`,
        {
          input,
          model
        },
        {
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${this.apiKey}`
          },
        }
      );

      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }
}

export default OpenAI; 