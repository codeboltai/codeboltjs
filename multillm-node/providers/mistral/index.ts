import axios from 'axios';
import { handleError } from '../../utils/errorHandler';
import { modelCache } from '../../utils/cacheManager';
import { parseSSEStream, aggregateStreamChunks } from '../../utils/sseParser';
import { extractTextContent } from '../../utils/contentTransformer';
import type {
  BaseProvider,
  ChatCompletionOptions,
  ChatCompletionResponse,
  ChatMessage,
  StreamChunk,
  StreamingOptions,
  ProviderCapabilities,
  LLMProviderWithStreaming,
  EmbeddingOptions,
  EmbeddingResponse
} from '../../types';

interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

interface FunctionCall {
  name: string;
  arguments: string;
}

interface ChatCompletionOptionsWithTools extends ChatCompletionOptions {
  tools?: any[];
  functions?: any[];
  tool_choice?: any;
  function_call?: any;
}

interface ExtendedChatMessage extends ChatMessage {
  function_call?: FunctionCall;
  tool_calls?: ToolCall[];
}

interface MistralMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

interface MistralChoice {
  index: number;
  message: MistralMessage;
  finish_reason: string;
}

interface MistralStreamChoice {
  index: number;
  delta: {
    role?: string;
    content?: string;
  };
  finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null;
}

interface MistralStreamResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: MistralStreamChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

function transformMessages(messages: ExtendedChatMessage[]): MistralMessage[] {
  return messages.map(message => {
    const textContent = extractTextContent(message.content);
    const baseMessage: MistralMessage = {
      role: message.role === 'function' || message.role === 'tool' ? 'tool' :
            message.role === 'assistant' ? 'assistant' :
            message.role === 'system' ? 'system' : 'user',
      content: textContent || null
    };

    if (message.function_call || message.tool_calls) {
      baseMessage.tool_calls = (message.function_call ? [{
        id: `call_${Date.now()}`,
        type: 'function',
        function: {
          name: message.function_call.name,
          arguments: message.function_call.arguments
        }
      }] : message.tool_calls);
    }

    if (message.tool_call_id) {
      baseMessage.tool_call_id = message.tool_call_id;
    }

    return baseMessage;
  });
}

class MistralAI implements LLMProviderWithStreaming {
  public model: string | null;
  public device_map: string | null;
  public apiKey: string | null;
  public apiEndpoint: string | null;
  public provider: "mistral";

  constructor(
    model: string | null = null,
    device_map: string | null = null,
    apiKey: string | null = null,
    apiEndpoint: string | null = null
  ) {
    this.model = model || "mistral-large-latest";
    this.device_map = device_map;
    this.apiKey = apiKey;
    this.apiEndpoint = apiEndpoint ?? "https://api.mistral.ai/v1";
    this.provider = "mistral";
  }

  async createCompletion(options: ChatCompletionOptionsWithTools): Promise<ChatCompletionResponse> {
    try {
      // If streaming with callbacks, use createCompletionStream
      if (options.stream && (options as StreamingOptions).onChunk) {
        return this.createCompletionStream(options as StreamingOptions);
      }

      const response = await axios.post(
        `${this.apiEndpoint}/chat/completions`,
        {
          model: options.model || this.model || "mistral-large-latest",
          messages: transformMessages(options.messages),
          temperature: options.temperature,
          max_tokens: options.max_tokens,
          top_p: options.top_p,
          stream: false, // Non-streaming for simple createCompletion
          stop: options.stop,
          tools: options.tools || options.functions,
          tool_choice: options.tool_choice || options.function_call
        },
        {
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${this.apiKey}`,
          }
        }
      );

      // Transform Mistral response to standard format
      return {
        id: response.data.id,
        object: 'chat.completion',
        created: response.data.created,
        model: response.data.model,
        choices: response.data.choices.map((choice: MistralChoice) => ({
          index: choice.index,
          message: {
            role: choice.message.role,
            content: choice.message.content,
            tool_calls: choice.message.tool_calls,
            tool_call_id: choice.message.tool_call_id
          },
          finish_reason: choice.finish_reason
        })),
        usage: response.data.usage
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  /**
   * Create completion with streaming support and callbacks
   */
  async createCompletionStream(options: StreamingOptions): Promise<ChatCompletionResponse> {
    const modelName = options.model || this.model || "mistral-large-latest";

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
          tools: (options as ChatCompletionOptionsWithTools).tools,
          tool_choice: (options as ChatCompletionOptionsWithTools).tool_choice
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
    const modelName = options.model || this.model || "mistral-large-latest";

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
        tools: (options as ChatCompletionOptionsWithTools).tools,
        tool_choice: (options as ChatCompletionOptionsWithTools).tool_choice
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
      supportsEmbeddings: true,
      supportsCaching: false,
      cachingType: 'none'
    };
  }

  async getModels(): Promise<any> {
    // Check cache first
    const cacheKey = 'models:mistral';
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
        provider: "Mistral",
        type: "chat"
      }));

      modelCache.set(cacheKey, models);
      return models;
    } catch (error) {
      throw handleError(error);
    }
  }

  /**
   * Create embeddings for text input
   * @param options - Embedding options including input text and model
   * @returns Embedding response with vectors
   */
  async createEmbedding(options: EmbeddingOptions): Promise<EmbeddingResponse> {
    try {
      const modelName = options.model || 'mistral-embed';

      const requestBody: any = {
        input: Array.isArray(options.input) ? options.input : [options.input],
        model: modelName
      };

      // Mistral supports encoding_format
      if (options.encoding_format) {
        requestBody.encoding_format = options.encoding_format;
      }

      const response = await axios.post(
        `${this.apiEndpoint}/embeddings`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${this.apiKey}`,
          }
        }
      );

      return response.data as EmbeddingResponse;
    } catch (error) {
      throw handleError(error);
    }
  }
}

export default MistralAI; 