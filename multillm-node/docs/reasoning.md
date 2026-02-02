# Reasoning Models Support

Multillm provides comprehensive support for reasoning models across multiple providers, with automatic detection, proper parameter handling, and reasoning token tracking.

## Overview

Reasoning models are a new class of LLMs designed to "think" before responding, producing higher-quality outputs for complex tasks. They typically:

1. Generate internal reasoning/thinking content
2. Use more tokens for processing (reasoning tokens)
3. Require different API parameters than standard models

## Supported Providers

| Provider | Models | Feature Name | Reasoning Tokens |
|----------|--------|--------------|------------------|
| OpenAI | o1, o1-preview, o1-mini, o3, o3-mini | Reasoning | ✅ |
| Anthropic | Claude 3.7 Sonnet, Claude 4 Sonnet/Opus | Extended Thinking | ✅ |
| DeepSeek | deepseek-reasoner, deepseek-r1 | Reasoning | ✅ |

## Usage

### Basic Usage

```typescript
import Multillm from '@arrowai/multillm';

// OpenAI o1
const llm = new Multillm('openai', 'o1', null, apiKey);

const response = await llm.createCompletion({
  messages: [{
    role: 'user',
    content: 'Solve this step by step: If x + 5 = 12, what is x?'
  }]
});

console.log(response.choices[0].message.content);
// Outputs the final answer

console.log(response.usage.reasoning_tokens);
// Outputs number of tokens used for reasoning
```

### With Reasoning Configuration

```typescript
const response = await llm.createCompletion({
  messages: [{ role: 'user', content: 'Complex problem...' }],
  reasoning: {
    thinkingBudget: 50000,      // Max tokens for thinking
    reasoningEffort: 'high',    // OpenAI o-series: 'low' | 'medium' | 'high'
    includeReasoning: true      // Include thinking content in response
  }
});

// Access the reasoning content
if (response.choices[0].message.reasoning) {
  console.log('Thinking:', response.choices[0].message.reasoning.thinking);
}
```

## Provider-Specific Details

### OpenAI (o1/o3 Series)

The o1 and o3 series models use different parameters than standard GPT models:

```typescript
const llm = new Multillm('openai', 'o1', null, apiKey);

const response = await llm.createCompletion({
  messages: [{ role: 'user', content: 'Solve this problem...' }],
  reasoning: {
    // Replaces max_tokens for reasoning models
    thinkingBudget: 65536,
    // Controls reasoning depth (o-series specific)
    reasoningEffort: 'high'
  }
  // Note: temperature is NOT supported for o1/o3 models
});
```

**Key Differences from GPT models:**
- Uses `max_completion_tokens` instead of `max_tokens`
- Uses `reasoning_effort` instead of `temperature`
- Temperature parameter is ignored
- Returns `reasoning_tokens` in usage

**Reasoning Effort Levels:**
- `low` - Faster responses, less reasoning
- `medium` - Balanced (default)
- `high` - More thorough reasoning, slower

**Usage Response:**
```typescript
response.usage = {
  prompt_tokens: 50,
  completion_tokens: 200,
  total_tokens: 250,
  reasoning_tokens: 150,           // Tokens used for reasoning
  reasoning_tokens_cached: 0       // Cached reasoning tokens
}
```

### Anthropic (Extended Thinking)

Claude 3.7 and Claude 4 models support "extended thinking":

```typescript
const llm = new Multillm('anthropic', 'claude-3-7-sonnet-20250219', null, apiKey);

const response = await llm.createCompletion({
  messages: [{ role: 'user', content: 'Analyze this complex scenario...' }],
  reasoning: {
    thinkingBudget: 10000,    // budget_tokens in API
    includeReasoning: true     // Enable extended thinking
  }
});

// Access thinking content
if (response.choices[0].message.reasoning) {
  console.log('Thinking:', response.choices[0].message.reasoning.thinking);
  console.log('Signature:', response.choices[0].message.reasoning.signature);
}
```

**Supported Models:**
- `claude-3-5-sonnet-20241022`
- `claude-3-7-sonnet-20250219`
- `claude-sonnet-4-20250514`
- `claude-opus-4-20250514`

**Response Structure:**
```typescript
response.choices[0].message = {
  role: 'assistant',
  content: 'Final response...',
  reasoning: {
    thinking: 'Let me think through this problem...',
    signature: 'abc123...'  // Verification signature
  }
}
```

### DeepSeek (Reasoner)

DeepSeek's reasoning models return reasoning content in responses:

