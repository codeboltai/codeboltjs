/**
 * Reranking Integration Tests
 *
 * Tests for document reranking.
 * Requires API keys in environment variables.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import Multillm from '../index';

describe('Reranking Integration', () => {
  describe('CodeBolt AI', () => {
    const apiKey = process.env.CODEBOLT_API_KEY;
    let llm: any;

    if (!apiKey) {
      it.skip('skipped - CODEBOLT_API_KEY not set', () => {});
      return;
    }

    beforeEach(() => {
      llm = new Multillm('codeboltai', null, null, apiKey);
    });

    it('should rerank documents by relevance', async () => {
      const query = 'machine learning algorithms';
      const documents = [
        'Introduction to neural networks',
        'Random forests explained',
        'How to bake a cake',
        'Support vector machines tutorial'
      ];

      const response = await llm.rerank({
        query,
        documents,
        top_n: 3
      });

      expect(response.results).toBeDefined();
      expect(response.results).toHaveLength(3);
      expect(response.results[0].relevance_score).toBeGreaterThan(0.8);
      // Cake recipe should be excluded (low relevance)
      expect(response.results.map(r => r.index)).not.toContain(2);
    });

    it('should return correct document order', async () => {
      const query = 'JavaScript programming';
      const documents = [
        'Python is a programming language',
        'JavaScript runs in browsers',
        'Rust is a systems language',
        'Java is object-oriented'
      ];

      const response = await llm.rerank({
        query,
        documents,
        top_n: 2
      });

      expect(response.results[0].index).toBe(1); // JavaScript
      expect(response.results[0].relevance_score).toBeGreaterThan(
        response.results[1].relevance_score
      );
    });

    it('should support different top_n values', async () => {
      const query = 'web development';
      const documents = [
        'HTML basics',
        'CSS styling',
        'JavaScript fundamentals',
        'React framework',
        'Vue.js guide',
        'Angular tutorial'
      ];

      for (const topN of [1, 3, 5]) {
        const response = await llm.rerank({
          query,
          documents,
          top_n: topN
        });

        expect(response.results).toHaveLength(topN);
      }
    });

    it('should return documents when requested', async () => {
      const query = 'AI technology';
      const documents = [
        { text: 'Machine learning overview', id: 1 },
        { text: 'Deep learning concepts', id: 2 },
        { text: 'Neural networks explained', id: 3 }
      ];

      const response = await llm.rerank({
        query,
        documents: documents.map(d => d.text),
        top_n: 2,
        return_documents: true
      });

      expect(response.results).toHaveLength(2);
      expect(response.results[0].document).toBeDefined();
      expect(response.results[0].document.text).toBeTruthy();
    });

    it('should handle large document sets', async () => {
      const query = 'data science';
      const documents = Array.from({ length: 100 }, (_, i) => ({
        text: `Document ${i}: Content about topic ${i % 10}`,
        id: i
      }));

      const response = await llm.rerank({
        query,
        documents: documents.map(d => d.text),
        top_n: 10
      });

      expect(response.results).toHaveLength(10);
      expect(response.results[0].relevance_score).toBeGreaterThan(0.5);
    });

    it('should provide relevance scores', async () => {
      const query = 'Which programming language for web?';
      const documents = [
        'JavaScript is essential for web',
        'Python is great for data science',
        'Rust is for systems programming',
        'Java is widely used'
      ];

      const response = await llm.rerank({
        query,
        documents,
        top_n: 4
      });

      expect(response.results[0].relevance_score).toBeGreaterThan(
        response.results[3].relevance_score
      );
    });
  });

  describe('RAG Pipeline', () => {
    const apiKey = process.env.CODEBOLT_API_KEY;
    let llm: any;

    if (!apiKey) {
      it.skip('skipped - CODEBOLT_API_KEY not set', () => {});
      return;
    }

    beforeEach(() => {
      llm = new Multillm('codeboltai', null, null, apiKey);
    });

    it('should integrate with retrieval', async () => {
      const query = 'What is machine learning?';
      
      // Simulated retrieval (in real use, get from vector DB)
      const retrievedDocuments = [
        'Machine learning is a subset of AI',
        'It enables computers to learn from data',
        'Neural networks are key components',
        'Supervised learning uses labeled data',
        'Unsupervised learning finds patterns'
      ];

      // Rerank retrieved documents
      const reranked = await llm.rerank({
        query,
        documents: retrievedDocuments,
        top_n: 3
      });

      expect(reranked.results).toHaveLength(3);
      expect(reranked.results[0].relevance_score).toBeGreaterThan(0.7);
    });
  });

  describe('Error Handling', () => {
    const apiKey = process.env.CODEBOLT_API_KEY;
    let llm: any;

    if (!apiKey) {
      it.skip('skipped - CODEBOLT_API_KEY not set', () => {});
      return;
    }

    beforeEach(() => {
      llm = new Multillm('codeboltai', null, null, apiKey);
    });

    it('should handle empty query', async () => {
      try {
        await llm.rerank({
          query: '',
          documents: ['doc1', 'doc2']
        });
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });

    it('should handle empty documents', async () => {
      try {
        await llm.rerank({
          query: 'test query',
          documents: []
        });
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });

    it('should handle top_n larger than document count', async () => {
      const response = await llm.rerank({
        query: 'test',
        documents: ['doc1', 'doc2'],
        top_n: 10
      });

      expect(response.results).toHaveLength(2);
    });
  });

  describe('Query Variations', () => {
    const apiKey = process.env.CODEBOLT_API_KEY;
    let llm: any;

    if (!apiKey) {
      it.skip('skipped - CODEBOLT_API_KEY not set', () => {});
      return;
    }

    beforeEach(() => {
      llm = new Multillm('codeboltai', null, null, apiKey);
    });

    it('should handle different query formulations', async () => {
      const documents = [
        'JavaScript is a programming language',
        'JavaScript is essential for web development',
        'JavaScript runs in browsers'
      ];

      const queries = [
        'What is JavaScript?',
        'Tell me about JavaScript',
        'JavaScript programming language'
      ];

      const results = await Promise.all(
        queries.map(query =>
          llm.rerank({
            query,
            documents,
            top_n: 1
          })
        )
      );

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.results).toHaveLength(1);
      });
    });
  });
});
