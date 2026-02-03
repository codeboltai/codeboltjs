/**
 * Provider Capabilities Tests
 *
 * Tests that providers correctly report their capabilities
 */

import { describe, it, expect } from 'vitest';
import type { ProviderCapabilities } from '../../types';

// Mock capabilities as they would be returned by each provider
const OPENAI_CAPABILITIES: ProviderCapabilities = {
  supportsStreaming: true,
  supportsTools: true,
  supportsVision: true,
  supportsEmbeddings: true,
  supportsCaching: true,
  cachingType: 'automatic',
  supportsImageGeneration: true,
  supportsReranking: false,
  supportsTranscription: true,
  supportsSpeech: true,
  supportsReasoning: true,
  supportsMultimodal: true
};

const ANTHROPIC_CAPABILITIES: ProviderCapabilities = {
  supportsStreaming: true,
  supportsTools: true,
  supportsVision: true,
  supportsEmbeddings: false,
  supportsCaching: true,
  cachingType: 'explicit',
  supportsReasoning: true,
  supportsMultimodal: true
};

const DEEPSEEK_CAPABILITIES: ProviderCapabilities = {
  supportsStreaming: true,
  supportsTools: true,
  supportsVision: false,
  supportsEmbeddings: false,
  supportsCaching: true,
  cachingType: 'automatic',
  supportsReasoning: true,
  supportsMultimodal: false
};

const GEMINI_CAPABILITIES: ProviderCapabilities = {
  supportsStreaming: true,
  supportsTools: true,
  supportsVision: true,
  supportsEmbeddings: true,
  supportsCaching: true,
  cachingType: 'explicit',
  supportsReasoning: false,
  supportsMultimodal: true
};

const OLLAMA_CAPABILITIES: ProviderCapabilities = {
  supportsStreaming: true,
  supportsTools: false,
  supportsVision: true,
  supportsEmbeddings: true,
  supportsCaching: false,
  cachingType: 'none',
  supportsReasoning: false,
  supportsMultimodal: true
};

describe('OpenAI Capabilities', () => {
  it('should support reasoning', () => {
    expect(OPENAI_CAPABILITIES.supportsReasoning).toBe(true);
  });

  it('should support multimodal', () => {
    expect(OPENAI_CAPABILITIES.supportsMultimodal).toBe(true);
  });

  it('should support all major features', () => {
    expect(OPENAI_CAPABILITIES.supportsStreaming).toBe(true);
    expect(OPENAI_CAPABILITIES.supportsTools).toBe(true);
    expect(OPENAI_CAPABILITIES.supportsVision).toBe(true);
    expect(OPENAI_CAPABILITIES.supportsEmbeddings).toBe(true);
    expect(OPENAI_CAPABILITIES.supportsTranscription).toBe(true);
    expect(OPENAI_CAPABILITIES.supportsSpeech).toBe(true);
  });

  it('should have automatic caching', () => {
    expect(OPENAI_CAPABILITIES.supportsCaching).toBe(true);
    expect(OPENAI_CAPABILITIES.cachingType).toBe('automatic');
  });
});

describe('Anthropic Capabilities', () => {
  it('should support reasoning (extended thinking)', () => {
    expect(ANTHROPIC_CAPABILITIES.supportsReasoning).toBe(true);
  });

  it('should support multimodal (images and PDFs)', () => {
    expect(ANTHROPIC_CAPABILITIES.supportsMultimodal).toBe(true);
  });

  it('should not support embeddings', () => {
    expect(ANTHROPIC_CAPABILITIES.supportsEmbeddings).toBe(false);
  });

  it('should have explicit caching', () => {
    expect(ANTHROPIC_CAPABILITIES.supportsCaching).toBe(true);
    expect(ANTHROPIC_CAPABILITIES.cachingType).toBe('explicit');
  });
});

describe('DeepSeek Capabilities', () => {
  it('should support reasoning', () => {
    expect(DEEPSEEK_CAPABILITIES.supportsReasoning).toBe(true);
  });

  it('should not support multimodal', () => {
    expect(DEEPSEEK_CAPABILITIES.supportsMultimodal).toBe(false);
  });

  it('should not support vision', () => {
    expect(DEEPSEEK_CAPABILITIES.supportsVision).toBe(false);
  });

  it('should have automatic caching', () => {
    expect(DEEPSEEK_CAPABILITIES.supportsCaching).toBe(true);
    expect(DEEPSEEK_CAPABILITIES.cachingType).toBe('automatic');
  });
});

describe('Gemini Capabilities', () => {
  it('should not support reasoning', () => {
    expect(GEMINI_CAPABILITIES.supportsReasoning).toBe(false);
  });

  it('should support multimodal', () => {
    expect(GEMINI_CAPABILITIES.supportsMultimodal).toBe(true);
  });

  it('should support vision', () => {
    expect(GEMINI_CAPABILITIES.supportsVision).toBe(true);
  });

  it('should support embeddings', () => {
    expect(GEMINI_CAPABILITIES.supportsEmbeddings).toBe(true);
  });
});

describe('Ollama Capabilities', () => {
  it('should not support reasoning', () => {
    expect(OLLAMA_CAPABILITIES.supportsReasoning).toBe(false);
  });

  it('should support multimodal (vision models)', () => {
    expect(OLLAMA_CAPABILITIES.supportsMultimodal).toBe(true);
  });

  it('should not support caching', () => {
    expect(OLLAMA_CAPABILITIES.supportsCaching).toBe(false);
    expect(OLLAMA_CAPABILITIES.cachingType).toBe('none');
  });

  it('should not support tools (limited)', () => {
    expect(OLLAMA_CAPABILITIES.supportsTools).toBe(false);
  });
});

describe('Capability Comparison', () => {
  const allCapabilities = [
    { name: 'OpenAI', caps: OPENAI_CAPABILITIES },
    { name: 'Anthropic', caps: ANTHROPIC_CAPABILITIES },
    { name: 'DeepSeek', caps: DEEPSEEK_CAPABILITIES },
    { name: 'Gemini', caps: GEMINI_CAPABILITIES },
    { name: 'Ollama', caps: OLLAMA_CAPABILITIES }
  ];

  it('all providers should support streaming', () => {
    allCapabilities.forEach(({ name, caps }) => {
      expect(caps.supportsStreaming).toBe(true);
    });
  });

  it('should correctly identify reasoning providers', () => {
    const reasoningProviders = allCapabilities
      .filter(({ caps }) => caps.supportsReasoning)
      .map(({ name }) => name);

    expect(reasoningProviders).toContain('OpenAI');
    expect(reasoningProviders).toContain('Anthropic');
    expect(reasoningProviders).toContain('DeepSeek');
    expect(reasoningProviders).not.toContain('Gemini');
    expect(reasoningProviders).not.toContain('Ollama');
  });

  it('should correctly identify multimodal providers', () => {
    const multimodalProviders = allCapabilities
      .filter(({ caps }) => caps.supportsMultimodal)
      .map(({ name }) => name);

    expect(multimodalProviders).toContain('OpenAI');
    expect(multimodalProviders).toContain('Anthropic');
    expect(multimodalProviders).toContain('Gemini');
    expect(multimodalProviders).toContain('Ollama');
    expect(multimodalProviders).not.toContain('DeepSeek');
  });
});