```typescript
const llm = new Multillm('deepseek', 'deepseek-reasoner', null, apiKey);

const response = await llm.createCompletion({
  messages: [{ role: 'user', content: 'Solve this step by step...' }]
});

// Access reasoning content
if (response.choices[0].message.reasoning) {
  console.log('Reasoning:', response.choices[0].message.reasoning.thinking);
}

console.log('Reasoning tokens:', response.usage.reasoning_tokens);
```

**Supported Models:**
- `deepseek-reasoner`
- `deepseek-r1`
- `deepseek-r1-distill-llama-70b`
- `deepseek-r1-distill-qwen-32b`

## Configuration Options

### ReasoningConfig

```typescript
interface ReasoningConfig {
  /**
   * Maximum tokens budget for reasoning/thinking
   * - OpenAI: maps to max_completion_tokens
   * - Anthropic: maps to budget_tokens
   */
  thinkingBudget?: number;

  /**
   * Whether to include reasoning content in response
   * Default: true for reasoning models
   */
  includeReasoning?: boolean;

  /**
   * Reasoning effort level (OpenAI o-series only)
   * Controls how much reasoning the model performs
   */
  reasoningEffort?: 'low' | 'medium' | 'high';
}
```

### Default Budgets

| Model Type | Default Budget |
|------------|---------------|
| OpenAI o3 | 100,000 |
| OpenAI o1 | 65,536 |
| Anthropic | 10,000 |
| DeepSeek | 32,768 |

## Detecting Reasoning Models

The library provides utilities for detecting reasoning models:

```typescript
import { isReasoningModel, requiresSpecialParams } from '@arrowai/multillm/utils/reasoningModels';

// Check if model supports reasoning
if (isReasoningModel('o1-preview', 'openai')) {
  console.log('This is a reasoning model');
}

// Check if model needs special parameter handling
if (requiresSpecialParams('o1', 'openai')) {
  // Don't use temperature parameter
}
```

## Response Types

### ReasoningContent

```typescript
interface ReasoningContent {
  /**
   * The reasoning/thinking content generated by the model
   */
  thinking: string;

  /**
   * Signature for verification (Anthropic only)
   */
  signature?: string;
}
```

### Extended ChatMessage

```typescript
interface ChatMessage {
  role: 'user' | 'assistant' | 'system' | 'function' | 'tool';
  content: MessageContent;
  // ... other fields

  /**
   * Reasoning content from reasoning models
   */
  reasoning?: ReasoningContent;
}
```

### Extended Usage

```typescript
interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;

  /**
   * Tokens used for reasoning/thinking
   */
  reasoning_tokens?: number;

  /**
   * Cached reasoning tokens (OpenAI)
   */
  reasoning_tokens_cached?: number;
}
```

## Telemetry

Reasoning tokens are automatically tracked in telemetry:

```typescript
// Telemetry log entry includes:
{
  operation: 'chat',
  provider: 'openai',
  model: 'o1',
  usage: {
    inputTokens: 50,
    outputTokens: 200,
    reasoningTokens: 150  // Tracked automatically
  }
}
```

## Best Practices

1. **Use appropriate budgets** - Reasoning models can use many tokens. Set reasonable limits.

2. **Check capabilities** before using reasoning features:
   ```typescript
   const caps = llm.getCapabilities();
   if (caps.supportsReasoning) {
     // Safe to use reasoning options
   }
   ```

3. **Don't use temperature** with OpenAI o-series models - it's not supported.

4. **Handle reasoning content** gracefully:
   ```typescript
   const reasoning = response.choices[0].message.reasoning;
   if (reasoning) {
     // Reasoning content available
     logThinking(reasoning.thinking);
   }
   ```

5. **Monitor token usage** - Reasoning models typically use more tokens:
   ```typescript
   const { prompt_tokens, completion_tokens, reasoning_tokens } = response.usage;
   console.log(`Reasoning overhead: ${reasoning_tokens} tokens`);
   ```

## Error Handling

```typescript
try {
  const response = await llm.createCompletion({
    messages: [{ role: 'user', content: 'Complex task...' }],
    reasoning: { thinkingBudget: 100000 }
  });
} catch (error) {
  if (error.message.includes('max_tokens')) {
    console.error('Budget exceeded');
  }
}
```

## Example: Complex Problem Solving

```typescript
const llm = new Multillm('openai', 'o1', null, apiKey);

const problem = `
A farmer has a rectangular field. The perimeter is 100 meters.
The length is 10 meters more than the width.
What are the dimensions of the field?
`;

const response = await llm.createCompletion({
  messages: [{ role: 'user', content: problem }],
  reasoning: {
    reasoningEffort: 'high'
  }
});

console.log('Answer:', response.choices[0].message.content);
console.log('Reasoning tokens used:', response.usage.reasoning_tokens);
```
