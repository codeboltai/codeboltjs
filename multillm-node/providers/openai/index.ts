import axios from 'axios';
import { handleError } from '../../utils/errorHandler';
import { OpenAI as OpenAIApi, AzureOpenAI } from 'openai';
import type { ChatCompletion, ChatCompletionChunk, ChatCompletionCreateParams, ChatCompletionMessageParam, ChatCompletionSystemMessageParam, ChatCompletionUserMessageParam, ChatCompletionAssistantMessageParam, ChatCompletionFunctionMessageParam } from 'openai/resources/chat';
import type { Stream } from 'openai/streaming';
import type { BaseProvider, LLMProvider, ChatCompletionOptions, ChatCompletionResponse, Provider, ChatMessage, StreamChunk, StreamingOptions, ProviderCapabilities, LLMProviderWithStreaming, EmbeddingOptions, EmbeddingResponse, ImageGenerationOptions, ImageGenerationResponse, TranscriptionOptions, TranscriptionResponse, SpeechOptions, SpeechResponse } from '../../types';
import { modelCache } from '../../utils/cacheManager';
import { aggregateStreamChunks } from '../../utils/sseParser';
import { isMultimodalContent, transformContentForOpenAI, extractTextContent } from '../../utils/contentTransformer';
import { isReasoningModel, getOpenAIReasoningParams } from '../../utils/reasoningModels';

/**
 * Transform messages to OpenAI format, handling multimodal content
 */
async function transformMessages(messages: ChatMessage[]): Promise<ChatCompletionMessageParam[]> {
  const transformed: ChatCompletionMessageParam[] = [];

  for (const message of messages) {
    if (message.role === 'function') {
      const functionMessage: ChatCompletionFunctionMessageParam = {
        role: 'function',
        name: message.name || 'unknown',
        content: extractTextContent(message.content)
      };
      transformed.push(functionMessage);
      continue;
    }

    if (message.role === 'assistant' && message.tool_calls) {
      const assistantMessage: ChatCompletionAssistantMessageParam = {
        role: 'assistant',
        content: extractTextContent(message.content),
        tool_calls: message.tool_calls
      };
      transformed.push(assistantMessage);
      continue;
    }

    if (message.role === 'system') {
      const systemMessage: ChatCompletionSystemMessageParam = {
        role: 'system',
        content: extractTextContent(message.content)
      };
      transformed.push(systemMessage);
      continue;
    }

    // User message - handle multimodal content
    if (message.role === 'user' && isMultimodalContent(message.content)) {
      const content = await transformContentForOpenAI(message.content);
      const userMessage: ChatCompletionUserMessageParam = {
        role: 'user',
        content: content as any
      };
      transformed.push(userMessage);
      continue;
    }

    // Default: user or assistant message with string content
    const userMessage: ChatCompletionUserMessageParam = {
      role: 'user',
      content: extractTextContent(message.content)
    };
    transformed.push(userMessage);
  }

  return transformed;
}

class OpenAI implements LLMProviderWithStreaming {
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
      // If streaming with callbacks, use createCompletionStream
      if (options.stream && (options as StreamingOptions).onChunk) {
        return this.createCompletionStream(options as StreamingOptions);
      }

      const modelName = options.model || this.model || "gpt-3.5-turbo";
      const isReasoning = isReasoningModel(modelName, 'openai');

      // Transform messages (handles multimodal content)
      const transformedMessages = await transformMessages(options.messages);

      // Build request parameters
      const requestParams: any = {
        messages: transformedMessages,
        model: modelName,
        stream: false,
        tools: options.tools,
        stop: options.stop,
      };

      // Handle reasoning models differently (o1/o3 series)
      if (isReasoning) {
        // Reasoning models use different parameters
        const reasoningParams = getOpenAIReasoningParams(modelName, {
          temperature: options.temperature,
          max_tokens: options.max_tokens,
          thinkingBudget: options.reasoning?.thinkingBudget,
          reasoningEffort: options.reasoning?.reasoningEffort
        });
        Object.assign(requestParams, reasoningParams);
        // Note: temperature is not supported for reasoning models
      } else {
        // Standard models use normal parameters
        if (options.temperature !== undefined) {
          requestParams.temperature = options.temperature;
        }
        if (options.top_p !== undefined) {
          requestParams.top_p = options.top_p;
        }
        if (options.max_tokens !== undefined) {
          requestParams.max_tokens = options.max_tokens;
        }
      }

