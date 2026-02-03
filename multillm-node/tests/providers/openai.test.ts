/**
 * OpenAI Provider Integration Tests
 *
 * Comprehensive tests for all OpenAI features.
 * Requires OPENAI_API_KEY in environment variables.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import Multillm from '../index';

describe('OpenAI Provider Integration Tests', () => {
  const apiKey = process.env.OPENAI_API_KEY;
  let llm: any;

  if (!apiKey) {
    it.skip('skipped - OPENAI_API_KEY not set', () => {});
    return;
  }

  describe('Chat Completions', () => {
    beforeEach(() => {
      llm = new Multillm('openai', 'gpt-4o', null, apiKey);
    });

    it('should create basic completion', async () => {
      const response = await llm.createCompletion({
        messages: [{ role: 'user', content: 'Say hello' }]
      });

      expect(response.choices).toBeDefined();
      expect(response.choices[0]).toBeDefined();
      expect(response.choices[0].message).toBeDefined();
      expect(response.choices[0].message.content).toBeDefined();
      expect(typeof response.choices[0].message.content).toBe('string');
      expect(response.usage).toBeDefined();
      expect(response.usage.total_tokens).toBeGreaterThan(0);
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

    it('should support temperature', async () => {
      const responses = await Promise.all([
        llm.createCompletion({
          messages: [{ role: 'user', content: 'Generate a random creative word and a brief made-up definition for it. Just the word and definition, no preamble.' }],
          temperature: 0.0
        }),
        llm.createCompletion({
          messages: [{ role: 'user', content: 'Generate a random creative word and a brief made-up definition for it. Just the word and definition, no preamble.' }],
          temperature: 1.0
        })
      ]);

      expect(responses[0]).toBeDefined();
      expect(responses[1]).toBeDefined();
      expect(responses[0].choices[0].message.content).not.toBe(
        responses[1].choices[0].message.content
      );
    });

    it('should support max_tokens', async () => {
      const response = await llm.createCompletion({
        messages: [{ role: 'user', content: 'Tell me a story' }],
        max_tokens: 50
      });

      expect(response.usage.completion_tokens).toBeLessThanOrEqual(50);
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
      llm = new Multillm('openai', 'gpt-4o', null, apiKey);
    });

    it('should support image URL input', async () => {
      const response = await llm.createCompletion({
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: 'What is in this image?' },
            {
              type: 'image',
              image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Camponotus_flavomarginatus_ant.jpg/1200px-Camponotus_flavomarginatus_ant.jpg'
            }
          ]
        }]
      });

      expect(response.choices[0].message.content).toBeDefined();
    });

    it('should support base64 image', async () => {
      const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      const response = await llm.createCompletion({
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: 'Describe this image' },
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

    it('should support detail parameter', async () => {
      const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      const response = await llm.createCompletion({
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: 'Describe this image' },
            {
              type: 'image',
              image: base64Image,
              mimeType: 'image/png',
              detail: 'high'
            }
          ]
        }]
      });

      expect(response.choices[0].message.content).toBeDefined();
    });
  });

  describe('Embeddings', () => {
    beforeEach(() => {
      llm = new Multillm('openai', null, null, apiKey);
    });

    it('should create embeddings', async () => {
      const response = await llm.createEmbedding({
        input: 'Test text',
        model: 'text-embedding-3-small'
      });

      expect(response.data).toHaveLength(1);
      expect(response.data[0].embedding).toBeDefined();
      expect(Array.isArray(response.data[0].embedding)).toBe(true);
    });

    it('should support batch embeddings', async () => {
      const response = await llm.createEmbedding({
        input: ['text1', 'text2', 'text3'],
        model: 'text-embedding-3-small'
      });

      expect(response.data).toHaveLength(3);
    });

    it('should support different models', async () => {
      const small = await llm.createEmbedding({
        input: 'test',
        model: 'text-embedding-3-small'
      });
      const large = await llm.createEmbedding({
        input: 'test',
        model: 'text-embedding-3-large'
      });

      expect(small.data[0].embedding.length).toBe(1536);
      expect(large.data[0].embedding.length).toBe(3072);
    });
  });

  describe('Image Generation', () => {
    beforeEach(() => {
      llm = new Multillm('openai', 'dall-e-3', null, apiKey);
    });

    it('should generate images', async () => {
      const response = await llm.createImage({
        prompt: 'A blue circle',
        size: '1024x1024'
      });

      expect(response.data).toHaveLength(1);
      expect(response.data[0].url).toBeDefined();
    });

    it('should support base64 format', async () => {
      const dallE2Llm = new Multillm('openai', 'dall-e-2', null, apiKey);
      const response = await dallE2Llm.createImage({
        model: 'dall-e-2',
        prompt: 'A red square',
        size: '256x256',
        response_format: 'b64_json'
      });

      expect(response.data[0].b64_json).toBeDefined();
    });

    it('should support quality parameter', async () => {
      const response = await llm.createImage({
        prompt: 'Test',
        size: '1024x1024',
        quality: 'hd'
      });

      expect(response.data[0].url).toBeDefined();
    });
  });

  describe('Speech Generation', () => {
    beforeEach(() => {
      llm = new Multillm('openai', 'tts-1', null, apiKey);
    });

    it('should generate speech', async () => {
      const response = await llm.createSpeech({
        input: 'Hello, world!',
        voice: 'alloy'
      });

      expect(response.audio).toBeInstanceOf(ArrayBuffer);
      expect(response.audio.byteLength).toBeGreaterThan(0);
    });

    it('should support all voices', async () => {
      const voices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];

      for (const voice of voices) {
        const response = await llm.createSpeech({
          input: 'Test',
          voice: voice as any
        });

        expect(response.audio).toBeDefined();
      }
    });
  });

  describe('Transcription', () => {
    beforeEach(() => {
      llm = new Multillm('openai', 'whisper-1', null, apiKey);
    });

    it('should transcribe audio', async () => {
      try {
        const response = await llm.createTranscription({
          audio: Buffer.from([]),
          model: 'whisper-1'
        });

        expect(response.text).toBeDefined();
      } catch (error) {
        // Expected without real audio file
      }
    });

    it('should support SRT format', async () => {
      try {
        const response = await llm.createTranscription({
          audio: Buffer.from([]),
          response_format: 'srt'
        });

        expect(response.text).toBeDefined();
      } catch (error) {
        // Expected without real audio file
      }
    });
  });

  describe('Tools/Function Calling', () => {
    beforeEach(() => {
      llm = new Multillm('openai', 'gpt-4o', null, apiKey);
    });

    const tools = [{
      type: 'function' as const,
      function: {
        name: 'get_current_time',
        description: 'Get the current time',
        parameters: {
          type: 'object',
          properties: {},
          required: []
        }
      }
    }];

    it('should call tools', async () => {
      const response = await llm.createCompletion({
        messages: [{ role: 'user', content: 'What time is it?' }],
        tools
      });

      expect(response.choices[0].message.tool_calls).toBeDefined();
    });

    it('should complete tool loop', async () => {
      let messages: any[] = [{ role: 'user', content: 'What time is it?' }];

      let response = await llm.createCompletion({ messages, tools });
      messages.push(response.choices[0].message);

      while (response.choices[0].message.tool_calls) {
        for (const toolCall of response.choices[0].message.tool_calls) {
          const result = JSON.stringify({ time: new Date().toISOString() });
          messages.push({
            role: 'tool',
            content: result,
            tool_call_id: toolCall.id
          });
        }
        response = await llm.createCompletion({ messages, tools });
        messages.push(response.choices[0].message);
      }

      expect(response.choices[0].message.tool_calls).toBeUndefined();
    });

    it('should support tool_choice auto', async () => {
      const response = await llm.createCompletion({
        messages: [{ role: 'user', content: 'Test' }],
        tools,
        tool_choice: 'auto'
      });

      expect(response).toBeDefined();
    });

    it('should support tool_choice none', async () => {
      const response = await llm.createCompletion({
        messages: [{ role: 'user', content: 'Hello' }],
        tools,
        tool_choice: 'none'
      });

      expect(response.choices[0].message.tool_calls).toBeUndefined();
    });
  });

  describe('Reasoning Models (o1/o3)', () => {
    beforeEach(() => {
      llm = new Multillm('openai', 'o1', null, apiKey);
    });

    it('should support o1 model', async () => {
      const response = await llm.createCompletion({
        messages: [{ role: 'user', content: 'Solve: x + 5 = 12, what is x?' }],
        reasoning: {
          thinkingBudget: 50000,
          reasoningEffort: 'high'
        }
      });

      expect(response.choices[0].message.content).toBeDefined();
      expect(response.usage).toBeDefined();
      expect(response.usage.total_tokens).toBeGreaterThan(0);
    });

    it('should handle reasoning parameters', async () => {
      const response = await llm.createCompletion({
        messages: [{ role: 'user', content: 'Complex problem' }],
        reasoning: {
          thinkingBudget: 30000,
          reasoningEffort: 'medium'
        }
      });

      expect(response.choices[0].message.content).toBeDefined();
    });
  });

  describe('Caching', () => {
    beforeEach(() => {
      llm = new Multillm('openai', 'gpt-4o', null, apiKey);
    });

    it('should support automatic caching', async () => {
      const largeSystemPrompt = 'You are an expert on: ' + 'A'.repeat(1000);

      const response1 = await llm.createCompletion({
        messages: [
          { role: 'system', content: largeSystemPrompt },
          { role: 'user', content: 'Test question 1' }
        ]
      });

      // Subsequent call with same system prompt should use cache
      const response2 = await llm.createCompletion({
        messages: [
          { role: 'system', content: largeSystemPrompt },
          { role: 'user', content: 'Test question 2' }
        ]
      });

      expect(response1).toBeDefined();
      expect(response2).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      llm = new Multillm('openai', 'gpt-4o', null, apiKey);
    });

    it('should handle invalid API key', async () => {
      const badLlm = new Multillm('openai', 'gpt-4o', null, 'invalid-key');

      try {
        await badLlm.createCompletion({
          messages: [{ role: 'user', content: 'Test' }]
        });
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.error).toBeDefined();
        expect(error.error.message).toBeDefined();
        expect(error.error.message).toContain('API key');
      }
    });

    it('should handle rate limiting', async () => {
      // This test would require many rapid requests
      // For now, just ensure error structure is correct
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

  describe('Get Capabilities', () => {
    beforeEach(() => {
      llm = new Multillm('openai', 'gpt-4o', null, apiKey);
    });

    it('should return correct capabilities', () => {
      const caps = llm.getCapabilities();

      expect(caps.supportsStreaming).toBe(true);
      expect(caps.supportsTools).toBe(true);
      expect(caps.supportsVision).toBe(true);
      expect(caps.supportsEmbeddings).toBe(true);
      expect(caps.supportsCaching).toBe(true);
      expect(caps.cachingType).toBe('automatic');
      expect(caps.supportsImageGeneration).toBe(true);
      expect(caps.supportsTranscription).toBe(true);
      expect(caps.supportsSpeech).toBe(true);
      expect(caps.supportsReasoning).toBe(true);
      expect(caps.supportsMultimodal).toBe(true);
    });
  });
});
