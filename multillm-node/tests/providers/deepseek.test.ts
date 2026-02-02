/**
 * DeepSeek Provider Integration Tests
 *
 * Tests for DeepSeek features.
 * Requires DEEPSEEK_API_KEY in environment variables.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import Multillm from '../index';

describe('DeepSeek Provider Integration Tests', () => {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  let llm: any;

  if (!apiKey) {
    it.skip('skipped - DEEPSEEK_API_KEY not set', () => {});
    return;
  }

  describe('Chat Completions', () => {
    beforeEach(() => {
      llm = new Multillm('deepseek', 'deepseek-chat', null, apiKey);
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
      let fullContent = '';

      for await (const chunk of llm.streamCompletion({
        messages: [{ role: 'user', content: 'Count to 5' }]
      })) {
        chunks.push(chunk);
        if (chunk.choices[0]?.delta?.content) {
          fullContent += chunk.choices[0].delta.content;
        }
      }

      expect(chunks.length).toBeGreaterThan(0);
      expect(fullContent).toBeTruthy();
    });
  });

  describe('Reasoning Models', () => {
    beforeEach(() => {
      llm = new Multillm('deepseek', 'deepseek-reasoner', null, apiKey);
    });

    it('should support reasoning models', async () => {
      const response = await llm.createCompletion({
        messages: [{ role: 'user', content: 'Solve: x + 5 = 12, what is x?' }],
        reasoning: {
          thinkingBudget: 10000,
          includeReasoning: true
        }
      });

      expect(response.choices[0].message.content).toBeDefined();
      expect(response.choices[0].message.reasoning?.thinking).toBeDefined();
      expect(response.usage.reasoning_tokens).toBeGreaterThan(0);
    });
  });

  describe('Tools', () => {
    beforeEach(() => {
      llm = new Multillm('deepseek', 'deepseek-chat', null, apiKey);
    });

    it('should support function calling', async () => {
      const tools = [{
        type: 'function' as const,
        function: {
          name: 'get_current_time',
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
      llm = new Multillm('deepseek', 'deepseek-chat', null, apiKey);
    });

    it('should return correct capabilities', () => {
      const caps = llm.getCapabilities();

      expect(caps.supportsStreaming).toBe(true);
      expect(caps.supportsTools).toBe(true);
      expect(caps.supportsVision).toBe(false);
      expect(caps.supportsEmbeddings).toBe(false);
      expect(caps.supportsCaching).toBe(true);
      expect(caps.cachingType).toBe('automatic');
      expect(caps.supportsReasoning).toBe(true);
      expect(caps.supportsMultimodal).toBe(false);
    });
  });
});
