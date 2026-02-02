/**
 * Unit Tests for Reasoning Model Utilities
 *
 * Tests reasoning model detection and parameter configuration
 */

import { describe, it, expect } from 'vitest';
import {
  OPENAI_REASONING_MODELS,
  ANTHROPIC_THINKING_MODELS,
  DEEPSEEK_REASONING_MODELS,
  isReasoningModel,
  getDefaultThinkingBudget,
  getOpenAIReasoningParams,
  getAnthropicThinkingParams,
  requiresSpecialParams
} from '../../utils/reasoningModels';

describe('Reasoning Model Constants', () => {
  describe('OPENAI_REASONING_MODELS', () => {
    it('should include o1 models', () => {
      expect(OPENAI_REASONING_MODELS.has('o1')).toBe(true);
      expect(OPENAI_REASONING_MODELS.has('o1-preview')).toBe(true);
      expect(OPENAI_REASONING_MODELS.has('o1-mini')).toBe(true);
    });

    it('should include o3 models', () => {
      expect(OPENAI_REASONING_MODELS.has('o3')).toBe(true);
      expect(OPENAI_REASONING_MODELS.has('o3-mini')).toBe(true);
    });

    it('should not include standard models', () => {
      expect(OPENAI_REASONING_MODELS.has('gpt-4')).toBe(false);
      expect(OPENAI_REASONING_MODELS.has('gpt-4o')).toBe(false);
    });
  });

  describe('ANTHROPIC_THINKING_MODELS', () => {
    it('should include Claude 3.5/3.7 thinking models', () => {
      expect(ANTHROPIC_THINKING_MODELS.has('claude-3-5-sonnet-20241022')).toBe(true);
      expect(ANTHROPIC_THINKING_MODELS.has('claude-3-7-sonnet-20250219')).toBe(true);
    });

    it('should include Claude 4 models', () => {
      expect(ANTHROPIC_THINKING_MODELS.has('claude-sonnet-4-20250514')).toBe(true);
      expect(ANTHROPIC_THINKING_MODELS.has('claude-opus-4-20250514')).toBe(true);
    });

    it('should not include older models', () => {
      expect(ANTHROPIC_THINKING_MODELS.has('claude-3-opus-20240229')).toBe(false);
      expect(ANTHROPIC_THINKING_MODELS.has('claude-2')).toBe(false);
    });
  });

  describe('DEEPSEEK_REASONING_MODELS', () => {
    it('should include DeepSeek reasoning models', () => {
      expect(DEEPSEEK_REASONING_MODELS.has('deepseek-reasoner')).toBe(true);
      expect(DEEPSEEK_REASONING_MODELS.has('deepseek-r1')).toBe(true);
    });

    it('should include distill variants', () => {
      expect(DEEPSEEK_REASONING_MODELS.has('deepseek-r1-distill-llama-70b')).toBe(true);
      expect(DEEPSEEK_REASONING_MODELS.has('deepseek-r1-distill-qwen-32b')).toBe(true);
    });

    it('should not include standard chat models', () => {
      expect(DEEPSEEK_REASONING_MODELS.has('deepseek-chat')).toBe(false);
      expect(DEEPSEEK_REASONING_MODELS.has('deepseek-coder')).toBe(false);
    });
  });
});

