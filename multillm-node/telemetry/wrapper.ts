/**
 * Telemetry Wrapper
 *
 * Utilities for instrumenting LLM calls with telemetry.
 */

import type { TelemetryCollector } from './collector';
import type { GenAIOperationName, GenAIProviderName, SpanContext } from './types';
import type {
  ChatCompletionOptions,
  ChatCompletionResponse,
  StreamChunk,
  EmbeddingOptions,
  EmbeddingResponse,
  ImageGenerationOptions,
  ImageGenerationResponse,
  RerankOptions,
  RerankResponse
} from '../types';
import { extractTextContent } from '../utils/contentTransformer';

/**
 * Wrapper options for telemetry instrumentation
 */
export interface TelemetryWrapperOptions {
  /** Telemetry collector instance */
  collector: TelemetryCollector;
  /** Provider name (e.g., 'openai', 'anthropic') */
  provider: GenAIProviderName;
  /** Model name (e.g., 'gpt-4', 'claude-3') */
  model?: string;
  /** Parent span context for tracing */
  parentContext?: SpanContext;
}

/**
 * Wrap a completion call with telemetry
 *
 * @param options - Telemetry wrapper options
 * @param completionOptions - The completion request options
 * @param execute - Function that executes the completion
 * @returns The completion response with telemetry recorded
 *
 * @example
 * ```typescript
 * const response = await withCompletionTelemetry(
 *   { collector, provider: 'openai', model: 'gpt-4' },
 *   { messages: [{ role: 'user', content: 'Hello' }] },
 *   () => llm.createCompletion({ messages })
 * );
 * ```
 */
export async function withCompletionTelemetry<T extends ChatCompletionResponse>(
  options: TelemetryWrapperOptions,
  completionOptions: ChatCompletionOptions,
  execute: () => Promise<T>
): Promise<T> {
  const { collector, provider, model } = options;

  if (!collector.isEnabled()) {
    return execute();
  }

  const span = collector.startSpan(
    'chat',
    provider,
    model || completionOptions.model,
    options.parentContext
  );

  // Set request params
  const requestParams: Record<string, number | string[] | undefined> = {};
  if (completionOptions.temperature !== undefined) {
    requestParams.temperature = completionOptions.temperature;
  }
  if (completionOptions.max_tokens !== undefined) {
    requestParams.maxTokens = completionOptions.max_tokens;
  }
  if (completionOptions.top_p !== undefined) {
    requestParams.topP = completionOptions.top_p;
  }
  // Check for frequency_penalty and presence_penalty in extended options
  const extendedOptions = completionOptions as unknown as Record<string, unknown>;
  if (extendedOptions.frequency_penalty !== undefined) {
    requestParams.frequencyPenalty = extendedOptions.frequency_penalty as number;
  }
  if (extendedOptions.presence_penalty !== undefined) {
    requestParams.presencePenalty = extendedOptions.presence_penalty as number;
  }
  if (completionOptions.stop) {
    requestParams.stopSequences = Array.isArray(completionOptions.stop)
      ? completionOptions.stop
      : [completionOptions.stop];
  }

  if (Object.keys(requestParams).length > 0) {
    span.setRequestParams(requestParams as any);
  }

  // Record input if configured
  if (completionOptions.messages?.length) {
    const lastMessage = completionOptions.messages[completionOptions.messages.length - 1];
    if (typeof lastMessage.content === 'string') {
      span.setInput(lastMessage.content);
    }
  }

  try {
    const response = await execute();

    // Record response
    span.setResponse({
      model: response.model,
      id: response.id,
      finishReasons: response.choices?.map(c => c.finish_reason).filter(Boolean) as string[]
    });

    // Record usage
    if (response.usage) {
      span.setUsage({
        inputTokens: response.usage.prompt_tokens,
        outputTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
        cachedTokens: (response.usage as any).cached_tokens,
        cacheCreationTokens: (response.usage as any).cache_creation_tokens
      });
    }

    // Record output
    const outputContent = response.choices?.[0]?.message?.content;
    const outputText = extractTextContent(outputContent);
    if (outputText) {
      span.setOutput(outputText);
    }

    span.setSuccess();
    span.end();

    return response;
  } catch (error) {
    span.setError(error instanceof Error ? error : new Error(String(error)));
    span.end();
    throw error;
  }
}

/**
 * Wrap a streaming completion with telemetry
 *
 * @param options - Telemetry wrapper options
 * @param completionOptions - The completion request options
 * @param execute - Function that returns an async generator of stream chunks
 * @yields StreamChunk objects with telemetry recorded
 *
 * @example
 * ```typescript
 * for await (const chunk of withStreamingTelemetry(
 *   { collector, provider: 'openai', model: 'gpt-4' },
 *   { messages },
 *   () => llm.streamCompletion({ messages })
 * )) {
 *   console.log(chunk.choices[0]?.delta?.content);
 * }
 * ```
 */
