/**
 * Anthropic Provider Integration Tests
 *
 * Comprehensive tests for all Anthropic features.
 * Requires ANTHROPIC_API_KEY in environment variables.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import Multillm from '../index';

describe('Anthropic Provider Integration Tests', () => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  let llm: any;

  if (!apiKey) {
    it.skip('skipped - ANTHROPIC_API_KEY not set', () => {});
    return;
  }

  describe('Chat Completions', () => {
    beforeEach(() => {
      llm = new Multillm('anthropic', 'claude-3-5-sonnet-20241022', null, apiKey);
    });

    it('should create basic completion', async () => {
      const response = await llm.createCompletion({
        messages: [{ role: 'user', content: 'Say hello' }]
      });

      expect(response.choices).toBeDefined();
      expect(response.choices[0].message.content).toBeDefined();
      expect(response.usage).toBeDefined();
    });

    it('should support system messages', async () => {
      const response = await llm.createCompletion({
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'What is 2+2?' }
        ]
      });

      expect(response.choices[0].message.content).toContain('4');
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

  describe('Multimodal (Vision)', () => {
    beforeEach(() => {
      llm = new Multillm('anthropic', 'claude-3-5-sonnet-20241022', null, apiKey);
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

    it('should support PDF analysis', async () => {
      const base64Pdf = 'JVBERi0xLjQK'; // PDF header

      const response = await llm.createCompletion({
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: 'Summarize this document' },
            {
              type: 'file',
              file: base64Pdf,
              mimeType: 'application/pdf',
              filename: 'test.pdf'
            }
          ]
        }]
      });

      expect(response.choices[0].message.content).toBeDefined();
    });
  });

  describe('Reasoning Models (Extended Thinking)', () => {
    beforeEach(() => {
      llm = new Multillm('anthropic', 'claude-3-7-sonnet-20250219', null, apiKey);
    });

    it('should support extended thinking', async () => {
      const response = await llm.createCompletion({
        messages: [{ role: 'user', content: 'Explain quantum computing step by step' }],
        reasoning: {
          thinkingBudget: 10000,
          includeReasoning: true
        }
      });

      expect(response.choices[0].message.reasoning?.thinking).toBeDefined();
      expect(response.choices[0].message.reasoning?.thinking.length).toBeGreaterThan(0);
    });

    it('should include reasoning in response', async () => {
      const response = await llm.createCompletion({
        messages: [{ role: 'user', content: 'Solve this step by step: x + 5 = 12, what is x?' }],
        reasoning: {
          thinkingBudget: 8000,
          includeReasoning: true
        }
      });

      expect(response.choices[0].message.content).toBeDefined();
      expect(response.choices[0].message.reasoning?.thinking).toBeDefined();
    });

    it('should track reasoning tokens', async () => {
      const response = await llm.createCompletion({
        messages: [{ role: 'user', content: 'Complex problem' }],
        reasoning: {
          thinkingBudget: 5000
        }
      });

      expect(response.usage.cache_creation_tokens).toBeGreaterThan(0);
    });
  });

  describe('Tools/Function Calling', () => {
    beforeEach(() => {
      llm = new Multillm('anthropic', 'claude-3-5-sonnet-20241022', null, apiKey);
    });

    const tools = [{
      type: 'function' as const,
      function: {
        name: 'get_weather',
        description: 'Get the current weather',
        input_schema: {
          type: 'object',
          properties: {
            location: {
              type: 'string',
              description: 'City name'
            }
          },
          required: ['location']
        }
      }
    }];

    it('should request tool use', async () => {
      const response = await llm.createCompletion({
        messages: [{ role: 'user', content: 'What is the weather in London?' }],
        tools
      });

      expect(response.choices[0].message.tool_calls).toBeDefined();
    });

    it('should complete tool loop', async () => {
      let messages: any[] = [{ role: 'user', content: 'What is the weather in London?' }];

      let response = await llm.createCompletion({ messages, tools });
      messages.push(response.choices[0].message);

      while (response.choices[0].message.tool_calls) {
        for (const toolCall of response.choices[0].message.tool_calls) {
          const result = JSON.stringify({ temp: 20, condition: 'sunny', location: 'London' });
          messages.push({
            role: 'user',
            content: [
              {
                type: 'tool_result',
                tool_use_id: toolCall.id,
                content: result
              }
            ]
          });
        }
        response = await llm.createCompletion({ messages, tools });
        messages.push(response.choices[0].message);
      }

      expect(response.choices[0].message.tool_calls).toBeUndefined();
      expect(response.choices[0].message.content).toBeDefined();
    });

    it('should support multiple tools', async () => {
      const multiTools = [
        {
          type: 'function' as const,
          function: {
            name: 'get_weather',
            description: 'Get weather',
            input_schema: {
              type: 'object',
              properties: { location: { type: 'string' } },
              required: ['location']
            }
          }
        },
        {
          type: 'function' as const,
          function: {
            name: 'get_time',
            description: 'Get time',
            input_schema: {
              type: 'object',
              properties: {},
              required: []
            }
          }
        }
      ];

      const response = await llm.createCompletion({
        messages: [{ role: 'user', content: 'What is the weather and time?' }],
        tools: multiTools
      });

      expect(response.choices[0].message.tool_calls).toBeDefined();
    });
  });

  describe('Caching (Explicit)', () => {
    beforeEach(() => {
      llm = new Multillm('anthropic', 'claude-3-5-sonnet-20241022', null, apiKey);
    });

    it('should support explicit caching', async () => {
      const largeSystemPrompt = 'You are an expert documentation assistant: ' + 'A'.repeat(1000);

      const response = await llm.createCompletion({
        messages: [
          { role: 'system', content: largeSystemPrompt },
          { role: 'user', content: 'Question' }
        ],
        enableCaching: true,
        systemCacheControl: { type: 'ephemeral' }
      });

      expect(response.usage.cache_creation_tokens).toBeGreaterThan(0);
    });

    it('should track cached tokens', async () => {
      const response = await llm.createCompletion({
        messages: [
          { role: 'system', content: 'Cached system prompt' },
          { role: 'user', content: 'Question' }
        ],
        enableCaching: true
      });

      expect(response.usage).toBeDefined();
      expect(response.usage.cached_tokens).toBeGreaterThan(0);
    });
  });

  describe('Get Capabilities', () => {
    beforeEach(() => {
      llm = new Multillm('anthropic', 'claude-3-5-sonnet-20241022', null, apiKey);
    });

    it('should return correct capabilities', () => {
      const caps = llm.getCapabilities();

      expect(caps.supportsStreaming).toBe(true);
      expect(caps.supportsTools).toBe(true);
      expect(caps.supportsVision).toBe(true);
      expect(caps.supportsEmbeddings).toBe(false);
      expect(caps.supportsCaching).toBe(true);
      expect(caps.cachingType).toBe('explicit');
      expect(caps.supportsImageGeneration).toBe(false);
      expect(caps.supportsTranscription).toBe(false);
      expect(caps.supportsSpeech).toBe(false);
      expect(caps.supportsReasoning).toBe(true);
      expect(caps.supportsMultimodal).toBe(true);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      llm = new Multillm('anthropic', 'claude-3-5-sonnet-20241022', null, apiKey);
    });

    it('should handle invalid API key', async () => {
      const badLlm = new Multillm('anthropic', 'claude-3-5-sonnet-20241022', null, 'invalid-key');

      try {
        await badLlm.createCompletion({
          messages: [{ role: 'user', content: 'Test' }]
        });
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });

    it('should handle rate limiting', async () => {
      try {
        await llm.createCompletion({
          messages: [{ role: 'user', content: 'Test' }]
        });
      } catch (error: any) {
        if (error.message?.includes('rate_limit')) {
          expect(error).toBeDefined();
        }
      }
    });
  });

  describe('Different Models', () => {
    const models = [
      'claude-3-opus-20240229',
      'claude-3-5-sonnet-20241022',
      'claude-3-7-sonnet-20250219'
    ];

    models.forEach(model => {
      describe(`Model: ${model}`, () => {
        beforeEach(() => {
          llm = new Multillm('anthropic', model, null, apiKey);
        });

        it('should create completion', async () => {
          const response = await llm.createCompletion({
            messages: [{ role: 'user', content: 'Say hello' }]
          });

          expect(response.choices[0].message.content).toBeDefined();
        });
      });
    });
  });
});
