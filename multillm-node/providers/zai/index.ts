// import axios from 'axios';
// import { handleError } from '../../utils/errorHandler';
// import type { BaseProvider, LLMProvider, ChatCompletionOptions, ChatCompletionResponse, ChatMessage } from '../../types';

// function transformMessages(messages: ChatMessage[]): any[] {
//   return messages.map(message => {
//     if (message.role === 'function') {
//       return {
//         role: 'function',
//         name: message.name || 'unknown',
//         content: message.content || ''
//       };
//     }

//     if (message.role === 'assistant' && message.tool_calls) {
//       return {
//         role: 'assistant',
//         content: message.content || '',
//         tool_calls: message.tool_calls
//       };
//     }

//     if (message.role === 'system') {
//       return {
//         role: 'system',
//         content: message.content || ''
//       };
//     }

//     return {
//       role: 'user',
//       content: message.content || ''
//     };
//   });
// }

// class ZAi implements LLMProvider {
//   private options: BaseProvider;
//   private embeddingModels: string[];
//   private chatModels: string[];
//   public model: string | null;
//   public device_map: string | null;
//   public apiKey: string | null;
//   public apiEndpoint: string | null;
//   public provider: "openai";

//   constructor(
//     model: string | null = null,
//     device_map: string | null = null,
//     apiKey: string | null = null,
//     apiEndpoint: string | null = null
//   ) {
//     this.embeddingModels = ["text-embedding-3-small", "text-embedding-3-large", "text-embedding-ada-002"];
//     this.chatModels = ["glm-4.5", "gpt-4", "gpt-3.5-turbo"];
//     this.model = model;
//     this.device_map = device_map;
//     this.apiKey = apiKey;
//     this.apiEndpoint =  "https://api.z.ai/api/coding/paas/v4";
//     this.provider = "openai";

//     this.options = { model, device_map, apiKey, apiEndpoint: this.apiEndpoint };
//   }

//   async createCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
//     try {
//       const data = {
//         model: options.model || this.model || "glm-4.5",
//         messages: options.messages,
//         temperature: options.temperature,
//         top_p: options.top_p,
//         max_tokens: options.max_tokens,
//         stream: options.stream,
//         tools: options.tools,
//         stop: options.stop,
//       };

//       const config = {
//         method: 'post',
//         maxBodyLength: Infinity,
//         url: `${this.apiEndpoint}/chat/completions`,
//         headers: { 
//           'Content-Type': 'application/json', 
//           'Authorization': `Bearer ${this.apiKey}`
//         },
//         data: data
//       };

//       const response = await axios.request(config);
//       return response.data as ChatCompletionResponse;
//     } catch (error) {
//       throw handleError(error);
//     }
//   }

//   async getModels(): Promise<any> {
//     try {
//       // Return static glm-4.6 model instead of fetching from API
//       return [{
//         id: 'glm-4.6',
//         name: 'glm-4.6',
//         provider: 'zai',
//         type: 'chat'
//       }];
//     } catch (error) {
//       throw handleError(error);
//     }
//   }

//   async createEmbedding(input: string | string[], model: string) {
//     try {
//       const response = await axios.post(
//         `${this.apiEndpoint}/embeddings`,
//         {
//           input,
//           model
//         },
//         {
//           headers: {
//             "Content-Type": "application/json",
//             'Authorization': `Bearer ${this.apiKey}`
//           },
//         }
//       );

//       return response.data;
//     } catch (error) {
//       return handleError(error);
//     }
//   }
// }

// export default ZAi;


import axios from 'axios';
import { handleError } from '../../utils/errorHandler';
import { OpenAI as OpenAIApi, AzureOpenAI } from 'openai';
import type { ChatCompletion, ChatCompletionChunk, ChatCompletionCreateParams, ChatCompletionMessageParam, ChatCompletionSystemMessageParam, ChatCompletionUserMessageParam, ChatCompletionAssistantMessageParam, ChatCompletionFunctionMessageParam } from 'openai/resources/chat';
import type { Stream } from 'openai/streaming';
import type { BaseProvider, LLMProviderWithStreaming, ChatCompletionOptions, ChatCompletionResponse, Provider, ChatMessage, StreamChunk, StreamingOptions, EmbeddingOptions, EmbeddingResponse } from '../../types';
import { aggregateStreamChunks } from '../../utils/sseParser';

function extractText(content: ChatMessage['content']): string {
  if (content === null || content === undefined) return '';
  if (typeof content === 'string') return content;
  return content
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map(part => part.text)
    .join('');
}

function transformMessages(messages: ChatMessage[]): ChatCompletionMessageParam[] {
  return messages.map(message => {
    if (message.role === 'function') {
      const functionMessage: ChatCompletionFunctionMessageParam = {
        role: 'function',
        name: message.name || 'unknown',
        content: extractText(message.content)
      };
      return functionMessage;
    }

    if (message.role === 'assistant' && message.tool_calls) {
      const assistantMessage: ChatCompletionAssistantMessageParam = {
        role: 'assistant',
        content: extractText(message.content),
        tool_calls: message.tool_calls
      };
      return assistantMessage;
    }

    if (message.role === 'system') {
      const systemMessage: ChatCompletionSystemMessageParam = {
        role: 'system',
        content: extractText(message.content)
      };
      return systemMessage;
    }

    const userMessage: ChatCompletionUserMessageParam = {
      role: 'user',
      content: extractText(message.content)
    };
    return userMessage;
  });
}