export async function* withStreamingTelemetry(
  options: TelemetryWrapperOptions,
  completionOptions: ChatCompletionOptions,
  execute: () => AsyncGenerator<StreamChunk, void, unknown>
): AsyncGenerator<StreamChunk, void, unknown> {
  const { collector, provider, model } = options;

  if (!collector.isEnabled()) {
    yield* execute();
    return;
  }

  const span = collector.startSpan(
    'chat',
    provider,
    model || completionOptions.model,
    options.parentContext
  );

  span.addEvent('stream_start');

  let outputContent = '';
  let lastChunk: StreamChunk | null = null;
  let inputTokens: number | undefined;
  let outputTokens: number | undefined;

  try {
    for await (const chunk of execute()) {
      lastChunk = chunk;

      // Accumulate content
      const delta = chunk.choices?.[0]?.delta?.content;
      if (delta) {
        outputContent += delta;
      }

      // Capture usage if present (some providers send it with the final chunk)
      if ((chunk as any).usage) {
        const usage = (chunk as any).usage;
        inputTokens = usage.prompt_tokens;
        outputTokens = usage.completion_tokens;
      }

      yield chunk;
    }

    span.addEvent('stream_end');

    // Record accumulated output
    if (outputContent) {
      span.setOutput(outputContent);
    }

    // Record response metadata from last chunk
    if (lastChunk) {
      span.setResponse({
        model: lastChunk.model,
        id: lastChunk.id,
        finishReasons: lastChunk.choices
          ?.map(c => c.finish_reason)
          .filter(Boolean) as string[]
      });
    }

    // Record usage if available
    if (inputTokens !== undefined || outputTokens !== undefined) {
      span.setUsage({
        inputTokens,
        outputTokens,
        totalTokens: inputTokens && outputTokens ? inputTokens + outputTokens : undefined
      });
    }

    span.setSuccess();
    span.end();
  } catch (error) {
    span.setError(error instanceof Error ? error : new Error(String(error)));
    span.end();
    throw error;
  }
}

/**
 * Wrap an embedding call with telemetry
 *
 * @param options - Telemetry wrapper options
 * @param embeddingOptions - The embedding request options
 * @param execute - Function that executes the embedding
 * @returns The embedding response with telemetry recorded
 *
 * @example
 * ```typescript
 * const embeddings = await withEmbeddingTelemetry(
 *   { collector, provider: 'openai', model: 'text-embedding-3-small' },
 *   { input: 'Hello world' },
 *   () => llm.createEmbedding({ input: 'Hello world' })
 * );
 * ```
 */
export async function withEmbeddingTelemetry<T extends EmbeddingResponse>(
  options: TelemetryWrapperOptions,
  embeddingOptions: EmbeddingOptions,
  execute: () => Promise<T>
): Promise<T> {
  const { collector, provider, model } = options;

  if (!collector.isEnabled()) {
    return execute();
  }

  const span = collector.startSpan(
    'embeddings',
    provider,
    model || embeddingOptions.model,
    options.parentContext
  );

  // Record input count
  const inputCount = Array.isArray(embeddingOptions.input)
    ? embeddingOptions.input.length
    : 1;
  span.setAttribute('gen_ai.embeddings.input_count', inputCount);

  try {
    const response = await execute();

    span.setResponse({ model: response.model });

    if (response.usage) {
      span.setUsage({
        inputTokens: response.usage.prompt_tokens,
        totalTokens: response.usage.total_tokens
      });
    }

    // Record output dimension
    if (response.data?.[0]?.embedding) {
      span.setAttribute('gen_ai.embeddings.dimension', response.data[0].embedding.length);
    }

    span.setSuccess();
    span.end();

    return response;
  } catch (error) {
    span.setError(error instanceof Error ? error : new Error(String(error)));
    span.end();
    throw error;
  }
}

/**
 * Wrap an image generation call with telemetry
 *
 * @param options - Telemetry wrapper options
 * @param imageOptions - The image generation request options
 * @param execute - Function that executes the image generation
 * @returns The image generation response with telemetry recorded
 *
 * @example
 * ```typescript
 * const images = await withImageGenerationTelemetry(
 *   { collector, provider: 'openai', model: 'dall-e-3' },
 *   { prompt: 'A sunset over mountains' },
 *   () => llm.createImage({ prompt: 'A sunset over mountains' })
 * );
 * ```
 */
