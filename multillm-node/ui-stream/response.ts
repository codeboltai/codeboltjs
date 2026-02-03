/**
 * HTTP Response Helpers for UI Message Streams
 *
 * Utilities for creating HTTP responses from UI message streams,
 * compatible with various frameworks (Express, Fastify, Next.js, etc.)
 */

import type { UIMessageChunk, UIMessageStreamOptions, UI_STREAM_HEADERS } from './types';
import { createUIMessageStream, createUIMessageStreamFromProvider, type UIStreamExecutor } from './create-stream';
import { createSSEPipeline, createNdjsonPipeline } from './sse-transform';

/**
 * Response options
 */
export interface UIStreamResponseOptions extends UIMessageStreamOptions {
  /** Response format: 'sse' (Server-Sent Events) or 'ndjson' (Newline Delimited JSON) */
  format?: 'sse' | 'ndjson';
  /** HTTP status code (default: 200) */
  status?: number;
  /** Additional headers to include */
  headers?: Record<string, string>;
}

/**
 * Create an HTTP Response with a UI message stream body
 *
 * Uses the Web Streams API Response object, compatible with:
 * - Next.js API routes
 * - Cloudflare Workers
 * - Deno
 * - Bun
 * - Node.js 18+ with --experimental-fetch
 *
 * @param execute - Function to execute that writes to the stream
 * @param options - Response options
 * @returns A Response object with streaming body
 *
 * @example
 * ```typescript
 * // Next.js App Router
 * export async function POST(req: Request) {
 *   return createUIMessageStreamResponse(async ({ writer, messageId }) => {
 *     const stream = await openai.chat.completions.create({
 *       model: 'gpt-4',
 *       messages: [{ role: 'user', content: 'Hello' }],
 *       stream: true
 *     });
 *
 *     for await (const chunk of stream) {
 *       if (chunk.choices[0]?.delta?.content) {
 *         writer.write({
 *           type: 'text-delta',
 *           content: chunk.choices[0].delta.content,
 *           messageId
 *         });
 *       }
 *     }
 *   });
 * }
 * ```
 */
export function createUIMessageStreamResponse(
  execute: UIStreamExecutor,
  options: UIStreamResponseOptions = {}
): Response {
  const {
    format = 'sse',
    status = 200,
    headers: customHeaders = {},
    ...streamOptions
  } = options;

  // Create the base stream
  const stream = createUIMessageStream(execute, streamOptions);

  // Apply format transformation
  const outputStream = format === 'sse'
    ? createSSEPipeline(stream)
    : createNdjsonPipeline(stream);

  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': format === 'sse' ? 'text/event-stream' : 'application/x-ndjson',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // Disable nginx buffering
    ...customHeaders
  };

  return new Response(outputStream, {
    status,
    headers
  });
}

/**
 * Create an HTTP Response from a provider's streaming completion
 *
 * Convenience function that wraps createUIMessageStreamFromProvider
 * and returns an HTTP Response.
 *
 * @param providerStream - The provider's streaming response
 * @param options - Response options with optional model name
 *
 * @example
 * ```typescript
 * export async function POST(req: Request) {
 *   const stream = await openai.chat.completions.create({
 *     model: 'gpt-4',
 *     messages: [{ role: 'user', content: 'Hello' }],
 *     stream: true
 *   });
 *
 *   return createUIMessageStreamResponseFromProvider(stream, {
 *     model: 'gpt-4'
 *   });
 * }
 * ```
 */
export function createUIMessageStreamResponseFromProvider<T extends {
  choices: Array<{
    delta?: { content?: string; tool_calls?: any[] };
    finish_reason?: string | null;
  }>;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}>(
  providerStream: AsyncIterable<T>,
  options: UIStreamResponseOptions & { model?: string } = {}
): Response {
  const {
    format = 'sse',
    status = 200,
    headers: customHeaders = {},
    model,
    ...streamOptions
  } = options;

  // Create the base stream
  const stream = createUIMessageStreamFromProvider(providerStream, { ...streamOptions, model });

  // Apply format transformation
  const outputStream = format === 'sse'
    ? createSSEPipeline(stream)
    : createNdjsonPipeline(stream);

  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': format === 'sse' ? 'text/event-stream' : 'application/x-ndjson',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
    ...customHeaders
  };

  return new Response(outputStream, {
    status,
    headers
  });
}

/**
 * Pipe a UI message stream to a Node.js ServerResponse
 *
 * For use with Express, Fastify (in compatibility mode), or raw Node.js HTTP server.
 *
 * @param stream - The UI message stream
 * @param response - Node.js ServerResponse (or Express Response)
 * @param options - Response options
 *
 * @example
 * ```typescript
 * // Express
 * app.post('/api/chat', async (req, res) => {
 *   const stream = createUIMessageStream(async ({ writer }) => {
 *     // ... write to stream
 *   });
 *
 *   pipeUIMessageStreamToResponse(stream, res);
 * });
 * ```
 */
export async function pipeUIMessageStreamToResponse(
  stream: ReadableStream<UIMessageChunk>,
  response: {
    writeHead(statusCode: number, headers: Record<string, string>): void;
    write(chunk: string | Uint8Array): boolean;
    end(): void;
    on?(event: string, listener: () => void): void;
  },
  options: { format?: 'sse' | 'ndjson'; status?: number; headers?: Record<string, string> } = {}
): Promise<void> {
  const { format = 'sse', status = 200, headers: customHeaders = {} } = options;

  // Set headers
  response.writeHead(status, {
    'Content-Type': format === 'sse' ? 'text/event-stream' : 'application/x-ndjson',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
    ...customHeaders
  });

  // Handle client disconnect
  let aborted = false;
  if (response.on) {
    response.on('close', () => {
      aborted = true;
    });
  }

  // Apply format transformation
  const outputStream = format === 'sse'
    ? createSSEPipeline(stream)
    : createNdjsonPipeline(stream);

  const reader = outputStream.getReader();
  const decoder = new TextDecoder();

  try {
    while (!aborted) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      const text = decoder.decode(value);
      response.write(text);
    }
  } finally {
    reader.releaseLock();
    response.end();
  }
}

/**
 * Create headers object for UI message stream responses
 *
 * @param format - Response format
 * @param additionalHeaders - Additional headers to merge
 * @returns Headers object
 */
export function getUIStreamHeaders(
  format: 'sse' | 'ndjson' = 'sse',
  additionalHeaders: Record<string, string> = {}
): Record<string, string> {
  return {
    'Content-Type': format === 'sse' ? 'text/event-stream' : 'application/x-ndjson',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
    ...additionalHeaders
  };
}
