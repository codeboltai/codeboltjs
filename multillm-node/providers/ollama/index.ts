import axios from 'axios';
import { handleError } from '../../utils/errorHandler';
import { modelCache } from '../../utils/cacheManager';
import { parseNDJSONStream } from '../../utils/sseParser';
import { transformContentForOllama } from '../../utils/contentTransformer';
import type { ChatCompletionOptions, ChatCompletionResponse, ChatMessage, StreamChunk, StreamingOptions, ProviderCapabilities, LLMProviderWithStreaming, EmbeddingOptions, EmbeddingResponse } from '../../types';

interface OllamaMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  images?: string[];
}

async function transformMessages(messages: ChatMessage[]): Promise<OllamaMessage[]> {
  const result: OllamaMessage[] = [];

  for (const message of messages) {
    const { content, images } = await transformContentForOllama(message.content);
    result.push({
      role: message.role === 'function' || message.role === 'tool' ? 'user' :
            message.role === 'assistant' ? 'assistant' :
            message.role === 'system' ? 'system' : 'user',
      content,
      images
    });
  }

  return result;
}

class Ollama implements LLMProviderWithStreaming {
  private defaultModels: string[];
  public model: string | null;
  public device_map: string | null;
  public apiKey: string | null;
  public apiEndpoint: string | null;
  public provider: "ollama";

  constructor(
    model: string | null = null,
    device_map: string | null = null,
    apiKey: string | null = null,
    apiEndpoint: string | null = null
  ) {
    this.defaultModels = [
      "llama2",
      "codellama",
      "mistral",
      "mixtral",
      "phi",
      "neural-chat",
      "starling-lm"
    ];
    this.model = model || "mixtral";
    this.device_map = device_map;
    this.apiKey = apiKey;
    this.apiEndpoint = apiEndpoint ?? "http://localhost:11434";
    this.provider = "ollama";
  }

