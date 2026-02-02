/**
 * Reasoning Model Utilities
 *
 * Detect and configure reasoning models across providers.
 */

/**
 * OpenAI reasoning models (o-series)
 */
export const OPENAI_REASONING_MODELS = new Set([
  'o1-preview',
  'o1-mini',
  'o1',
  'o3-mini',
  'o3'
]);

/**
 * Anthropic models supporting extended thinking
 */
export const ANTHROPIC_THINKING_MODELS = new Set([
  'claude-3-5-sonnet-20241022',
  'claude-3-7-sonnet-20250219',
  'claude-sonnet-4-20250514',
  'claude-opus-4-20250514'
]);

/**
 * DeepSeek reasoning models
 */
export const DEEPSEEK_REASONING_MODELS = new Set([
  'deepseek-reasoner',
  'deepseek-r1',
  'deepseek-r1-distill-llama-70b',
  'deepseek-r1-distill-qwen-32b'
]);

/**
 * Check if a model supports reasoning/thinking based on model name and provider
 */
export function isReasoningModel(model: string | null | undefined, provider: string): boolean {
  if (!model) return false;

  const normalizedModel = model.toLowerCase();

  switch (provider) {
    case 'openai':
      // Check exact match or prefix match
      return OPENAI_REASONING_MODELS.has(model) ||
        normalizedModel.startsWith('o1') ||
        normalizedModel.startsWith('o3');

    case 'anthropic':
      // Check for extended thinking models or claude 3.7+
      return ANTHROPIC_THINKING_MODELS.has(model) ||
        normalizedModel.includes('claude-3-7') ||
        normalizedModel.includes('claude-sonnet-4') ||
        normalizedModel.includes('claude-opus-4');

    case 'deepseek':
      // Check for reasoning models
      return DEEPSEEK_REASONING_MODELS.has(model) ||
        normalizedModel.includes('reasoner') ||
        normalizedModel.includes('-r1');

    default:
      return false;
  }
}

/**
 * Get default thinking budget for a model
 */
export function getDefaultThinkingBudget(model: string | null | undefined, provider: string): number {
  if (!model) return 16384;

  const normalizedModel = model.toLowerCase();

  switch (provider) {
    case 'openai':
      // o3 models support larger budgets
      if (normalizedModel.includes('o3')) return 100000;
      // o1 models
      if (normalizedModel.includes('o1')) return 65536;
      return 32768;

    case 'anthropic':
      // Anthropic budget_tokens default
      return 10000;

    case 'deepseek':
      return 32768;

    default:
      return 16384;
  }
}

/**
 * Get reasoning parameters for OpenAI o-series models
 * o1/o3 models use different parameters than standard models
 */
export function getOpenAIReasoningParams(
  model: string,
  options: {
    temperature?: number;
    max_tokens?: number;
    thinkingBudget?: number;
    reasoningEffort?: 'low' | 'medium' | 'high';
  }
): Record<string, unknown> {
  const params: Record<string, unknown> = {};

  // o1/o3 models use max_completion_tokens instead of max_tokens
  if (options.thinkingBudget) {
    params.max_completion_tokens = options.thinkingBudget;
  } else if (options.max_tokens) {
    params.max_completion_tokens = options.max_tokens;
  } else {
    params.max_completion_tokens = getDefaultThinkingBudget(model, 'openai');
  }

  // o1/o3 models use reasoning_effort instead of temperature
  // temperature is not supported for reasoning models
  if (options.reasoningEffort) {
    params.reasoning_effort = options.reasoningEffort;
  }

  return params;
}

/**
 * Get extended thinking parameters for Anthropic models
 */
export function getAnthropicThinkingParams(
  options: {
    includeReasoning?: boolean;
    thinkingBudget?: number;
  }
): Record<string, unknown> | undefined {
  // Only enable if not explicitly disabled
  if (options.includeReasoning === false) {
    return undefined;
  }

  return {
    type: 'enabled',
    budget_tokens: options.thinkingBudget || 10000
  };
}

/**
 * Check if a model requires special parameter handling (no temperature, etc.)
 */
export function requiresSpecialParams(model: string | null | undefined, provider: string): boolean {
  if (!model) return false;

  // OpenAI o-series models don't support temperature
  if (provider === 'openai') {
    const normalizedModel = model.toLowerCase();
    return normalizedModel.startsWith('o1') || normalizedModel.startsWith('o3');
  }

  return false;
}
