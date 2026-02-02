/**
 * Embeddings Integration Tests
 *
 * Tests for embedding generation across providers.
 * Requires API keys in environment variables.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import Multillm from '../index';

describe('Embeddings Integration', () => {
  describe('OpenAI', () => {
    const apiKey = process.env.OPENAI_API_KEY;
    let llm: any;

    if (!apiKey) {
      it.skip('skipped - OPENAI_API_KEY not set', () => {});
      return;
    }

    beforeEach(() => {
      llm = new Multillm('openai', null, null, apiKey);
    });

    it('should create single embedding', async () => {
      const response = await llm.createEmbedding({
        input: 'Hello, world!',
        model: 'text-embedding-3-small'
      });

      expect(response.object).toBe('list');
      expect(response.data).toHaveLength(1);
      expect(response.data[0].embedding).toBeDefined();
      expect(Array.isArray(response.data[0].embedding)).toBe(true);
      expect(response.data[0].embedding.length).toBeGreaterThan(0);
      expect(response.model).toBeDefined();
    });

    it('should create batch embeddings', async () => {
      const texts = [
        'The cat sat on the mat',
        'The dog chased the cat',
        'Birds are flying high'
      ];

      const response = await llm.createEmbedding({
        input: texts,
        model: 'text-embedding-3-small'
      });

      expect(response.data).toHaveLength(3);
      expect(response.data[0].index).toBe(0);
      expect(response.data[1].index).toBe(1);
      expect(response.data[2].index).toBe(2);
      expect(response.usage.total_tokens).toBeGreaterThan(0);
    });

    it('should track token usage', async () => {
      const response = await llm.createEmbedding({
        input: 'Test text for embeddings',
        model: 'text-embedding-3-small'
      });

      expect(response.usage).toBeDefined();
      expect(response.usage.prompt_tokens).toBeGreaterThan(0);
      expect(response.usage.total_tokens).toBeGreaterThan(0);
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

    it('should support custom dimensions', async () => {
      const response = await llm.createEmbedding({
        input: 'test',
        model: 'text-embedding-3-large',
        dimensions: 512
      });

      expect((response.data[0].embedding as number[]).length).toBe(512);
    });
  });

  describe('Mistral', () => {
    const apiKey = process.env.MISTRAL_API_KEY;
    let llm: any;

    if (!apiKey) {
      it.skip('skipped - MISTRAL_API_KEY not set', () => {});
      return;
    }

    beforeEach(() => {
      llm = new Multillm('mistral', null, null, apiKey);
    });

    it('should create embeddings', async () => {
      const response = await llm.createEmbedding({
        input: 'Test embedding',
        model: 'mistral-embed'
      });

      expect(response.data).toBeDefined();
      expect(response.data[0].embedding).toBeDefined();
      expect(Array.isArray(response.data[0].embedding)).toBe(true);
    });

    it('should have consistent dimension size', async () => {
      const response = await llm.createEmbedding({
        input: 'Test',
        model: 'mistral-embed'
      });

      expect((response.data[0].embedding as number[]).length).toBe(1024);
    });
  });

  describe('Ollama (Local)', () => {
    let llm: any;

    beforeEach(() => {
      llm = new Multillm('ollama', 'nomic-embed-text', null, null, 'http://localhost:11434');
    });

    it.skip('requires Ollama to be running locally', async () => {
      // This test is skipped by default
      // Run manually after starting Ollama: ollama serve
      
      const response = await llm.createEmbedding({
        input: 'Test embedding'
      });

      expect(response.data).toBeDefined();
      expect(response.data[0].embedding).toBeDefined();
    });
  });

  describe('Similarity Calculations', () => {
    const apiKey = process.env.OPENAI_API_KEY;
    let llm: any;

    if (!apiKey) {
      it.skip('skipped - OPENAI_API_KEY not set', () => {});
      return;
    }

    beforeEach(() => {
      llm = new Multillm('openai', null, null, apiKey);
    });

    function cosineSimilarity(a: number[], b: number[]): number {
      const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
      const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
      const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
      return dotProduct / (magnitudeA * magnitudeB);
    }

    it('should calculate similarity for similar texts', async () => {
      const [emb1, emb2] = await Promise.all([
        llm.createEmbedding({ input: 'programming', model: 'text-embedding-3-small' }),
        llm.createEmbedding({ input: 'coding', model: 'text-embedding-3-small' })
      ]);

      const similarity = cosineSimilarity(
        emb1.data[0].embedding as number[],
        emb2.data[0].embedding as number[]
      );

      expect(similarity).toBeGreaterThan(0.8); // Similar texts should have high similarity
    });

    it('should calculate similarity for different texts', async () => {
      const [emb1, emb2] = await Promise.all([
        llm.createEmbedding({ input: 'machine learning', model: 'text-embedding-3-small' }),
        llm.createEmbedding({ input: 'baking a cake', model: 'text-embedding-3-small' })
      ]);

      const similarity = cosineSimilarity(
        emb1.data[0].embedding as number[],
        emb2.data[0].embedding as number[]
      );

      expect(similarity).toBeLessThan(0.5); // Different texts should have low similarity
    });
  });

  describe('Error Handling', () => {
    const apiKey = process.env.OPENAI_API_KEY;
    let llm: any;

    if (!apiKey) {
      it.skip('skipped - OPENAI_API_KEY not set', () => {});
      return;
    }

    beforeEach(() => {
      llm = new Multillm('openai', null, null, apiKey);
    });

    it('should handle empty input', async () => {
      await expect(
        llm.createEmbedding({ input: '' })
      ).rejects.toThrow();
    });

    it('should handle very long input', async () => {
      const longText = 'word '.repeat(10000);

      try {
        await llm.createEmbedding({
          input: longText,
          model: 'text-embedding-3-small'
        });
        expect.fail('Should have thrown error for too long input');
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.message).toContain('context_length');
      }
    });
  });
});
