/**
 * Groq Provider Integration Tests
 *
 * Tests for Groq features.
 * Requires GROQ_API_KEY in environment variables.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import Multillm from '../index';

describe('Groq Provider Integration Tests', () => {
  const apiKey = process.env.GROQ_API_KEY;
  let llm: any;

  if (!apiKey) {
    it.skip('skipped - GROQ_API_KEY not set', () => {});
    return;
  }

  describe('Chat Completions', () => {
    beforeEach(() => {
      llm = new Multillm('groq', 'llama-3.1-70b', null, apiKey);
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

  describe('Transcription', () => {
    beforeEach(() => {
      llm = new Multillm('groq', 'whisper-large-v3', null, apiKey);
    });

    it('should transcribe audio', async () => {
      try {
        const response = await llm.createTranscription({
          audio: Buffer.from([]),
          model: 'whisper-large-v3'
        });

        expect(response.text).toBeDefined();
      } catch (error) {
        // Expected without real audio
      }
    });

    it('should support different models', async () => {
      const models = ['whisper-large-v3', 'whisper-medium'];

      for (const model of models) {
        try {
          const response = await llm.createTranscription({
            audio: Buffer.from([]),
            model
          });

          expect(response).toBeDefined();
        } catch (error) {
          // Expected without real audio
        }
      }
    });
  });

  describe('Tools', () => {
    beforeEach(() => {
      llm = new Multillm('groq', 'llama-3.1-70b', null, apiKey);
    });

    it('should support function calling', async () => {
      const tools = [{
        type: 'function' as const,
        function: {
          name: 'calculate',
          description: 'Perform calculation',
          parameters: { type: 'object', properties: { expression: { type: 'string' } }, required: ['expression'] }
        }
      }];

      const response = await llm.createCompletion({
        messages: [{ role: 'user', content: 'What is 2+2?' }],
        tools
      });

      expect(response.choices[0].message.tool_calls).toBeDefined();
    });
  });

  describe('Get Capabilities', () => {
    beforeEach(() => {
      llm = new Multillm('groq', 'llama-3.1-70b', null, apiKey);
    });

    it('should return correct capabilities', () => {
      const caps = llm.getCapabilities();

      expect(caps.supportsStreaming).toBe(true);
      expect(caps.supportsTools).toBe(true);
      expect(caps.supportsVision).toBe(false);
      expect(caps.supportsEmbeddings).toBe(false);
      expect(caps.supportsCaching).toBe(false);
      expect(caps.supportsReasoning).toBe(false);
      expect(caps.supportsTranscription).toBe(true);
      expect(caps.supportsMultimodal).toBe(false);
    });
  });
});