class ZAi implements LLMProviderWithStreaming {
  private options: BaseProvider;
  private client: OpenAIApi | AzureOpenAI;
  private embeddingModels: string[];
  private chatModels: string[];
  public model: string | null;
  public device_map: string | null;
  public apiKey: string | null;
  public apiEndpoint: string | null;
  public provider: "zai";

  constructor(
    model: string | null = null,
    device_map: string | null = null,
    apiKey: string | null = null,
    apiEndpoint: string | null = null
  ) {
    this.embeddingModels = ["text-embedding-3-small", "text-embedding-3-large", "text-embedding-ada-002"];
    this.chatModels = ["glm-5", "glm-4.7", "gpt-4", "gpt-3.5-turbo"];
    this.model = model;
    this.device_map = device_map;
    this.apiKey = apiKey;
    this.apiEndpoint = "https://api.z.ai/api/coding/paas/v4";
    this.provider = "zai";

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
      // If streaming with callbacks, delegate to createCompletionStream
      if (options.stream && (options as StreamingOptions).onChunk) {
        return this.createCompletionStream(options as StreamingOptions);
      }

      const completion = await this.client.chat.completions.create({
        // @ts-ignore
        messages: options.messages,
        model: options.model || this.model || 'glm-5',
        temperature: options.temperature,
        top_p: options.top_p,
        max_tokens: options.max_tokens,
        stream: false,
        tools: options.tools,
        stop: options.stop,
      });

      return completion as unknown as ChatCompletionResponse;
    } catch (error) {
      throw handleError(error);
    }
  }

  /**
   * Create completion with streaming support and callbacks.
   * Z.AI uses the OpenAI-compatible SSE protocol with stream=true.
   * Chunks include delta.content and delta.reasoning_content.
   */
  async createCompletionStream(options: StreamingOptions): Promise<ChatCompletionResponse> {
    const modelName = options.model || this.model || 'glm-5';

    try {
      const requestParams: any = {
        messages: options.messages,
        model: modelName,
        stream: true,
        tools: options.tools,
        stop: options.stop,
      };

      if (options.temperature !== undefined) {
        requestParams.temperature = options.temperature;
      }
      if (options.top_p !== undefined) {
        requestParams.top_p = options.top_p;
      }
      if (options.max_tokens !== undefined) {
        requestParams.max_tokens = options.max_tokens;
      }

      const stream = await this.client.chat.completions.create(requestParams) as unknown as AsyncIterable<ChatCompletionChunk>;

      const chunks: StreamChunk[] = [];

      for await (const chunk of stream) {
        const rawDelta = (chunk.choices?.[0] as any)?.delta || {};
        const streamChunk: StreamChunk = {
          id: chunk.id,
          object: 'chat.completion.chunk',
          created: chunk.created,
          model: chunk.model,
          choices: chunk.choices.map((choice: any) => ({
            index: choice.index,
            delta: {
              role: choice.delta.role as 'assistant' | undefined,
              content: choice.delta.content || undefined,
              // Z.AI sends reasoning_content for reasoning models
              reasoning: rawDelta.reasoning_content || undefined,
              tool_calls: choice.delta.tool_calls?.map((tc: any) => ({
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

      const lastChunkWithUsage = [...chunks].reverse().find((c: StreamChunk) => c.usage);
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
   * AsyncGenerator-based streaming for use with for-await-of
   */
  async *streamCompletion(options: ChatCompletionOptions): AsyncGenerator<StreamChunk, void, unknown> {
    const modelName = options.model || this.model || 'glm-5';

    try {
      const requestParams: any = {
        messages: options.messages,
        model: modelName,
        stream: true,
        tools: options.tools,
        stop: options.stop,
      };

      if (options.temperature !== undefined) {
        requestParams.temperature = options.temperature;
      }
      if (options.top_p !== undefined) {
        requestParams.top_p = options.top_p;
      }
      if (options.max_tokens !== undefined) {
        requestParams.max_tokens = options.max_tokens;
      }

      const stream = await this.client.chat.completions.create(requestParams) as unknown as AsyncIterable<ChatCompletionChunk>;

      for await (const chunk of stream) {
        const rawDelta = (chunk.choices?.[0] as any)?.delta || {};
        const streamChunk: StreamChunk = {
          id: chunk.id,
          object: 'chat.completion.chunk',
          created: chunk.created,
          model: chunk.model,
          choices: chunk.choices.map((choice: any) => ({
            index: choice.index,
            delta: {
              role: choice.delta.role as 'assistant' | undefined,
              content: choice.delta.content || undefined,
              reasoning: rawDelta.reasoning_content || undefined,
              tool_calls: choice.delta.tool_calls?.map((tc: any) => ({
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

  async getModels(): Promise<any> {
    try {
      const completion = await this.client.models.list();
      return completion.data.map((model: any) => ({
        id: model.id,
        name: model.id,
        provider: 'zai',
        type: 'chat'
      }));
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

      const response = await axios.post(
        `${this.apiEndpoint}/embeddings`,
        {
          input: options.input,
          model: modelName
        },
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
}

export default ZAi; 