describe('isReasoningModel', () => {
  describe('OpenAI', () => {
    it('should return true for o1 models', () => {
      expect(isReasoningModel('o1', 'openai')).toBe(true);
      expect(isReasoningModel('o1-preview', 'openai')).toBe(true);
      expect(isReasoningModel('o1-mini', 'openai')).toBe(true);
    });

    it('should return true for o3 models', () => {
      expect(isReasoningModel('o3', 'openai')).toBe(true);
      expect(isReasoningModel('o3-mini', 'openai')).toBe(true);
    });

    it('should handle prefix matching', () => {
      expect(isReasoningModel('o1-2024-12-17', 'openai')).toBe(true);
      expect(isReasoningModel('o3-large', 'openai')).toBe(true);
    });

    it('should return false for standard GPT models', () => {
      expect(isReasoningModel('gpt-4', 'openai')).toBe(false);
      expect(isReasoningModel('gpt-4o', 'openai')).toBe(false);
      expect(isReasoningModel('gpt-3.5-turbo', 'openai')).toBe(false);
    });
  });

  describe('Anthropic', () => {
    it('should return true for extended thinking models', () => {
      expect(isReasoningModel('claude-3-7-sonnet-20250219', 'anthropic')).toBe(true);
      expect(isReasoningModel('claude-sonnet-4-20250514', 'anthropic')).toBe(true);
      expect(isReasoningModel('claude-opus-4-20250514', 'anthropic')).toBe(true);
    });

    it('should handle pattern matching', () => {
      expect(isReasoningModel('claude-3-7-sonnet-latest', 'anthropic')).toBe(true);
      expect(isReasoningModel('claude-sonnet-4-latest', 'anthropic')).toBe(true);
    });

    it('should return false for older Claude models', () => {
      expect(isReasoningModel('claude-3-opus-20240229', 'anthropic')).toBe(false);
      expect(isReasoningModel('claude-3-haiku-20240307', 'anthropic')).toBe(false);
    });
  });

  describe('DeepSeek', () => {
    it('should return true for reasoner models', () => {
      expect(isReasoningModel('deepseek-reasoner', 'deepseek')).toBe(true);
      expect(isReasoningModel('deepseek-r1', 'deepseek')).toBe(true);
    });

    it('should handle pattern matching', () => {
      expect(isReasoningModel('deepseek-r1-lite', 'deepseek')).toBe(true);
      expect(isReasoningModel('my-reasoner-model', 'deepseek')).toBe(true);
    });

    it('should return false for standard DeepSeek models', () => {
      expect(isReasoningModel('deepseek-chat', 'deepseek')).toBe(false);
      expect(isReasoningModel('deepseek-coder', 'deepseek')).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should return false for null model', () => {
      expect(isReasoningModel(null, 'openai')).toBe(false);
      expect(isReasoningModel(undefined, 'anthropic')).toBe(false);
    });

    it('should return false for unknown provider', () => {
      expect(isReasoningModel('o1', 'unknown')).toBe(false);
      expect(isReasoningModel('claude-3-7-sonnet-20250219', 'unknown')).toBe(false);
    });

    it('should handle case insensitivity', () => {
      expect(isReasoningModel('O1-PREVIEW', 'openai')).toBe(true);
      expect(isReasoningModel('CLAUDE-3-7-SONNET-20250219', 'anthropic')).toBe(true);
    });
  });
});

describe('getDefaultThinkingBudget', () => {
  describe('OpenAI', () => {
    it('should return 100000 for o3 models', () => {
      expect(getDefaultThinkingBudget('o3', 'openai')).toBe(100000);
      expect(getDefaultThinkingBudget('o3-mini', 'openai')).toBe(100000);
    });

    it('should return 65536 for o1 models', () => {
      expect(getDefaultThinkingBudget('o1', 'openai')).toBe(65536);
      expect(getDefaultThinkingBudget('o1-preview', 'openai')).toBe(65536);
    });

    it('should return 32768 for other OpenAI models', () => {
      expect(getDefaultThinkingBudget('gpt-4', 'openai')).toBe(32768);
    });
  });

  describe('Anthropic', () => {
    it('should return 10000 for Anthropic models', () => {
      expect(getDefaultThinkingBudget('claude-3-7-sonnet-20250219', 'anthropic')).toBe(10000);
      expect(getDefaultThinkingBudget('claude-sonnet-4-20250514', 'anthropic')).toBe(10000);
    });
  });

  describe('DeepSeek', () => {
    it('should return 32768 for DeepSeek models', () => {
      expect(getDefaultThinkingBudget('deepseek-reasoner', 'deepseek')).toBe(32768);
    });
  });

  describe('Edge Cases', () => {
    it('should return 16384 for null model', () => {
      expect(getDefaultThinkingBudget(null, 'openai')).toBe(16384);
      expect(getDefaultThinkingBudget(undefined, 'anthropic')).toBe(16384);
    });

    it('should return 16384 for unknown provider', () => {
      expect(getDefaultThinkingBudget('any-model', 'unknown')).toBe(16384);
    });
  });
});

