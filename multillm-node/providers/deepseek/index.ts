import axios from 'axios';
import { handleError } from '../../utils/errorHandler';
import { modelCache } from '../../utils/cacheManager';
import { parseSSEStream, aggregateStreamChunks } from '../../utils/sseParser';
import { extractTextContent } from '../../utils/contentTransformer';
import { isReasoningModel } from '../../utils/reasoningModels';
import type {
  ChatCompletionOptions,
  ChatCompletionResponse,
  ChatMessage,
  StreamChunk,
  StreamingOptions,
  ProviderCapabilities,
  LLMProviderWithStreaming
} from '../../types';

interface DeepseekMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  tool_calls?: Array<{
    type: string;
    function: {
      name: string;
      arguments: string;
    };
  }>;
}

interface DeepseekChoice {
  index: number;
  message: DeepseekMessage;
  finish_reason: string;
}

function transformMessages(messages: ChatMessage[]): DeepseekMessage[] {
  return messages.map(message => ({
    role: message.role === 'assistant' ? 'assistant' :
          message.role === 'system' ? 'system' : 'user',
    content: extractTextContent(message.content),
    tool_calls: message.tool_calls
  }));
}

class DeepseekAI implements LLMProviderWithStreaming {
  public model: string | null;
  public device_map: string | null;
  public apiKey: string | null;
  public apiEndpoint: string | null;
  public provider: "deepseek";

  constructor(
    model: string | null = null,
    device_map: string | null = null,
    apiKey: string | null = null,
    apiEndpoint: string | null = null
  ) {
    this.model = model || "deepseek-chat";
    this.device_map = device_map;
    this.apiKey = apiKey;
    this.apiEndpoint = apiEndpoint ?? "https://api.deepseek.com/v1";
    this.provider = "deepseek";
  }

  async createCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    try {
      // If streaming with callbacks, use createCompletionStream
      if (options.stream && (options as StreamingOptions).onChunk) {
        return this.createCompletionStream(options as StreamingOptions);
      }

      const modelName = options.model || this.model || "deepseek-chat";
      const isReasoner = isReasoningModel(modelName, 'deepseek');

      const response = await axios.post(
        `${this.apiEndpoint}/chat/completions`,
        {
          model: modelName,
          messages: transformMessages(options.messages),
          temperature: options.temperature,
          max_tokens: options.max_tokens,
          top_p: options.top_p,
          stream: false,
          stop: options.stop,
          tools: options.tools
        },
        {
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${this.apiKey}`,
          }
        }
      );

      // Extract usage with Deepseek cache info
      const rawUsage = response.data.usage;

      // Build usage object
      const usage: ChatCompletionResponse['usage'] = {
        prompt_tokens: rawUsage?.prompt_tokens || 0,
        completion_tokens: rawUsage?.completion_tokens || 0,
        total_tokens: rawUsage?.total_tokens || 0,
        // Deepseek uses prompt_cache_hit_tokens and prompt_cache_miss_tokens
        cache_hit_tokens: rawUsage?.prompt_cache_hit_tokens,
        cache_miss_tokens: rawUsage?.prompt_cache_miss_tokens,
        // Store raw provider usage for advanced use
        provider_usage: rawUsage ? {
          prompt_tokens: rawUsage.prompt_tokens,
          completion_tokens: rawUsage.completion_tokens,
          total_tokens: rawUsage.total_tokens,
          prompt_cache_hit_tokens: rawUsage.prompt_cache_hit_tokens,
          prompt_cache_miss_tokens: rawUsage.prompt_cache_miss_tokens,
          reasoning_tokens: rawUsage.reasoning_tokens
        } : undefined
      };

      // Add reasoning tokens if available (DeepSeek reasoner models)
      if (rawUsage?.reasoning_tokens !== undefined) {
        usage.reasoning_tokens = rawUsage.reasoning_tokens;
      }

      return {
        id: response.data.id,
        object: 'chat.completion',
        created: response.data.created,
        model: response.data.model,
        choices: response.data.choices.map((choice: DeepseekChoice) => {
          const choiceData = choice as any;
          const message: any = {
            role: choice.message.role,
            content: choice.message.content,
            tool_calls: choice.message.tool_calls
          };

          // Extract reasoning content for reasoner models
          if (isReasoner && choiceData.message?.reasoning_content) {
            message.reasoning = {
              thinking: choiceData.message.reasoning_content
            };
          }

          return {
            index: choice.index,
            message,
            finish_reason: choice.finish_reason
          };
        }),
        usage
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  /**
   * Create completion with streaming support and callbacks
   */
  async createCompletionStream(options: StreamingOptions): Promise<ChatCompletionResponse> {
    const modelName = options.model || this.model || "deepseek-chat";

    try {
      const response = await axios.post(
        `${this.apiEndpoint}/chat/completions`,
        {
          model: modelName,
          messages: transformMessages(options.messages),
          temperature: options.temperature,
          max_tokens: options.max_tokens,
          top_p: options.top_p,
          stream: true,
          stop: options.stop,
          tools: options.tools
        },
        {
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${this.apiKey}`,
          },
          responseType: 'stream'
        }
      );

