/**
 * SSE and NDJSON Stream Parsing Utilities
 * Handles parsing of Server-Sent Events and Newline-Delimited JSON streams
 */

import { StreamChunk } from '../types';

/**
 * Parse SSE (Server-Sent Events) format used by OpenAI, Anthropic, Mistral, Groq, etc.
 * Format: data: {json}\n\n
 * @param buffer - Raw string buffer from stream
 * @yields Parsed JSON objects
 */
export function* parseSSEStream(buffer: string): Generator<any> {
  const lines = buffer.split('\n');
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('data: ')) {
      const data = trimmedLine.slice(6).trim();
      if (data === '[DONE]') {
        return;
      }
      try {
        yield JSON.parse(data);
      } catch {
        // Skip malformed JSON lines
        continue;
      }
    }
  }
}

/**
 * Parse SSE with named events (Anthropic format)
 * Format: event: event_name\ndata: {json}\n\n
 * @param buffer - Raw string buffer from stream
 * @yields Objects with event name and data
 */
export function* parseNamedSSEStream(buffer: string): Generator<{ event: string; data: any }> {
  const lines = buffer.split('\n');
  let currentEvent = 'message';

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('event: ')) {
      currentEvent = trimmedLine.slice(7).trim();
    } else if (trimmedLine.startsWith('data: ')) {
      const data = trimmedLine.slice(6).trim();
      if (data === '[DONE]') {
        return;
      }
      try {
        yield { event: currentEvent, data: JSON.parse(data) };
      } catch {
        // Skip malformed JSON lines
        continue;
      }
    }
  }
}

/**
 * Parse NDJSON (Newline-Delimited JSON) format used by Ollama
 * Format: {json}\n{json}\n
 * @param buffer - Raw string buffer from stream
 * @yields Parsed JSON objects
 */
export function* parseNDJSONStream(buffer: string): Generator<any> {
  const lines = buffer.split('\n').filter(l => l.trim());
  for (const line of lines) {
    try {
      const parsed = JSON.parse(line);
      yield parsed;
      if (parsed.done) {
        return;
      }
    } catch {
      // Skip malformed JSON lines
      continue;
    }
  }
}

/**
 * Create a standard StreamChunk from raw chunk data
 * @param data - Raw chunk data from provider
 * @param model - Model name
 * @returns Standardized StreamChunk
 */
export function createStreamChunk(
  data: {
    id?: string;
    content?: string;
    role?: 'assistant';
    finish_reason?: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null;
    tool_calls?: any[];
    usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  },
  model: string
): StreamChunk {
  return {
    id: data.id || `chunk_${Date.now()}`,
    object: 'chat.completion.chunk',
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [{
      index: 0,
      delta: {
        role: data.role,
        content: data.content,
        tool_calls: data.tool_calls
      },
      finish_reason: data.finish_reason || null
    }],
    usage: data.usage
  };
}

/**
 * Aggregate stream chunks into a complete ChatCompletionResponse
 * @param chunks - Array of stream chunks
 * @param model - Model name
 * @returns Aggregated response
 */
export function aggregateStreamChunks(
  chunks: StreamChunk[],
  model: string
): {
  id: string;
  content: string;
  toolCalls: any[];
  finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null;
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
} {
  let content = '';
  let toolCalls: any[] = [];
  let finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null = null;
  let usage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
  let id = `chatcmpl_${Date.now()}`;

  for (const chunk of chunks) {
    if (chunk.id) id = chunk.id;

    for (const choice of chunk.choices) {
      if (choice.delta.content) {
        content += choice.delta.content;
      }
      if (choice.delta.tool_calls) {
        // Aggregate tool calls by index
        for (const tc of choice.delta.tool_calls) {
          if (!toolCalls[tc.index]) {
            toolCalls[tc.index] = {
              id: tc.id || `call_${Date.now()}_${tc.index}`,
              type: 'function',
              function: { name: '', arguments: '' }
            };
          }
          if (tc.function?.name) {
            toolCalls[tc.index].function.name += tc.function.name;
          }
          if (tc.function?.arguments) {
            toolCalls[tc.index].function.arguments += tc.function.arguments;
          }
          if (tc.id) {
            toolCalls[tc.index].id = tc.id;
          }
        }
      }
      if (choice.finish_reason) {
        finishReason = choice.finish_reason;
      }
    }

    if (chunk.usage) {
      usage = chunk.usage;
    }
  }

  // Filter out any undefined entries in toolCalls
  toolCalls = toolCalls.filter(Boolean);

  return { id, content, toolCalls, finishReason, usage };
}
