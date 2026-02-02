/**
 * SSE Transform Stream
 *
 * Transforms JSON objects into Server-Sent Events (SSE) format.
 */

import type { UIMessageChunk } from './types';

/**
 * Transforms JSON chunks to SSE format
 *
 * SSE Format:
 * data: {"type":"text-delta","content":"Hello"}\n\n
 *
 * End signal:
 * data: [DONE]\n\n
 */
export class JsonToSseTransformStream extends TransformStream<UIMessageChunk, string> {
  constructor() {
    super({
      transform(chunk, controller) {
        // Format as SSE data line
        const sseData = `data: ${JSON.stringify(chunk)}\n\n`;
        controller.enqueue(sseData);
      },
      flush(controller) {
        // Send completion signal
        controller.enqueue('data: [DONE]\n\n');
      }
    });
  }
}

/**
 * Transforms JSON chunks to newline-delimited JSON (NDJSON) format
 *
 * NDJSON Format:
 * {"type":"text-delta","content":"Hello"}\n
 */
export class JsonToNdjsonTransformStream extends TransformStream<UIMessageChunk, string> {
  constructor() {
    super({
      transform(chunk, controller) {
        controller.enqueue(JSON.stringify(chunk) + '\n');
      }
    });
  }
}

/**
 * Transform stream that encodes strings to Uint8Array
 * Useful for converting string streams to binary for Response bodies
 */
export class StringToUint8ArrayTransformStream extends TransformStream<string, Uint8Array> {
  constructor() {
    const encoder = new TextEncoder();
    super({
      transform(chunk, controller) {
        controller.enqueue(encoder.encode(chunk));
      }
    });
  }
}

/**
 * Parse SSE stream back to JSON chunks
 * Useful for consuming SSE streams on the client
 */
export function parseSSEChunk(line: string): UIMessageChunk | null {
  // Skip empty lines and comments
  if (!line || line.startsWith(':')) {
    return null;
  }

  // Check for data line
  if (line.startsWith('data: ')) {
    const data = line.slice(6).trim();

    // Check for end signal
    if (data === '[DONE]') {
      return null;
    }

    try {
      return JSON.parse(data) as UIMessageChunk;
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Async generator to parse SSE stream
 * @param stream - The SSE response stream
 * @yields UIMessageChunk objects
 */
export async function* parseSSEStream(
  stream: ReadableStream<Uint8Array>
): AsyncGenerator<UIMessageChunk, void, unknown> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        // Process any remaining buffer
        if (buffer.trim()) {
          const chunk = parseSSEChunk(buffer);
          if (chunk) {
            yield chunk;
          }
        }
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        const chunk = parseSSEChunk(line);
        if (chunk) {
          yield chunk;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Create a pipeline of transforms for SSE output
 * @param stream - The source UIMessageChunk stream
 * @returns A Uint8Array stream ready for Response body
 */
export function createSSEPipeline(
  stream: ReadableStream<UIMessageChunk>
): ReadableStream<Uint8Array> {
  return stream
    .pipeThrough(new JsonToSseTransformStream())
    .pipeThrough(new StringToUint8ArrayTransformStream());
}

/**
 * Create a pipeline for NDJSON output
 * @param stream - The source UIMessageChunk stream
 * @returns A Uint8Array stream ready for Response body
 */
export function createNdjsonPipeline(
  stream: ReadableStream<UIMessageChunk>
): ReadableStream<Uint8Array> {
  return stream
    .pipeThrough(new JsonToNdjsonTransformStream())
    .pipeThrough(new StringToUint8ArrayTransformStream());
}
