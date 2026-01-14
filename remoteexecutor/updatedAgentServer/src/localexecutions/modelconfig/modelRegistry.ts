import { ModelOption } from '../../types';

const DEFAULT_MODELS: ModelOption[] = [
  {
    name: 'gpt-4.1-mini',
    provider: 'OpenAI',
    description: 'Fast GPT-4.1 family model ideal for iterative coding and chats',
    capabilities: ['Text', 'Code'],
    context: '128K'
  },
  {
    name: 'gpt-4o',
    provider: 'OpenAI',
    description: 'High-quality reasoning with strong coding abilities',
    capabilities: ['Text', 'Code', 'Vision'],
    context: '128K'
  },
  {
    name: 'claude-3.5-sonnet',
    provider: 'Anthropic',
    description: 'Balanced reasoning with low hallucination rates',
    capabilities: ['Text', 'Analysis'],
    context: '200K'
  },
  {
    name: 'claude-3.5-haiku',
    provider: 'Anthropic',
    description: 'Fast lightweight Claude model great for agent workflows',
    capabilities: ['Text'],
    context: '200K'
  },
  {
    name: 'gemini-1.5-pro',
    provider: 'Google',
    description: 'Long-context multimodal model for complex tasks',
    capabilities: ['Text', 'Vision', 'Audio'],
    context: '1M'
  },
  {
    name: 'mistral-large-latest',
    provider: 'Mistral',
    description: 'European-hosted model optimized for structured coding',
    capabilities: ['Text', 'Code'],
    context: '64K'
  }
];

export function getAvailableModels(): ModelOption[] {
  return DEFAULT_MODELS;
}
