/**
 * Gemini Provider Integration Tests
 *
 * Tests for Gemini features.
 * Requires GEMINI_API_KEY in environment variables.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import Multillm from '../index';

describe('Gemini Provider Integration Tests', () => {
  const apiKey = process.env.GEMINI_API_KEY;
  let llm: any;

  if (!apiKey) {
    it.skip('skipped - GEMINI_API_KEY not set', () => {});
    return;
  }

  describe('Chat Completions', () => {
    beforeEach(() => {
      llm = new Multillm('gemini', 'gemini-1.5-pro', null, apiKey);
    });

    it('should create basic completion', async () => {
      const response = await llm.createCompletion({
        messages: [{ role: 'user', content: 'Say hello' }]
      });

      expect(response.choices).toBeDefined();
      expect(response.choices[0].message.content).toBeDefined();
      expect(response.usage).toBeDefined();
    });

    it('should support streaming', async () => {
      const chunks: any[] = [];

      for await (const chunk of llm.streamCompletion({
        messages: [{ role: 'user', content: 'Count to 5' }]
      })) {
        chunks.push(chunk);
        if (chunk.choices[0]?.delta?.content) {
          expect(chunk.choices[0].delta.content).toBeTruthy();
        }
      }

      expect(chunks.length).toBeGreaterThan(0);
    });
  });

  describe('Multimodal (Vision)', () => {
    beforeEach(() => {
      llm = new Multillm('gemini', 'gemini-1.5-pro', null, apiKey);
    });

    it('should support image analysis', async () => {
      const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      const response = await llm.createCompletion({
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: 'What is in this image?' },
            {
              type: 'image',
              image: base64Image,
              mimeType: 'image/png'
            }
          ]
        }]
      });

      expect(response.choices[0].message.content).toBeDefined();
    });
  });

  describe('Tools', () => {
    beforeEach(() => {
      llm = new Multillm('gemini', 'gemini-1.5-pro', null, apiKey);
    });

    it('should support function calling', async () => {
      const tools = [{
        type: 'function' as const,
        function: {
          name: 'get_time',
          description: 'Get current time',
          parameters: { type: 'object', properties: {}, required: [] }
        }
      }];

      const response = await llm.createCompletion({
        messages: [{ role: 'user', content: 'What time is it?' }],
        tools
      });

      expect(response.choices[0].message.tool_calls).toBeDefined();
    });
  });

  describe('Get Capabilities', () => {
    beforeEach(() => {
      llm = new Multillm('gemini', 'gemini-1.5-pro', null, apiKey);
    });

    it('should return correct capabilities', () => {
      const caps = llm.getCapabilities();

      expect(caps.supportsStreaming).toBe(true);
      expect(caps.supportsTools).toBe(true);
      expect(caps.supportsVision).toBe(true);
      expect(caps.supportsEmbeddings).toBe(true);
      expect(caps.supportsCaching).toBe(true);
      expect(caps.supportsReasoning).toBe(false);
      expect(caps.supportsMultimodal).toBe(true);
    });
  });
});