      const completion = await this.client.chat.completions.create(requestParams);

      // Extract usage with cached token and reasoning token information
      const rawUsage = completion.usage as any;
      const completionTokensDetails = rawUsage?.completion_tokens_details;

      const response: ChatCompletionResponse = {
        id: completion.id,
        object: completion.object,
        created: completion.created,
        model: completion.model,
        choices: completion.choices.map(choice => {
          const message: ChatMessage = {
            role: choice.message.role,
            content: choice.message.content,
            tool_calls: choice.message.tool_calls
          };

          // Extract reasoning content if present (o1/o3 models)
          const rawMessage = choice.message as any;
          if (rawMessage.reasoning_content || rawMessage.reasoning) {
            message.reasoning = {
              thinking: rawMessage.reasoning_content || rawMessage.reasoning
            };
          }

          return {
            index: choice.index,
            message,
            finish_reason: choice.finish_reason as 'stop' | 'length' | 'tool_calls' | 'content_filter' | null
          };
        }),
        usage: {
          prompt_tokens: rawUsage?.prompt_tokens || 0,
          completion_tokens: rawUsage?.completion_tokens || 0,
          total_tokens: rawUsage?.total_tokens || 0,
          // OpenAI returns cached_tokens in prompt_tokens_details when caching occurs
          cached_tokens: rawUsage?.prompt_tokens_details?.cached_tokens,
          // Reasoning tokens from completion_tokens_details
          reasoning_tokens: completionTokensDetails?.reasoning_tokens,
          reasoning_tokens_cached: completionTokensDetails?.accepted_prediction_tokens,
          // Store raw provider usage for advanced use
          provider_usage: rawUsage ? {
            prompt_tokens: rawUsage.prompt_tokens,
            completion_tokens: rawUsage.completion_tokens,
            total_tokens: rawUsage.total_tokens,
            prompt_tokens_details: rawUsage.prompt_tokens_details,
            completion_tokens_details: rawUsage.completion_tokens_details
          } : undefined
        }
      };

