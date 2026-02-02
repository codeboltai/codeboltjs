/**
 * Remaining Providers Test Suite
 *
 * Tests for providers: Bedrock, Cloudflare, Perplexity, OpenRouter, HuggingFace, Grok, LM Studio, CodeBolt, ZAi
 */

import { describe, it, expect, beforeEach } from 'vitest';
import Multillm from '../index';

describe('Bedrock Provider Integration Tests', () => {
  const apiKey = process.env.AWS_ACCESS_KEY_ID;
  let llm: any;

  if (!apiKey || !process.env.AWS_SECRET_ACCESS_KEY) {
    it.skip('skipped - AWS credentials not set', () => {});
    return;
  }

  beforeEach(() => {
    llm = new Multillm('bedrock', null, null, null, null, {
      aws: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: 'us-east-1'
      }
    });
  });

  it('should create completion', async () => {
    const response = await llm.createCompletion({
      messages: [{ role: 'user', content: 'Say hello' }]
    });

    expect(response.choices).toBeDefined();
  });
});

describe('Cloudflare Provider Integration Tests', () => {
  const apiKey = process.env.CLOUDFLARE_API_KEY;
  let llm: any;

  if (!apiKey) {
    it.skip('skipped - CLOUDFLARE_API_KEY not set', () => {});
    return;
  }

  beforeEach(() => {
    llm = new Multillm('cloudflare', null, null, apiKey);
  });

  it('should create completion', async () => {
    const response = await llm.createCompletion({
      messages: [{ role: 'user', content: 'Say hello' }]
    });

    expect(response.choices).toBeDefined();
  });
});

describe('Perplexity Provider Integration Tests', () => {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  let llm: any;

  if (!apiKey) {
    it.skip('skipped - PERPLEXITY_API_KEY not set', () => {});
    return;
  }

  beforeEach(() => {
    llm = new Multillm('perplexity', 'sonnet-medium', null, apiKey);
  });

  it('should create completion', async () => {
    const response = await llm.createCompletion({
      messages: [{ role: 'user', content: 'Say hello' }]
    });

    expect(response.choices).toBeDefined();
  });
});

describe('OpenRouter Provider Integration Tests', () => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  let llm: any;

  if (!apiKey) {
    it.skip('skipped - OPENROUTER_API_KEY not set', () => {});
    return;
  }

  beforeEach(() => {
    llm = new Multillm('openrouter', null, null, apiKey);
  });

  it('should create completion', async () => {
    const response = await llm.createCompletion({
      messages: [{ role: 'user', content: 'Say hello' }]
    });

    expect(response.choices).toBeDefined();
  });
});

describe('HuggingFace Provider Integration Tests', () => {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  let llm: any;

  if (!apiKey) {
    it.skip('skipped - HUGGINGFACE_API_KEY not set', () => {});
    return;
  }

  beforeEach(() => {
    llm = new Multillm('huggingface', null, null, apiKey);
  });

  it('should create completion', async () => {
    const response = await llm.createCompletion({
      messages: [{ role: 'user', content: 'Say hello' }]
    });

    expect(response.choices).toBeDefined();
  });
});

describe('Grok Provider Integration Tests', () => {
  const apiKey = process.env.GROK_API_KEY;
  let llm: any;

  if (!apiKey) {
    it.skip('skipped - GROK_API_KEY not set', () => {});
    return;
  }

  beforeEach(() => {
    llm = new Multillm('grok', null, null, apiKey);
  });

  it('should create completion', async () => {
    const response = await llm.createCompletion({
      messages: [{ role: 'user', content: 'Say hello' }]
    });

    expect(response.choices).toBeDefined();
  });
});

describe('LM Studio Provider Integration Tests', () => {
  let llm: any;

  beforeEach(() => {
    llm = new Multillm('lmstudio', null, null, null, 'http://localhost:1234/v1');
  });

  it.skip('requires LM Studio to be running locally', async () => {
    const response = await llm.createCompletion({
      messages: [{ role: 'user', content: 'Say hello' }]
    });

    expect(response.choices).toBeDefined();
  });
});

describe('CodeBolt AI Provider Integration Tests', () => {
  const apiKey = process.env.CODEBOLT_API_KEY;
  let llm: any;

  if (!apiKey) {
    it.skip('skipped - CODEBOLT_API_KEY not set', () => {});
    return;
  }

  describe('Chat & Embeddings', () => {
    beforeEach(() => {
      llm = new Multillm('codeboltai', null, null, apiKey);
    });

    it('should create completion', async () => {
      const response = await llm.createCompletion({
        messages: [{ role: 'user', content: 'Say hello' }]
      });

      expect(response.choices).toBeDefined();
    });

    it('should create embeddings', async () => {
      const response = await llm.createEmbedding({
        input: 'Test text'
      });

      expect(response.data).toBeDefined();
      expect(response.data[0].embedding).toBeDefined();
    });
  });

  describe('Reranking', () => {
    beforeEach(() => {
      llm = new Multillm('codeboltai', null, null, apiKey);
    });

    it('should rerank documents', async () => {
      const response = await llm.rerank({
        query: 'machine learning',
        documents: ['doc1', 'doc2', 'doc3'],
        top_n: 2
      });

      expect(response.results).toBeDefined();
      expect(response.results).toHaveLength(2);
    });
  });
});

describe('ZAi Provider Integration Tests', () => {
  const apiKey = process.env.ZAI_API_KEY;
  let llm: any;

  if (!apiKey) {
    it.skip('skipped - ZAI_API_KEY not set', () => {});
    return;
  }

  beforeEach(() => {
    llm = new Multillm('zai', null, null, apiKey);
  });

  it('should create completion', async () => {
    const response = await llm.createCompletion({
      messages: [{ role: 'user', content: 'Say hello' }]
    });

    expect(response.choices).toBeDefined();
  });
});
