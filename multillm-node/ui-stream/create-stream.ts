/**
 * Create UI Message Stream
 *
 * Factory function for creating UI message streams with full lifecycle management.
 */

import type { UIMessageChunk, UIMessageStreamOptions, UIStreamResult } from './types';
import { UIMessageStreamWriterImpl, type UIMessageStreamWriter } from './writer';

/**
 * Generate a unique ID
 */
function generateDefaultId(): string {
  // Use crypto.randomUUID if available (Node 19+, modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback to timestamp + random
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Execute function type
 */
export type UIStreamExecutor = (options: {
  writer: UIMessageStreamWriter;
  messageId: string;
}) => void | Promise<void>;

/**
 * Create a UI message stream
 *
 * @param execute - Async function that writes to the stream
 * @param options - Stream options
 * @returns A ReadableStream of UIMessageChunks
 *
 * @example
 * ```typescript
 * const stream = createUIMessageStream(async ({ writer, messageId }) => {
 *   writer.write({ type: 'message-start', messageId, model: 'gpt-4' });
 *   writer.write({ type: 'text-start', messageId });
 *
 *   for (const chunk of textChunks) {
 *     writer.write({ type: 'text-delta', content: chunk, messageId });
 *   }
 *
 *   writer.write({ type: 'text-end', messageId });
 *   writer.write({ type: 'message-end', messageId, finishReason: 'stop' });
 * });
 * ```
 */
export function createUIMessageStream(
  execute: UIStreamExecutor,
  options: UIMessageStreamOptions = {}
): ReadableStream<UIMessageChunk> {
  const {
    onStart,
    onFinish,
    onError,
    generateId = generateDefaultId,
    messageId = generateId()
  } = options;

  // Track result for onFinish callback
  const result: UIStreamResult = {
    text: '',
    toolCalls: [],
    durationMs: 0
  };

  const startTime = Date.now();
  let currentToolCall: { id: string; name: string; argsText: string } | null = null;

  return new ReadableStream<UIMessageChunk>({
    async start(controller) {
      // Create writer
      const writer = new UIMessageStreamWriterImpl(controller, onError);

      try {
        // Call onStart callback
        if (onStart) {
          await onStart();
        }

        // Execute the user's function
        await execute({ writer, messageId });

        // Wait for any merged streams to complete
        await writer.waitForPendingStreams();

      } catch (error) {
        // Handle error
        const errorMessage = onError
          ? onError(error)
          : error instanceof Error
            ? error.message
            : 'An error occurred';

        try {
          controller.enqueue({
            type: 'error',
            error: errorMessage,
            messageId,
            timestamp: Date.now()
          });
        } catch {
          // Controller may be closed
        }
      } finally {
        // Calculate duration
        result.durationMs = Date.now() - startTime;

        // Close the writer
        writer.close();

        // Call onFinish callback
        if (onFinish) {
          try {
            await onFinish(result);
          } catch {
            // Ignore errors in onFinish
          }
        }

        // Close the controller
        try {
          controller.close();
        } catch {
          // Controller may already be closed
        }
      }
    }
  });
}

/**
 * Create a UI message stream from a provider's streaming completion
 *
 * This is a convenience function that wraps a provider's streaming response
 * and converts it to UI message chunks.
 *
 * @param providerStream - AsyncIterable of provider stream chunks
 * @param options - Stream options
 */
export function createUIMessageStreamFromProvider<T extends {
  choices: Array<{
    delta?: { content?: string; tool_calls?: any[] };
    finish_reason?: string | null;
  }>;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}>(
  providerStream: AsyncIterable<T>,
  options: UIMessageStreamOptions & { model?: string } = {}
): ReadableStream<UIMessageChunk> {
  const { model, ...streamOptions } = options;

  return createUIMessageStream(async ({ writer, messageId }) => {
    // Send message start
    writer.write({
      type: 'message-start',
      messageId,
      model,
      timestamp: Date.now()
    });

    writer.write({
      type: 'text-start',
      messageId,
      timestamp: Date.now()
    });

    let finishReason: string | undefined;
    let usage: { promptTokens: number; completionTokens: number; totalTokens: number } | undefined;

    // Track tool calls in progress
    const toolCallsInProgress: Map<number, { id: string; name: string; args: string }> = new Map();

    for await (const chunk of providerStream) {
      const choice = chunk.choices[0];

      if (choice?.delta?.content) {
        writer.write({
          type: 'text-delta',
          content: choice.delta.content,
          messageId,
          timestamp: Date.now()
        });
      }

      // Handle tool calls
      if (choice?.delta?.tool_calls) {
        for (const toolCall of choice.delta.tool_calls) {
          const index = toolCall.index;

          if (!toolCallsInProgress.has(index)) {
            // New tool call
            const toolCallId = toolCall.id || `tool-${messageId}-${index}`;
            toolCallsInProgress.set(index, {
              id: toolCallId,
              name: toolCall.function?.name || '',
              args: ''
            });

            if (toolCall.function?.name) {
              writer.write({
                type: 'tool-call-start',
                toolCallId,
                toolName: toolCall.function.name,
                messageId,
                timestamp: Date.now()
              });
            }
          }

          // Accumulate arguments
          const tc = toolCallsInProgress.get(index)!;
          if (toolCall.function?.arguments) {
            tc.args += toolCall.function.arguments;

            writer.write({
              type: 'tool-call-delta',
              toolCallId: tc.id,
              argsTextDelta: toolCall.function.arguments,
              messageId,
              timestamp: Date.now()
            });
          }
        }
      }

      if (choice?.finish_reason) {
        finishReason = choice.finish_reason;
      }

      if (chunk.usage) {
        usage = {
          promptTokens: chunk.usage.prompt_tokens,
          completionTokens: chunk.usage.completion_tokens,
          totalTokens: chunk.usage.total_tokens
        };
      }
    }

    // End all tool calls
    for (const [, tc] of toolCallsInProgress) {
      try {
        const args = tc.args ? JSON.parse(tc.args) : {};
        writer.write({
          type: 'tool-call-end',
          toolCallId: tc.id,
          args,
          messageId,
          timestamp: Date.now()
        });
      } catch {
        // Invalid JSON args
        writer.write({
          type: 'tool-call-end',
          toolCallId: tc.id,
          args: {},
          messageId,
          timestamp: Date.now()
        });
      }
    }

    // Send text end
    writer.write({
      type: 'text-end',
      messageId,
      timestamp: Date.now()
    });

    // Send message end
    writer.write({
      type: 'message-end',
      messageId,
      finishReason: finishReason as any,
      usage,
      timestamp: Date.now()
    });
  }, streamOptions);
}
