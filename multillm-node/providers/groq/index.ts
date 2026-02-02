import axios from 'axios';
import { handleError } from '../../utils/errorHandler';
import { modelCache } from '../../utils/cacheManager';
import { parseSSEStream, aggregateStreamChunks } from '../../utils/sseParser';
import { extractTextContent } from '../../utils/contentTransformer';
import type { BaseProvider, ChatCompletionOptions, ChatCompletionResponse, ChatMessage, StreamChunk, StreamingOptions, ProviderCapabilities, LLMProviderWithStreaming } from '../../types';

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
    content: extractTextContent(message.content)
  }));
}

class Groq implements LLMProviderWithStreaming {
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

      // If streaming with callbacks, use createCompletionStream
      if (options.stream && (options as StreamingOptions).onChunk) {
        return this.createCompletionStream(options as StreamingOptions);
      }

      const response = await axios.post(
        `${this.apiEndpoint}/chat/completions`,
        {
          model: options.model || this.model || "mixtral-8x7b-32768",
          messages: transformMessages(options.messages),
          temperature: options.temperature,
          max_tokens: options.max_tokens,
          top_p: options.top_p,
          stream: false, // Non-streaming for simple createCompletion
          stop: options.stop
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`
          }
        }
      );

      return {
        id: response.data.id,
        object: 'chat.completion',
        created: response.data.created,
        model: response.data.model,
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: response.data.choices[0].message.content,
            tool_calls: response.data.choices[0].message.tool_calls
          },
          finish_reason: response.data.choices[0].finish_reason
        }],
        usage: response.data.usage
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

  /**
   * Create completion with streaming support and callbacks
   */
  async createCompletionStream(options: StreamingOptions): Promise<ChatCompletionResponse> {
    const modelName = options.model || this.model || "mixtral-8x7b-32768";

    try {
      if (!this.apiKey) {
        throw new Error("API key is required");
      }

      const response = await axios.post(
        `${this.apiEndpoint}/chat/completions`,
        {
          model: modelName,
          messages: transformMessages(options.messages),
          temperature: options.temperature,
          max_tokens: options.max_tokens,
          top_p: options.top_p,
          stream: true,
          stop: options.stop
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`
          },
          responseType: 'stream'
        }
      );

      const chunks: StreamChunk[] = [];
      let buffer = '';

      return new Promise((resolve, reject) => {
        response.data.on('data', (chunk: any) => {
          if (options.signal?.aborted) {
            response.data.destroy();
            return;
          }

          buffer += chunk.toString();
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

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
            usage: aggregated.usage
          };

          options.onComplete?.(finalResponse);
          resolve(finalResponse);
        });

        response.data.on('error', (error: Error) => {
          options.onError?.(error);
          reject(error);
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
    const modelName = options.model || this.model || "mixtral-8x7b-32768";

    if (!this.apiKey) {
      throw new Error("API key is required");
    }

    const response = await axios.post(
      `${this.apiEndpoint}/chat/completions`,
      {
        model: modelName,
        messages: transformMessages(options.messages),
        temperature: options.temperature,
        max_tokens: options.max_tokens,
        top_p: options.top_p,
        stream: true,
        stop: options.stop
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
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
      supportsCaching: false,
      cachingType: 'none'
    };
  }

  async getModels(): Promise<any> {
    // Check cache first
    const cacheKey = 'models:groq';
    const cached = modelCache.get<any[]>(cacheKey);
    if (cached) return cached;

    const models = this.defaultModels.map(modelId => ({
      id: modelId,
      name: modelId,
      provider: "Groq",
      type: "chat"
    }));

    modelCache.set(cacheKey, models);
    return models;
  }
}

export default Groq; 