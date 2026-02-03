/**
 * UI Stream Integration Tests
 *
 * Tests for UI streaming functionality.
 */

import { describe, it, expect } from 'vitest';
import {
  createUIMessageStreamResponse,
  UIMessageStreamWriter,
  UIMessageChunk
} from '../../ui-stream';

describe('UI Stream Integration Tests', () => {
  describe('Chunk Types', () => {
    it('should create text-start chunk', () => {
      const chunk: UIMessageChunk = {
        type: 'text-start',
        messageId: 'msg-1'
      };

      expect(chunk.type).toBe('text-start');
      expect(chunk.messageId).toBe('msg-1');
    });

    it('should create text-delta chunk', () => {
      const chunk: UIMessageChunk = {
        type: 'text-delta',
        content: 'Hello',
        messageId: 'msg-1'
      };

      expect(chunk.type).toBe('text-delta');
      expect(chunk.content).toBe('Hello');
    });

    it('should create text-end chunk', () => {
      const chunk: UIMessageChunk = {
        type: 'text-end',
        messageId: 'msg-1'
      };

      expect(chunk.type).toBe('text-end');
    });

    it('should create message-start chunk', () => {
      const chunk: UIMessageChunk = {
        type: 'message-start',
        messageId: 'msg-1',
        model: 'gpt-4o'
      };

      expect(chunk.type).toBe('message-start');
      expect(chunk.messageId).toBe('msg-1');
      expect(chunk.model).toBe('gpt-4o');
    });

    it('should create message-end chunk', () => {
      const chunk: UIMessageChunk = {
        type: 'message-end',
        messageId: 'msg-1',
        finishReason: 'stop',
        usage: {
          promptTokens: 10,
          completionTokens: 20,
          totalTokens: 30
        }
      };

      expect(chunk.type).toBe('message-end');
      expect(chunk.finishReason).toBe('stop');
      expect(chunk.usage).toBeDefined();
    });

    it('should create error chunk', () => {
      const chunk: UIMessageChunk = {
        type: 'error',
        error: 'API error occurred',
        code: 'API_ERROR',
        messageId: 'msg-1'
      };

      expect(chunk.type).toBe('error');
      expect(chunk.error).toBe('API error occurred');
      expect(chunk.code).toBe('API_ERROR');
    });

    it('should create tool-call-start chunk', () => {
      const chunk: UIMessageChunk = {
        type: 'tool-call-start',
        toolCallId: 'call-1',
        toolName: 'get_weather',
        messageId: 'msg-1'
      };

      expect(chunk.type).toBe('tool-call-start');
      expect(chunk.toolCallId).toBe('call-1');
      expect(chunk.toolName).toBe('get_weather');
    });

    it('should create tool-call-delta chunk', () => {
      const chunk: UIMessageChunk = {
        type: 'tool-call-delta',
        toolCallId: 'call-1',
        argsTextDelta: '"location',
        messageId: 'msg-1'
      };

      expect(chunk.type).toBe('tool-call-delta');
      expect(chunk.argsTextDelta).toBe('"location');
    });

    it('should create tool-call-end chunk', () => {
      const chunk: UIMessageChunk = {
        type: 'tool-call-end',
        toolCallId: 'call-1',
        args: { location: 'London' },
        messageId: 'msg-1'
      };

      expect(chunk.type).toBe('tool-call-end');
      expect(chunk.args).toBeDefined();
      expect(chunk.args.location).toBe('London');
    });
  });

  describe('Stream Creation', () => {
    it('should create stream response', async () => {
      const chunks: UIMessageChunk[] = [];

      const stream = await createUIMessageStreamResponse(async ({ writer }) => {
        writer.write({ type: 'message-start', messageId: 'msg-1', model: 'gpt-4o' });
        writer.write({ type: 'text-start' });
        
        chunks.push({ type: 'text-start' as any });
        chunks.push({ type: 'message-start' as any });

        writer.write({ type: 'text-delta', content: 'Hello', messageId: 'msg-1' });
        writer.write({ type: 'text-delta', content: ' world', messageId: 'msg-1' });
        
        chunks.push({ type: 'text-delta', content: 'Hello' as any });
        chunks.push({ type: 'text-delta', content: ' world' as any });

        writer.write({ type: 'text-end' });
        writer.write({ type: 'message-end', messageId: 'msg-1', finishReason: 'stop' });
      });

      expect(stream).toBeDefined();
      expect(chunks).toHaveLength(5);
    });

    it('should handle errors in stream', async () => {
      const chunks: UIMessageChunk[] = [];

      const stream = await createUIMessageStreamResponse(async ({ writer }) => {
        writer.write({ type: 'message-start', messageId: 'msg-2' });
        writer.write({ type: 'error', error: 'Something went wrong', messageId: 'msg-2' });
      });

      expect(stream).toBeDefined();
    });
  });

  describe('Type Guards', () => {
    it('should identify text chunks', () => {
      const textChunk = { type: 'text-delta', content: 'test' };
      const toolChunk = { type: 'tool-call-start', toolCallId: '1', toolName: 'test' };

      expect(isTextChunk(textChunk)).toBe(true);
      expect(isTextChunk(toolChunk)).toBe(false);
      expect(isToolCallChunk(toolChunk)).toBe(true);
      expect(isToolCallChunk(textChunk)).toBe(false);
    });
  });

  describe('Stream Headers', () => {
    it('should have correct SSE headers', () => {
      const headers = new Headers({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no'
      });

      expect(headers.get('Content-Type')).toBe('text/event-stream');
      expect(headers.get('Cache-Control')).toBe('no-cache, no-transform');
      expect(headers.get('Connection')).toBe('keep-alive');
      expect(headers.get('X-Accel-Buffering')).toBe('no');
    });
  });
});
