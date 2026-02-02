/**
 * Mistral Provider Integration Tests
 *
 * Tests for Mistral features.
 * Requires MISTRAL_API_KEY in environment variables.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import Multillm from '../index';

describe('Mistral Provider Integration Tests', () => {
  const apiKey = process.env.MISTRAL_API_KEY;
  let llm: any;

  if (!apiKey) {
    it.skip('skipped - MISTRAL_API_KEY not set', () => {});
    return;
  }

  describe('Chat Completions', () => {
    beforeEach(() => {
      llm = new Multillm('mistral', 'mistral-large', null, apiKey);
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
      }

      expect(chunks.length).toBeGreaterThan(0);
    });
  });

  describe('Embeddings', () => {
    beforeEach(() => {
      llm = new Multillm('mistral', null, null, apiKey);
    });

    it('should create embeddings', async () => {
      const response = await llm.createEmbedding({
        input: 'Test text',
        model: 'mistral-embed'
      });

      expect(response.data).toBeDefined();
      expect(response.data[0].embedding).toBeDefined();
      expect(Array.isArray(response.data[0].embedding)).toBe(true);
    });

    it('should support batch embeddings', async () => {
      const response = await llm.createEmbedding({
        input: ['text1', 'text2'],
        model: 'mistral-embed'
      });

      expect(response.data).toHaveLength(2);
    });
  });

  describe('Tools', () => {
    beforeEach(() => {
      llm = new Multillm('mistral', 'mistral-large', null, apiKey);
    });

    it('should support function calling', async () => {
      const tools = [{
        type: 'function' as const,
        function: {
          name: 'get_weather',
          description: 'Get weather',
          parameters: { type: 'object', properties: { location: { type: 'string' } }, required: ['location'] }
        }
      }];

      const response = await llm.createCompletion({
        messages: [{ role: 'user', content: 'Weather in Paris?' }],
        tools
      });

      expect(response.choices[0].message.tool_calls).toBeDefined();
    });
  });

  describe('Get Capabilities', () => {
    beforeEach(() => {
      llm = new Multillm('mistral', 'mistral-large', null, apiKey);
    });

    it('should return correct capabilities', () => {
      const caps = llm.getCapabilities();

      expect(caps.supportsStreaming).toBe(true);
      expect(caps.supportsTools).toBe(true);
      expect(caps.supportsVision).toBe(false);
      expect(caps.supportsEmbeddings).toBe(true);
      expect(caps.supportsCaching).toBe(false);
      expect(caps.supportsReasoning).toBe(false);
      expect(caps.supportsMultimodal).toBe(false);
    });
  });
});
