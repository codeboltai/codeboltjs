/**
 * UI Message Stream Writer
 *
 * Provides an interface for writing UI message chunks to a stream.
 */

import type { UIMessageChunk } from './types';

/**
 * Error handler type
 */
export type ErrorHandler = (error: unknown) => string;

/**
 * Interface for writing UI message chunks to a stream
 */
export interface UIMessageStreamWriter {
  /**
   * Write a chunk to the stream
   * @param chunk - The UI message chunk to write
   */
  write(chunk: UIMessageChunk): void;

  /**
   * Merge another stream into this stream
   * @param stream - The stream to merge
   */
  merge(stream: ReadableStream<UIMessageChunk>): void;

  /**
   * Error handler for the stream
   */
  onError?: ErrorHandler;
}

/**
 * Internal writer implementation
 */
export class UIMessageStreamWriterImpl implements UIMessageStreamWriter {
  private controller: ReadableStreamDefaultController<UIMessageChunk>;
  private pendingStreams: Set<Promise<void>> = new Set();
  private isClosed = false;
  public onError?: ErrorHandler;

  constructor(
    controller: ReadableStreamDefaultController<UIMessageChunk>,
    onError?: ErrorHandler
  ) {
    this.controller = controller;
    this.onError = onError;
  }

  /**
   * Write a chunk to the stream
   */
  write(chunk: UIMessageChunk): void {
    if (this.isClosed) {
      return; // Silently ignore writes after close
    }

    try {
      this.controller.enqueue(chunk);
    } catch (error) {
      // Stream may have been closed externally
      this.isClosed = true;
    }
  }

  /**
   * Merge another stream into this stream
   */
  merge(stream: ReadableStream<UIMessageChunk>): void {
    const mergePromise = this.mergeStream(stream);
    this.pendingStreams.add(mergePromise);
    mergePromise.finally(() => {
      this.pendingStreams.delete(mergePromise);
    });
  }

  /**
   * Internal method to merge a stream
   */
  private async mergeStream(stream: ReadableStream<UIMessageChunk>): Promise<void> {
    const reader = stream.getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        this.write(value);
      }
    } catch (error) {
      // Handle error from merged stream
      if (this.onError) {
        const errorMessage = this.onError(error);
        this.write({
          type: 'error',
          error: errorMessage,
          timestamp: Date.now()
        });
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Wait for all pending merged streams to complete
   */
  async waitForPendingStreams(): Promise<void> {
    await Promise.all(this.pendingStreams);
  }

  /**
   * Close the writer
   */
  close(): void {
    this.isClosed = true;
  }
}

/**
 * Helper functions for common write operations
 */
export const streamHelpers = {
  /**
   * Write text content incrementally
   */
  writeText(writer: UIMessageStreamWriter, content: string, messageId?: string): void {
    writer.write({ type: 'text-start', messageId });
    writer.write({ type: 'text-delta', content, messageId });
    writer.write({ type: 'text-end', messageId });
  },

  /**
   * Write text delta (for streaming character by character)
   */
  writeTextDelta(writer: UIMessageStreamWriter, content: string, messageId?: string): void {
    writer.write({ type: 'text-delta', content, messageId, timestamp: Date.now() });
  },

  /**
   * Write a complete tool call
   */
  writeToolCall(
    writer: UIMessageStreamWriter,
    toolCallId: string,
    toolName: string,
    args: Record<string, unknown>,
    messageId?: string
  ): void {
    writer.write({ type: 'tool-call-start', toolCallId, toolName, messageId });
    writer.write({
      type: 'tool-call-delta',
      toolCallId,
      argsTextDelta: JSON.stringify(args),
      messageId
    });
    writer.write({ type: 'tool-call-end', toolCallId, args, messageId });
  },

  /**
   * Write a tool result
   */
  writeToolResult(
    writer: UIMessageStreamWriter,
    toolCallId: string,
    result: unknown,
    isError = false,
    messageId?: string
  ): void {
    writer.write({ type: 'tool-result', toolCallId, result, isError, messageId });
  },

  /**
   * Write an error
   */
  writeError(writer: UIMessageStreamWriter, error: string, code?: string, messageId?: string): void {
    writer.write({ type: 'error', error, code, messageId, timestamp: Date.now() });
  },

  /**
   * Write custom data
   */
  writeData<T>(writer: UIMessageStreamWriter, key: string, data: T, messageId?: string): void {
    writer.write({ type: 'data', key, data, messageId, timestamp: Date.now() });
  }
};