export async function withImageGenerationTelemetry<T extends ImageGenerationResponse>(
  options: TelemetryWrapperOptions,
  imageOptions: ImageGenerationOptions,
  execute: () => Promise<T>
): Promise<T> {
  const { collector, provider, model } = options;

  if (!collector.isEnabled()) {
    return execute();
  }

  const span = collector.startSpan(
    'create_image',
    provider,
    model || imageOptions.model,
    options.parentContext
  );

  // Record image generation parameters
  span.setInput(imageOptions.prompt);
  if (imageOptions.size) {
    span.setAttribute('gen_ai.image.size', imageOptions.size);
  }
  if (imageOptions.n) {
    span.setAttribute('gen_ai.image.n', imageOptions.n);
  }
  if (imageOptions.quality) {
    span.setAttribute('gen_ai.image.quality', imageOptions.quality);
  }
  if (imageOptions.style) {
    span.setAttribute('gen_ai.image.style', imageOptions.style);
  }

  try {
    const response = await execute();

    span.setAttribute('gen_ai.image.count', response.data.length);

    // Record revised prompt if available (DALL-E 3)
    const revisedPrompt = response.data[0]?.revised_prompt;
    if (revisedPrompt) {
      span.setAttribute('gen_ai.image.revised_prompt', revisedPrompt);
    }

    span.setSuccess();
    span.end();

    return response;
  } catch (error) {
    span.setError(error instanceof Error ? error : new Error(String(error)));
    span.end();
    throw error;
  }
}

/**
 * Wrap a rerank call with telemetry
 *
 * @param options - Telemetry wrapper options
 * @param rerankOptions - The rerank request options
 * @param execute - Function that executes the reranking
 * @returns The rerank response with telemetry recorded
 *
 * @example
 * ```typescript
 * const results = await withRerankTelemetry(
 *   { collector, provider: 'codeboltai', model: 'rerank-english-v3.0' },
 *   { query: 'machine learning', documents: [...] },
 *   () => llm.rerank({ query, documents })
 * );
 * ```
 */
export async function withRerankTelemetry<T extends RerankResponse>(
  options: TelemetryWrapperOptions,
  rerankOptions: RerankOptions,
  execute: () => Promise<T>
): Promise<T> {
  const { collector, provider, model } = options;

  if (!collector.isEnabled()) {
    return execute();
  }

  const span = collector.startSpan(
    'rerank',
    provider,
    model || rerankOptions.model,
    options.parentContext
  );

  // Record rerank parameters
  span.setInput(rerankOptions.query);
  span.setAttribute('gen_ai.rerank.document_count', rerankOptions.documents.length);
  if (rerankOptions.top_n !== undefined) {
    span.setAttribute('gen_ai.rerank.top_n', rerankOptions.top_n);
  }
  if (rerankOptions.return_documents !== undefined) {
    span.setAttribute('gen_ai.rerank.return_documents', rerankOptions.return_documents);
  }

  try {
    const response = await execute();

    span.setAttribute('gen_ai.rerank.result_count', response.results.length);

    // Record top relevance score
    if (response.results.length > 0) {
      span.setAttribute('gen_ai.rerank.top_score', response.results[0].relevance_score);
    }

    // Record billing info if available
    if (response.meta?.billed_units?.search_units) {
      span.setAttribute('gen_ai.rerank.billed_units', response.meta.billed_units.search_units);
    }

    span.setSuccess();
    span.end();

    return response;
  } catch (error) {
    span.setError(error instanceof Error ? error : new Error(String(error)));
    span.end();
    throw error;
  }
}

/**
 * Create a tool call span (for function/tool execution)
 *
 * @param options - Telemetry wrapper options
 * @param toolCall - Tool call information
 * @param execute - Function that executes the tool
 * @returns The tool execution result with telemetry recorded
 *
 * @example
 * ```typescript
 * const result = await withToolCallTelemetry(
 *   { collector, provider: 'openai', model: 'gpt-4' },
 *   { name: 'get_weather', callId: 'call_123', arguments: '{"city": "NYC"}' },
 *   async () => getWeather({ city: 'NYC' })
 * );
 * ```
 */
export async function withToolCallTelemetry<T>(
  options: TelemetryWrapperOptions,
  toolCall: {
    name: string;
    callId: string;
    arguments?: string;
  },
  execute: () => Promise<T>
): Promise<T> {
  const { collector, provider, model } = options;

  if (!collector.isEnabled()) {
    return execute();
  }

  const span = collector.startSpan(
    'execute_tool',
    provider,
    model,
    options.parentContext
  );

  span.setToolCall({
    name: toolCall.name,
    callId: toolCall.callId,
    arguments: toolCall.arguments
  });

  try {
    const result = await execute();

    // Record result if serializable
    try {
      const resultStr = JSON.stringify(result);
      span.setAttribute('gen_ai.tool.call.result', resultStr);
    } catch {
      // Result not serializable, skip
    }

    span.setSuccess();
    span.end();

    return result;
  } catch (error) {
    span.setError(error instanceof Error ? error : new Error(String(error)));
    span.end();
    throw error;
  }
}