describe('getOpenAIReasoningParams', () => {
  it('should use thinkingBudget when provided', () => {
    const params = getOpenAIReasoningParams('o1', { thinkingBudget: 50000 });
    expect(params.max_completion_tokens).toBe(50000);
  });

  it('should fallback to max_tokens when no thinkingBudget', () => {
    const params = getOpenAIReasoningParams('o1', { max_tokens: 8000 });
    expect(params.max_completion_tokens).toBe(8000);
  });

  it('should use default budget when no tokens specified', () => {
    const params = getOpenAIReasoningParams('o1', {});
    expect(params.max_completion_tokens).toBe(65536);
  });

  it('should include reasoning_effort when specified', () => {
    const params = getOpenAIReasoningParams('o1', { reasoningEffort: 'high' });
    expect(params.reasoning_effort).toBe('high');
  });

  it('should not include reasoning_effort when not specified', () => {
    const params = getOpenAIReasoningParams('o1', {});
    expect(params.reasoning_effort).toBeUndefined();
  });

  it('should not include temperature (not supported for reasoning models)', () => {
    const params = getOpenAIReasoningParams('o1', { temperature: 0.7 });
    expect(params.temperature).toBeUndefined();
  });
});

describe('getAnthropicThinkingParams', () => {
  it('should return enabled thinking with default budget', () => {
    const params = getAnthropicThinkingParams({});
    expect(params).toEqual({
      type: 'enabled',
      budget_tokens: 10000
    });
  });

  it('should use custom budget when provided', () => {
    const params = getAnthropicThinkingParams({ thinkingBudget: 50000 });
    expect(params).toEqual({
      type: 'enabled',
      budget_tokens: 50000
    });
  });

  it('should return undefined when reasoning explicitly disabled', () => {
    const params = getAnthropicThinkingParams({ includeReasoning: false });
    expect(params).toBeUndefined();
  });

  it('should return enabled when reasoning not explicitly set', () => {
    const params = getAnthropicThinkingParams({});
    expect(params).toBeDefined();
    expect(params?.type).toBe('enabled');
  });
});

describe('requiresSpecialParams', () => {
  describe('OpenAI', () => {
    it('should return true for o1 models', () => {
      expect(requiresSpecialParams('o1', 'openai')).toBe(true);
      expect(requiresSpecialParams('o1-preview', 'openai')).toBe(true);
      expect(requiresSpecialParams('o1-mini', 'openai')).toBe(true);
    });

    it('should return true for o3 models', () => {
      expect(requiresSpecialParams('o3', 'openai')).toBe(true);
      expect(requiresSpecialParams('o3-mini', 'openai')).toBe(true);
    });

    it('should return false for standard GPT models', () => {
      expect(requiresSpecialParams('gpt-4', 'openai')).toBe(false);
      expect(requiresSpecialParams('gpt-4o', 'openai')).toBe(false);
    });
  });

  describe('Other Providers', () => {
    it('should return false for Anthropic', () => {
      expect(requiresSpecialParams('claude-3-7-sonnet-20250219', 'anthropic')).toBe(false);
    });

    it('should return false for DeepSeek', () => {
      expect(requiresSpecialParams('deepseek-reasoner', 'deepseek')).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should return false for null model', () => {
      expect(requiresSpecialParams(null, 'openai')).toBe(false);
      expect(requiresSpecialParams(undefined, 'openai')).toBe(false);
    });
  });
});