      return response;
    } catch (error) {
      throw handleError(error);
    }
  }

  /**
   * Create completion with streaming support and callbacks
   */
  async createCompletionStream(options: StreamingOptions): Promise<ChatCompletionResponse> {
    const modelName = options.model || this.model || "gpt-3.5-turbo";
    const isReasoning = isReasoningModel(modelName, 'openai');

    try {
      // Transform messages (handles multimodal content)
      const transformedMessages = await transformMessages(options.messages);

      // Build request parameters
      const requestParams: any = {
        messages: transformedMessages,
        model: modelName,
        stream: true,
        tools: options.tools,
        stop: options.stop,
      };

      // Handle reasoning models differently
      if (isReasoning) {
        const reasoningParams = getOpenAIReasoningParams(modelName, {
          temperature: options.temperature,
          max_tokens: options.max_tokens,
          thinkingBudget: options.reasoning?.thinkingBudget,
          reasoningEffort: options.reasoning?.reasoningEffort
        });
        Object.assign(requestParams, reasoningParams);
      } else {
        if (options.temperature !== undefined) {
          requestParams.temperature = options.temperature;
        }
        if (options.top_p !== undefined) {
          requestParams.top_p = options.top_p;
        }
        if (options.max_tokens !== undefined) {
          requestParams.max_tokens = options.max_tokens;
        }
      }

      const stream = await this.client.chat.completions.create(requestParams);

      const chunks: StreamChunk[] = [];

      for await (const chunk of stream) {
        const streamChunk: StreamChunk = {
          id: chunk.id,
          object: 'chat.completion.chunk',
          created: chunk.created,
          model: chunk.model,
          choices: chunk.choices.map(choice => ({
            index: choice.index,
            delta: {
              role: choice.delta.role as 'assistant' | undefined,
              content: choice.delta.content || undefined,
              tool_calls: choice.delta.tool_calls?.map(tc => ({
                index: tc.index,
                id: tc.id,
                type: tc.type as 'function' | undefined,
                function: tc.function ? {
                  name: tc.function.name,
                  arguments: tc.function.arguments
                } : undefined
              }))
            },
            finish_reason: choice.finish_reason as 'stop' | 'length' | 'tool_calls' | 'content_filter' | null
          })),
          usage: chunk.usage ? {
            prompt_tokens: chunk.usage.prompt_tokens,
            completion_tokens: chunk.usage.completion_tokens,
            total_tokens: chunk.usage.total_tokens
          } : undefined
        };

        chunks.push(streamChunk);

        // Call onChunk callback
        options.onChunk?.(streamChunk);

        // Check for abort signal
        if (options.signal?.aborted) {
          break;
        }
      }

      // Aggregate chunks into final response
      const aggregated = aggregateStreamChunks(chunks, modelName);

      // Extract cached_tokens from the last chunk's usage if available
      const lastChunkWithUsage = chunks.findLast(c => c.usage);
      const rawUsage = lastChunkWithUsage?.usage as any;

      const response: ChatCompletionResponse = {
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
          cached_tokens: rawUsage?.prompt_tokens_details?.cached_tokens,
          provider_usage: rawUsage ? {
            prompt_tokens: rawUsage.prompt_tokens,
            completion_tokens: rawUsage.completion_tokens,
            total_tokens: rawUsage.total_tokens,
            prompt_tokens_details: rawUsage.prompt_tokens_details,
            completion_tokens_details: rawUsage.completion_tokens_details
          } : undefined
        }
      };

      // Call onComplete callback
      options.onComplete?.(response);

      return response;
    } catch (error) {
      options.onError?.(error as Error);
      throw handleError(error);
    }
  }

  /**
   * AsyncGenerator-based streaming
   */
  async *streamCompletion(options: ChatCompletionOptions): AsyncGenerator<StreamChunk, void, unknown> {
    const modelName = options.model || this.model || "gpt-3.5-turbo";
    const isReasoning = isReasoningModel(modelName, 'openai');

    try {
      // Transform messages (handles multimodal content)
      const transformedMessages = await transformMessages(options.messages);

      // Build request parameters
      const requestParams: any = {
        messages: transformedMessages,
        model: modelName,
        stream: true,
        tools: options.tools,
        stop: options.stop,
      };

      // Handle reasoning models differently
      if (isReasoning) {
        const reasoningParams = getOpenAIReasoningParams(modelName, {
          temperature: options.temperature,
          max_tokens: options.max_tokens,
          thinkingBudget: options.reasoning?.thinkingBudget,
          reasoningEffort: options.reasoning?.reasoningEffort
        });
        Object.assign(requestParams, reasoningParams);
      } else {
        if (options.temperature !== undefined) {
          requestParams.temperature = options.temperature;
        }
        if (options.top_p !== undefined) {
          requestParams.top_p = options.top_p;
        }
        if (options.max_tokens !== undefined) {
          requestParams.max_tokens = options.max_tokens;
        }
      }

      const stream = await this.client.chat.completions.create(requestParams);

      for await (const chunk of stream) {
        const streamChunk: StreamChunk = {
          id: chunk.id,
          object: 'chat.completion.chunk',
          created: chunk.created,
          model: chunk.model,
          choices: chunk.choices.map(choice => ({
            index: choice.index,
            delta: {
              role: choice.delta.role as 'assistant' | undefined,
              content: choice.delta.content || undefined,
              tool_calls: choice.delta.tool_calls?.map(tc => ({
                index: tc.index,
                id: tc.id,
                type: tc.type as 'function' | undefined,
                function: tc.function ? {
                  name: tc.function.name,
                  arguments: tc.function.arguments
                } : undefined
              }))
            },
            finish_reason: choice.finish_reason as 'stop' | 'length' | 'tool_calls' | 'content_filter' | null
          })),
          usage: chunk.usage ? {
            prompt_tokens: chunk.usage.prompt_tokens,
            completion_tokens: chunk.usage.completion_tokens,
            total_tokens: chunk.usage.total_tokens
          } : undefined
        };

        yield streamChunk;
      }
    } catch (error) {
      throw handleError(error);
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
      cachingType: 'automatic', // OpenAI caching is automatic for repeated prompts
      supportsImageGeneration: true,
      supportsReranking: false,
      supportsTranscription: true,
      supportsSpeech: true,
      supportsReasoning: true, // o1, o3 series models
      supportsMultimodal: true // Vision models support images in messages
    };
  }

  async getModels(): Promise<any> {
    // Check cache first
    const cacheKey = `models:openai:${this.apiEndpoint}`;
    const cached = modelCache.get<any[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${this.apiEndpoint}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      const models = response.data.data
        .map((model: any) => ({
          id: model.id,
          name: model.id,
          provider: "OpenAI",
          type: "chat"
        }));

      // Cache for 1 hour
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
      const modelName = options.model || 'text-embedding-3-small';

      const requestBody: any = {
        input: options.input,
        model: modelName
      };

      // Add optional parameters
      if (options.encoding_format) {
        requestBody.encoding_format = options.encoding_format;
      }
      if (options.dimensions) {
        requestBody.dimensions = options.dimensions;
      }
      if (options.user) {
        requestBody.user = options.user;
      }

      const response = await axios.post(
        `${this.apiEndpoint}/embeddings`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${this.apiKey}`
          },
        }
      );

      return response.data as EmbeddingResponse;
    } catch (error) {
      throw handleError(error);
    }
  }

  /**
   * Generate images using DALL-E models
   * @param options - Image generation options
   * @returns Generated images with URLs or base64 data
   */
  async createImage(options: ImageGenerationOptions): Promise<ImageGenerationResponse> {
    try {
      const requestBody: any = {
        model: options.model || 'dall-e-3',
        prompt: options.prompt,
        n: options.n || 1,
        size: options.size || '1024x1024',
        response_format: options.response_format || 'url'
      };

      // DALL-E 3 specific options
      if (options.quality) {
        requestBody.quality = options.quality;
      }
      if (options.style) {
        requestBody.style = options.style;
      }
      if (options.user) {
        requestBody.user = options.user;
      }

      const response = await axios.post(
        `${this.apiEndpoint}/images/generations`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data as ImageGenerationResponse;
    } catch (error) {
      throw handleError(error);
    }
  }

  /**
   * Transcribe audio to text using Whisper
   * @param options - Transcription options including audio file
   * @returns Transcription response with text
   */
  async createTranscription(options: TranscriptionOptions): Promise<TranscriptionResponse> {
    try {
      const formData = new FormData();

      // Handle different audio input types
      if (options.audio instanceof Blob || options.audio instanceof File) {
        formData.append('file', options.audio, 'audio.mp3');
      } else if (options.audio instanceof ArrayBuffer) {
        const blob = new Blob([options.audio], { type: 'audio/mp3' });
        formData.append('file', blob, 'audio.mp3');
      } else if (typeof options.audio === 'string') {
        // URL - fetch and convert to blob
        const audioResponse = await fetch(options.audio);
        const audioBlob = await audioResponse.blob();
        formData.append('file', audioBlob, 'audio.mp3');
      }

      formData.append('model', options.model || 'whisper-1');

      if (options.language) {
        formData.append('language', options.language);
      }
      if (options.prompt) {
        formData.append('prompt', options.prompt);
      }
      if (options.response_format) {
        formData.append('response_format', options.response_format);
      }
      if (options.temperature !== undefined) {
        formData.append('temperature', options.temperature.toString());
      }
      if (options.timestamp_granularities) {
        options.timestamp_granularities.forEach(g => {
          formData.append('timestamp_granularities[]', g);
        });
      }

      const response = await fetch(`${this.apiEndpoint}/audio/transcriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `HTTP ${response.status}`);
      }

      // Handle different response formats
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json() as TranscriptionResponse;
      } else {
        // text, srt, vtt formats return plain text
        const text = await response.text();
        return { text };
      }
    } catch (error) {
      throw handleError(error);
    }
  }

  /**
   * Convert text to speech using OpenAI TTS
   * @param options - Speech options including input text and voice
   * @returns Speech response with audio data
   */
  async createSpeech(options: SpeechOptions): Promise<SpeechResponse> {
    try {
      const requestBody: any = {
        model: options.model || 'tts-1',
        input: options.input,
        voice: options.voice || 'alloy'
      };

      if (options.response_format) {
        requestBody.response_format = options.response_format;
      }
      if (options.speed !== undefined) {
        requestBody.speed = options.speed;
      }

      const response = await fetch(`${this.apiEndpoint}/audio/speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `HTTP ${response.status}`);
      }

      const audio = await response.arrayBuffer();
      const contentType = response.headers.get('content-type') || 'audio/mpeg';

      return {
        audio,
        contentType
      };
    } catch (error) {
      throw handleError(error);
    }
  }
}


export default OpenAI; 