  async createCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    try {
      // If streaming with callbacks, use createCompletionStream
      if (options.stream && (options as StreamingOptions).onChunk) {
        return this.createCompletionStream(options as StreamingOptions);
      }

      const response = await axios.post(
        `${this.apiEndpoint}/api/chat`,  // Using chat endpoint for better compatibility
        {
          model: options.model || this.model || "mixtral",
          messages: await transformMessages(options.messages),
          options: {
            temperature: options.temperature,
            top_p: options.top_p,
            num_predict: options.max_tokens,
            stop: options.stop
          },
          stream: false
        }
      );

      // Handle Ollama's chat response format
      const responseContent = response.data.message?.content || response.data.response || "";

      return {
        id: `ollama-${Date.now()}`,
        object: 'chat.completion',
        created: Date.now(),
        model: options.model || this.model || "mixtral",
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: responseContent
          },
          finish_reason: response.data.done ? 'stop' : null
        }],
        usage: {
          prompt_tokens: response.data.prompt_eval_count || 0,
          completion_tokens: response.data.eval_count || 0,
          total_tokens: (response.data.prompt_eval_count || 0) + (response.data.eval_count || 0)
        }
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  /**
   * Create completion with streaming support and callbacks
   */
  async createCompletionStream(options: StreamingOptions): Promise<ChatCompletionResponse> {
    const modelName = options.model || this.model || "mixtral";

    try {
      const response = await axios.post(
        `${this.apiEndpoint}/api/chat`,
        {
          model: modelName,
          messages: await transformMessages(options.messages),
          options: {
            temperature: options.temperature,
            top_p: options.top_p,
            num_predict: options.max_tokens,
            stop: options.stop
          },
          stream: true
        },
        {
          responseType: 'stream'
        }
      );

      let fullContent = '';
      let usage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
      const responseId = `ollama-${Date.now()}`;

      return new Promise((resolve, reject) => {
        let buffer = '';

        response.data.on('data', (chunk: any) => {
          if (options.signal?.aborted) {
            response.data.destroy();
            return;
          }

          buffer += chunk.toString();
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const parsed of parseNDJSONStream(lines.join('\n'))) {
            const content = parsed.message?.content || '';
            if (content) {
              fullContent += content;

              const streamChunk: StreamChunk = {
                id: responseId,
                object: 'chat.completion.chunk',
                created: Math.floor(Date.now() / 1000),
                model: modelName,
                choices: [{
                  index: 0,
                  delta: { content },
                  finish_reason: null
                }]
              };

              options.onChunk?.(streamChunk);
            }

            // Capture usage from final message
            if (parsed.done) {
              usage = {
                prompt_tokens: parsed.prompt_eval_count || 0,
                completion_tokens: parsed.eval_count || 0,
                total_tokens: (parsed.prompt_eval_count || 0) + (parsed.eval_count || 0)
              };
            }
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
    const modelName = options.model || this.model || "mixtral";

    const response = await axios.post(
      `${this.apiEndpoint}/api/chat`,
      {
        model: modelName,
        messages: await transformMessages(options.messages),
        options: {
          temperature: options.temperature,
          top_p: options.top_p,
          num_predict: options.max_tokens,
          stop: options.stop
        },
        stream: true
      },
      {
        responseType: 'stream'
      }
    );

    const responseId = `ollama-${Date.now()}`;
    let buffer = '';

    for await (const chunk of response.data) {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const parsed of parseNDJSONStream(lines.join('\n'))) {
        const content = parsed.message?.content || '';
        if (content) {
          yield {
            id: responseId,
            object: 'chat.completion.chunk',
            created: Math.floor(Date.now() / 1000),
            model: modelName,
            choices: [{
              index: 0,
              delta: { content },
              finish_reason: parsed.done ? 'stop' : null
            }]
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
      supportsTools: false, // Ollama has limited tool support
      supportsVision: true, // Some Ollama models support vision
      supportsEmbeddings: true,
      supportsCaching: false,
      cachingType: 'none',
      supportsReasoning: false,
      supportsMultimodal: true // Vision models support images via images array
    };
  }

  async getModels(): Promise<any> {
    // Check cache first
    const cacheKey = `models:ollama:${this.apiEndpoint}`;
    const cached = modelCache.get<any[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${this.apiEndpoint}/api/tags`);

      // Combine default models with installed models
      const installedModels = response.data.models || [];
      const allModels = [...new Set([...this.defaultModels, ...installedModels.map((m: any) => m.name)])];

      const models = allModels.map(modelId => ({
        id: modelId,
        name: modelId,
        provider: "Ollama",
        type: "chat"
      }));

      modelCache.set(cacheKey, models);
      return models;
    } catch (error) {
      // If we can't reach Ollama, return default models
      return this.defaultModels.map(modelId => ({
        id: modelId,
        name: modelId,
        provider: "Ollama",
        type: "chat"
      }));
    }
  }

  /**
   * Create embeddings for text input
   * Ollama uses /api/embeddings endpoint with a different format
   * @param options - Embedding options including input text and model
   * @returns Embedding response with vectors (converted to OpenAI format)
   */
  async createEmbedding(options: EmbeddingOptions): Promise<EmbeddingResponse> {
    try {
      const modelName = options.model || 'nomic-embed-text';
      const inputs = Array.isArray(options.input) ? options.input : [options.input];

      // Ollama processes one input at a time, so we need to batch
      const embeddings: Array<{ index: number; embedding: number[]; object: 'embedding' }> = [];
      let totalTokens = 0;

      for (let i = 0; i < inputs.length; i++) {
        const response = await axios.post(
          `${this.apiEndpoint}/api/embeddings`,
          {
            model: modelName,
            prompt: inputs[i]
          }
        );

        embeddings.push({
          index: i,
          embedding: response.data.embedding,
          object: 'embedding'
        });

        // Ollama doesn't return token count, estimate based on input length
        totalTokens += Math.ceil(inputs[i].length / 4);
      }

      // Return in OpenAI-compatible format
      return {
        object: 'list',
        data: embeddings,
        model: modelName,
        usage: {
          prompt_tokens: totalTokens,
          total_tokens: totalTokens
        }
      };
    } catch (error) {
      throw handleError(error);
    }
  }
}

export default Ollama; 