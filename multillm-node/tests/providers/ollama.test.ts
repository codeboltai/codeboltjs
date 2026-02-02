/**
 * Ollama Provider Integration Tests
 *
 * Tests for Ollama (local) features.
 * Requires Ollama to be running locally at http://localhost:11434
 */

import { describe, it, expect, beforeEach } from 'vitest';
import Multillm from '../index';

describe('Ollama Provider Integration Tests', () => {
  let llm: any;

  beforeEach(() => {
    llm = new Multillm('ollama', 'llama2', null, null, 'http://localhost:11434');
  });

  describe('Chat Completions', () => {
    it('should create basic completion', async () => {
      const response = await llm.createCompletion({
        messages: [{ role: 'user', content: 'Say hello' }]
      });

      expect(response.choices).toBeDefined();
      expect(response.choices[0].message.content).toBeDefined();
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

  describe('Multimodal (Vision)', () => {
    beforeEach(() => {
      llm = new Multillm('ollama', 'llava', null, null, 'http://localhost:11434');
    });

    it.skip('requires vision model (e.g., llava)', async () => {
      // This test requires a vision model to be pulled
      // Run manually after: ollama pull llava
      
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

  describe('Embeddings', () => {
    beforeEach(() => {
      llm = new Multillm('ollama', 'nomic-embed-text', null, null, 'http://localhost:11434');
    });

    it.skip('requires embedding model', async () => {
      // This test requires an embedding model to be pulled
      // Run manually after: ollama pull nomic-embed-text
      
      const response = await llm.createEmbedding({
        input: 'Test text'
      });

      expect(response.data).toBeDefined();
      expect(response.data[0].embedding).toBeDefined();
      expect(Array.isArray(response.data[0].embedding)).toBe(true);
    });
  });

  describe('Get Capabilities', () => {
    beforeEach(() => {
      llm = new Multillm('ollama', 'llama2', null, null, 'http://localhost:11434');
    });

    it('should return correct capabilities', () => {
      const caps = llm.getCapabilities();

      expect(caps.supportsStreaming).toBe(true);
      expect(caps.supportsTools).toBe(false);
      expect(caps.supportsVision).toBe(true);
      expect(caps.supportsEmbeddings).toBe(true);
      expect(caps.supportsCaching).toBe(false);
      expect(caps.supportsReasoning).toBe(false);
      expect(caps.supportsMultimodal).toBe(true);
    });
  });

  describe('Local Model Management', () => {
    it('should support custom models', async () => {
      const customLlm = new Multillm('ollama', 'custom-model-name', null, null, 'http://localhost:11434');

      const response = await customLlm.createCompletion({
        messages: [{ role: 'user', content: 'Test' }]
      });

      // Should use whatever model is available in Ollama
      expect(response.choices).toBeDefined();
    });
  });
});