      const chunks: StreamChunk[] = [];
      let buffer = '';
      let lastUsage: any = null;

      return new Promise((resolve, reject) => {
        response.data.on('data', (chunk: any) => {
          if (options.signal?.aborted) {
            response.data.destroy();
            return;
          }

          buffer += chunk.toString();
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const parsed of parseSSEStream(lines.join('\n'))) {
            if (parsed.choices?.[0]) {
              const streamChunk: StreamChunk = {
                id: parsed.id || `chunk_${Date.now()}`,
                object: 'chat.completion.chunk',
                created: parsed.created || Math.floor(Date.now() / 1000),
                model: parsed.model || modelName,
                choices: [{
                  index: 0,
                  delta: {
                    role: parsed.choices[0].delta?.role,
                    content: parsed.choices[0].delta?.content,
                    tool_calls: parsed.choices[0].delta?.tool_calls
                  },
                  finish_reason: parsed.choices[0].finish_reason
                }],
                usage: parsed.usage
              };

              chunks.push(streamChunk);
              options.onChunk?.(streamChunk);
            }

            // Capture usage from the response (often in final chunk)
            if (parsed.usage) {
              lastUsage = parsed.usage;
            }
          }
        });

        response.data.on('end', () => {
          const aggregated = aggregateStreamChunks(chunks, modelName);

          const finalResponse: ChatCompletionResponse = {
            id: aggregated.id,
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: modelName,
            choices: [{
              index: 0,
              message: {
                role: 'assistant',
                content: aggregated.content || null,
                tool_calls: aggregated.toolCalls.length > 0 ? aggregated.toolCalls : undefined
              },
              finish_reason: aggregated.finishReason
            }],
            usage: {
              ...aggregated.usage,
              // Add Deepseek cache tracking fields
              cache_hit_tokens: lastUsage?.prompt_cache_hit_tokens,
              cache_miss_tokens: lastUsage?.prompt_cache_miss_tokens,
              provider_usage: lastUsage ? {
                prompt_tokens: lastUsage.prompt_tokens,
                completion_tokens: lastUsage.completion_tokens,
                total_tokens: lastUsage.total_tokens,
                prompt_cache_hit_tokens: lastUsage.prompt_cache_hit_tokens,
                prompt_cache_miss_tokens: lastUsage.prompt_cache_miss_tokens
              } : undefined
            }
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
    const modelName = options.model || this.model || "deepseek-chat";

    const response = await axios.post(
      `${this.apiEndpoint}/chat/completions`,
      {
        model: modelName,
        messages: transformMessages(options.messages),
        temperature: options.temperature,
        max_tokens: options.max_tokens,
        top_p: options.top_p,
        stream: true,
        stop: options.stop,
        tools: options.tools
      },
      {
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${this.apiKey}`,
        },
        responseType: 'stream'
      }
    );

    let buffer = '';

    for await (const chunk of response.data) {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const parsed of parseSSEStream(lines.join('\n'))) {
        if (parsed.choices?.[0]) {
          yield {
            id: parsed.id || `chunk_${Date.now()}`,
            object: 'chat.completion.chunk',
            created: parsed.created || Math.floor(Date.now() / 1000),
            model: parsed.model || modelName,
            choices: [{
              index: 0,
              delta: {
                role: parsed.choices[0].delta?.role,
                content: parsed.choices[0].delta?.content,
                tool_calls: parsed.choices[0].delta?.tool_calls
              },
              finish_reason: parsed.choices[0].finish_reason
            }],
            usage: parsed.usage
          };
        }
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
      supportsVision: false,
      supportsEmbeddings: false,
      supportsCaching: true,
      cachingType: 'automatic', // Deepseek caching is automatic
      supportsReasoning: true, // DeepSeek reasoner models support reasoning
      supportsMultimodal: false
    };
  }

  async getModels(): Promise<any> {
    // Check cache first
    const cacheKey = 'models:deepseek';
    const cached = modelCache.get<any[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(
        `${this.apiEndpoint}/models`,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`,
          },
        }
      );

      const models = response.data.data.map((model: { id: string }) => ({
        id: model.id,
        name: model.id,
        provider: "Deepseek",
        type: "chat"
      }));

      modelCache.set(cacheKey, models);
      return models;
    } catch (error) {
      throw handleError(error);
    }
  }
}

export default DeepseekAI; 