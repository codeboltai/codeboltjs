import axios from 'axios';
import { handleError } from '../../utils/errorHandler';
import { modelCache } from '../../utils/cacheManager';
import { transformContentForGemini, type GeminiContentPart } from '../../utils/contentTransformer';
import type {
  ChatCompletionOptions,
  ChatCompletionResponse,
  ChatMessage,
  StreamChunk,
  StreamingOptions,
  ProviderCapabilities,
  LLMProviderWithStreaming
} from '../../types';

interface GeminiMessage {
  role: 'user' | 'model';
  parts: GeminiContentPart[];
}

async function transformMessages(messages: ChatMessage[]): Promise<GeminiMessage[]> {
  const result: GeminiMessage[] = [];

  for (const message of messages) {
    const parts = await transformContentForGemini(message.content);
    result.push({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts
    });
  }

  return result;
}

export class Gemini implements LLMProviderWithStreaming {
  private chatModels = ['gemini-2.0-flash', 'gemini-2.0-flash-exp', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro', 'gemini-pro-vision'];
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

  private async transformToGeminiRequest(options: ChatCompletionOptions) {
    return {
      contents: await transformMessages(options.messages),
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
    const usageMetadata = response.data.usageMetadata;
    const promptTokens = usageMetadata?.promptTokenCount || 0;
    const completionTokens = usageMetadata?.candidatesTokenCount || 0;

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
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: promptTokens + completionTokens,
        // Gemini returns cachedContentTokenCount when using context caching
        cached_tokens: usageMetadata?.cachedContentTokenCount,
        // Store raw provider usage
        provider_usage: usageMetadata ? {
          promptTokenCount: usageMetadata.promptTokenCount,
          candidatesTokenCount: usageMetadata.candidatesTokenCount,
          totalTokenCount: usageMetadata.totalTokenCount,
          cachedContentTokenCount: usageMetadata.cachedContentTokenCount
        } : undefined
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
          await this.transformToGeminiRequest(options),
          {
            headers: {
              'x-goog-api-key': this.apiKey,
              'Content-Type': 'application/json'
            }
          }
        );

        return this.transformFromGeminiResponse(response, modelName);
      } catch (error: unknown) {
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

  /**
   * Create completion with streaming support and callbacks
   */
  async createCompletionStream(options: StreamingOptions): Promise<ChatCompletionResponse> {
    const modelName = options.model || this.model || 'gemini-2.0-flash';

    try {
      if (!this.apiKey) {
        throw new Error('API key is required for Gemini');
      }

      const response = await axios.post(
        `${this.apiEndpoint}/v1/models/${modelName}:streamGenerateContent`,
        await this.transformToGeminiRequest(options),
        {
          headers: {
            'x-goog-api-key': this.apiKey,
            'Content-Type': 'application/json'
          },
          responseType: 'stream'
        }
      );

      let fullContent = '';
      let usage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
      const responseId = `gemini-${Date.now()}`;
      let buffer = '';

      return new Promise((resolve, reject) => {
        response.data.on('data', (chunk: any) => {
          if (options.signal?.aborted) {
            response.data.destroy();
            return;
          }

          buffer += chunk.toString();

          // Gemini streams as JSON array chunks
          try {
            // Try to parse accumulated buffer as JSON array
            const parsed = JSON.parse(buffer);
            if (Array.isArray(parsed)) {
              for (const item of parsed) {
                if (item.candidates?.[0]?.content?.parts?.[0]?.text) {
                  const text = item.candidates[0].content.parts[0].text;
                  fullContent += text;

                  const streamChunk: StreamChunk = {
                    id: responseId,
                    object: 'chat.completion.chunk',
                    created: Math.floor(Date.now() / 1000),
                    model: modelName,
                    choices: [{
                      index: 0,
                      delta: { content: text },
                      finish_reason: null
                    }]
                  };

                  options.onChunk?.(streamChunk);
                }

                // Capture usage metadata
                if (item.usageMetadata) {
                  usage = {
                    prompt_tokens: item.usageMetadata.promptTokenCount || 0,
                    completion_tokens: item.usageMetadata.candidatesTokenCount || 0,
                    total_tokens: (item.usageMetadata.promptTokenCount || 0) + (item.usageMetadata.candidatesTokenCount || 0)
                  };
                }
              }
              buffer = ''; // Reset buffer after successful parse
            }
          } catch {
            // Incomplete JSON, continue accumulating
          }
        });

        response.data.on('end', () => {
          const finalResponse: ChatCompletionResponse = {
            id: responseId,
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: modelName,
            choices: [{
              index: 0,
              message: {
                role: 'assistant',
                content: fullContent || null
              },
              finish_reason: 'stop'
            }],
            usage
          };

          options.onComplete?.(finalResponse);
          resolve(finalResponse);
        });

        response.data.on('error', (error: Error) => {
          options.onError?.(error);
          reject(handleError(error));
        });
      });
    } catch (error) {
      options.onError?.(error as Error);
      throw handleError(error);
    }
  }

  /**
   * AsyncGenerator-based streaming
   */
  async *streamCompletion(options: ChatCompletionOptions): AsyncGenerator<StreamChunk, void, unknown> {
    const modelName = options.model || this.model || 'gemini-2.0-flash';

    if (!this.apiKey) {
      throw new Error('API key is required for Gemini');
    }

    const response = await axios.post(
      `${this.apiEndpoint}/v1/models/${modelName}:streamGenerateContent`,
      await this.transformToGeminiRequest(options),
      {
        headers: {
          'x-goog-api-key': this.apiKey,
          'Content-Type': 'application/json'
        },
        responseType: 'stream'
      }
    );

    const responseId = `gemini-${Date.now()}`;
    let buffer = '';

    for await (const chunk of response.data) {
      buffer += chunk.toString();

      try {
        const parsed = JSON.parse(buffer);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (item.candidates?.[0]?.content?.parts?.[0]?.text) {
              yield {
                id: responseId,
                object: 'chat.completion.chunk',
                created: Math.floor(Date.now() / 1000),
                model: modelName,
                choices: [{
                  index: 0,
                  delta: { content: item.candidates[0].content.parts[0].text },
                  finish_reason: null
                }]
              };
            }
          }
          buffer = '';
        }
      } catch {
        // Continue accumulating
      }
    }
  }

  /**
   * Get provider capabilities
   */
  getCapabilities(): ProviderCapabilities {
    return {
      supportsStreaming: true,
      supportsTools: true,
      supportsVision: true,
      supportsEmbeddings: true,
      supportsCaching: true,
      cachingType: 'explicit', // Gemini uses explicit context caching API
      supportsReasoning: false,
      supportsMultimodal: true // Gemini supports images via inlineData
    };
  }

  async getModels(): Promise<any> {
    // Check cache first
    const cacheKey = 'models:gemini';
    const cached = modelCache.get<any[]>(cacheKey);
    if (cached) return cached;

    const models = this.chatModels.map(modelId => ({
      id: modelId,
      name: modelId,
      provider: 'gemini',
      type: 'chat'
    }));

    modelCache.set(cacheKey, models);
    return models;
  }
}

export default Gemini; 