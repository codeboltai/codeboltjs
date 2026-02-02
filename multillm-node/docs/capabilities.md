# Provider Capabilities

Check what features each provider supports using a unified API.

## Overview

Each provider supports different features. Use `getCapabilities()` to check before using specific features.

## Capability Matrix

| Provider | Streaming | Tools | Vision | Embeddings | Images | Speech | Transcription | Reasoning | Caching | Multimodal |
|----------|-----------|-------|--------|------------|---------|--------|----------------|-----------|----------|-----------|
| OpenAI | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Auto | ✅ |
| Anthropic | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | Explicit | ✅ |
| DeepSeek | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | Auto | ❌ |
| Gemini | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | Explicit | ✅ |
| Mistral | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Groq | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Ollama | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Replicate | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Bedrock | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | Auto | ❌ | ✅ |
| Cloudflare | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| OpenRouter | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Varies | Varies | ✅ |
| HuggingFace | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Grok | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Perplexity | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| CodeBolt AI | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| ZAi | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

## Checking Capabilities

```typescript
import Multillm from '@arrowai/multillm';

const llm = new Multillm('openai', 'gpt-4o', null, apiKey);
const caps = llm.getCapabilities();

console.log(caps);

// Output:
// {
//   supportsStreaming: true,
//   supportsTools: true,
//   supportsVision: true,
//   supportsEmbeddings: true,
//   supportsImageGeneration: true,
//   supportsTranscription: true,
//   supportsSpeech: true,
//   supportsReasoning: true,
//   supportsMultimodal: true,
//   supportsCaching: true,
//   cachingType: 'automatic',
//   supportsReranking: false
// }
```

## Capability Interface

```typescript
interface ProviderCapabilities {
  /** Streaming responses */
  supportsStreaming: boolean;

  /** Function/tool calling */
  supportsTools: boolean;

  /** Vision/multimodal (images, PDFs) */
  supportsVision: boolean;

  /** Text embeddings */
  supportsEmbeddings: boolean;

  /** Image generation */
  supportsImageGeneration: boolean;

  /** Text-to-speech */
  supportsSpeech: boolean;

  /** Speech-to-text */
  supportsTranscription: boolean;

  /** Reasoning models (o1, Claude extended thinking) */
  supportsReasoning: boolean;

  /** Multimodal content (text + images) */
  supportsMultimodal: boolean;

  /** Prompt caching */
  supportsCaching: boolean;

  /** Cache type: 'automatic' | 'explicit' | 'none' */
  cachingType: 'automatic' | 'explicit' | 'none';

  /** Image generation */
  supportsReranking: boolean;

  /** Document reranking */
}
```

## Usage Examples

### Check Before Using Feature

```typescript
const llm = new Multillm('provider-name', 'model', null, apiKey);
const caps = llm.getCapabilities();

// Use tools only if supported
if (caps.supportsTools) {
  const tools = [...];
  const response = await llm.createCompletion({
    messages: [...],
    tools
  });
} else {
  console.log('Tools not supported by this provider');
}

// Use vision only if supported
if (caps.supportsVision) {
  const response = await llm.createCompletion({
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: 'What is this?' },
        { type: 'image', image: imageUrl }
      ]
    }]
  });
}
```

### Feature Detection Wrapper

```typescript
class FeatureSafeLLM {
  private llm: any;
  private capabilities: ProviderCapabilities;

  constructor(provider: string, model: string, apiKey: string) {
    this.llm = new Multillm(provider, model, null, apiKey);
    this.capabilities = this.llm.getCapabilities();
  }

  async createCompletionWithTools(messages: any[], tools: any[]) {
    if (!this.capabilities.supportsTools) {
      throw new Error(`Provider ${this.llm.provider} does not support tools`);
    }
    return this.llm.createCompletion({ messages, tools });
  }

  async createCompletionWithVision(messages: any[]) {
    if (!this.capabilities.supportsVision) {
      throw new Error(`Provider ${this.llm.provider} does not support vision`);
    }
    return this.llm.createCompletion({ messages });
  }

  async createEmbedding(text: string) {
    if (!this.capabilities.supportsEmbeddings) {
      throw new Error(`Provider ${this.llm.provider} does not support embeddings`);
    }
    return this.llm.createEmbedding({ input: text });
  }
}
```

### Multi-Provider Fallback

```typescript
async function tryWithFallbacks(request: () => Promise<any>) {
  const providers = [
    new Multillm('openai', 'gpt-4o', null, process.env.OPENAI_API_KEY),
    new Multillm('anthropic', 'claude-3-5-sonnet-20241022', null, process.env.ANTHROPIC_API_KEY),
    new Multillm('deepseek', 'deepseek-chat', null, process.env.DEEPSEEK_API_KEY)
  ];

  for (const provider of providers) {
    const caps = provider.getCapabilities();

    if (caps.supportsTools) {
      try {
        return await request();
      } catch (error) {
        console.log(`${provider.provider} failed, trying next...`);
      }
    }
  }

  throw new Error('All providers failed');
}
```

## Provider Selection by Capability

```typescript
interface ProviderSpec {
  name: string;
  provider: string;
  model: string;
  apiKey: string;
  capabilities: ProviderCapabilities;
}

// List providers with their capabilities
const providers: ProviderSpec[] = [
  {
    name: 'OpenAI GPT-4o',
    provider: 'openai',
    model: 'gpt-4o',
    apiKey: process.env.OPENAI_API_KEY!,
    capabilities: { supportsTools: true, supportsVision: true, supportsReasoning: true }
  },
  {
    name: 'Anthropic Claude 3.5',
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    apiKey: process.env.ANTHROPIC_API_KEY!,
    capabilities: { supportsTools: true, supportsVision: true, supportsReasoning: true }
  },
  {
    name: 'DeepSeek',
    provider: 'deepseek',
    model: 'deepseek-chat',
    apiKey: process.env.DEEPSEEK_API_KEY!,
    capabilities: { supportsTools: true, supportsReasoning: true }
  }
];

// Select provider based on required features
function selectProvider(needsTools: boolean, needsVision: boolean, needsReasoning: boolean): ProviderSpec | null {
  const suitable = providers.filter(p => {
    const caps = p.capabilities;
    return (
      (!needsTools || caps.supportsTools) &&
      (!needsVision || caps.supportsVision) &&
      (!needsReasoning || caps.supportsReasoning)
    );
  });

  return suitable[0] || null;
}

// Usage
const provider = selectProvider(true, false, false);  // Needs tools
if (provider) {
  const llm = new Multillm(provider.provider, provider.model, null, provider.apiKey);
}
```

# Error Handling

Multillm provides structured error types for better error handling.

## Quick Start

```typescript
import { LLMProviderError, ErrorCode } from '@arrowai/multillm';

try {
  const response = await llm.createCompletion({
    messages: [{ role: 'user', content: 'Hello' }]
  });
} catch (error) {
  if (error instanceof LLMProviderError) {
    console.error('Error code:', error.code);
    console.error('Message:', error.message);
    
    if (error.retryAfter) {
      console.log('Retry after:', error.retryAfter, 'seconds');
    }
  }
}
```

## Error Codes

| Code | Name | Description |
|------|------|-------------|
| AUTHENTICATION_ERROR | Invalid API key or credentials |
| RATE_LIMIT_ERROR | Too many requests, rate limited |
| CONTEXT_LENGTH_ERROR | Input exceeds context window |
| CONTENT_FILTER_ERROR | Content violates safety guidelines |
| NETWORK_ERROR | Network or connectivity issue |
| TIMEOUT_ERROR | Request timed out |
| INVALID_REQUEST | Invalid parameters or data |
| QUOTA_EXCEEDED | Account quota or credits exceeded |

## Error Types

### Authentication Error

```typescript
try {
  await llm.createCompletion({ messages });
} catch (error) {
  if (error.code === ErrorCode.AUTHENTICATION_ERROR) {
    console.error('Invalid API key');
    console.error('Please check your environment variables');
  }
}
```

### Rate Limit Error

```typescript
try {
  await llm.createCompletion({ messages });
} catch (error) {
  if (error.code === ErrorCode.RATE_LIMIT_ERROR) {
    console.error('Rate limited');
    console.error('Retry after:', error.retryAfter, 'seconds');
    
    // Wait and retry
    setTimeout(() => {
      retryRequest();
    }, (error.retryAfter || 5) * 1000);
  }
}
```

### Context Length Error

```typescript
try {
  await llm.createCompletion({
    messages: [{ role: 'user', content: 'A'.repeat(100000) }]
  });
} catch (error) {
  if (error.code === ErrorCode.CONTEXT_LENGTH_ERROR) {
    console.error('Input too long');
    console.error('Max tokens:', error.maxTokens);
    console.error('Please shorten your input');
  }
}
```

### Content Filter Error

```typescript
try {
  await llm.createCompletion({
    messages: [{ role: 'user', content: 'Inappropriate content' }]
  });
} catch (error) {
  if (error.code === ErrorCode.CONTENT_FILTER_ERROR) {
    console.error('Content rejected by safety filter');
    console.error('Please revise your content');
  }
}
```

## Retry with Exponential Backoff

```typescript
import { withRetry } from '@arrowai/multillm';

const response = await withRetry(
  () => llm.createCompletion({
    messages: [{ role: 'user', content: 'Hello' }]
  }),
  {
    maxRetries: 3,
    initialBackoff: 1000,
    maxBackoff: 10000,
    backoffMultiplier: 2,
    shouldRetry: (error) => {
      return error.code === ErrorCode.RATE_LIMIT_ERROR;
    },
    onRetry: (error, attempt, delay) => {
      console.log(`Retry ${attempt}: ${error.message}`);
      console.log(`Waiting ${delay}ms...`);
    }
  }
);
```

## Custom Error Handling

```typescript
class LLMErrorHandler {
  handle(error: unknown): never {
    if (!(error instanceof LLMProviderError)) {
      console.error('Unknown error:', error);
      throw error;
    }

    switch (error.code) {
      case ErrorCode.AUTHENTICATION_ERROR:
        throw new Error('Please check your API key configuration');

      case ErrorCode.RATE_LIMIT_ERROR:
        throw new Error(`Rate limited. Retry in ${error.retryAfter}s`);

      case ErrorCode.CONTEXT_LENGTH_ERROR:
        throw new Error(`Input too long. Max: ${error.maxTokens} tokens`);

      case ErrorCode.CONTENT_FILTER_ERROR:
        throw new Error('Content violates safety guidelines');

      default:
        throw new Error(`LLM Error: ${error.message}`);
    }
  }
}

const handler = new LLMErrorHandler();

try {
  const response = await llm.createCompletion({ messages });
} catch (error) {
  throw handler.handle(error);
}
```

## Graceful Degradation

```typescript
class ResilientLLM {
  private primary: any;
  private fallback: any;

  constructor(primaryProvider: any, fallbackProvider: any) {
    this.primary = primaryProvider;
    this.fallback = fallbackProvider;
  }

  async createCompletion(options: any) {
    try {
      return await this.primary.createCompletion(options);
    } catch (error) {
      console.log('Primary provider failed, using fallback:', error.message);
      return await this.fallback.createCompletion(options);
    }
  }
}

// Usage
const resilient = new ResilientLLM(
  new Multillm('openai', 'gpt-4o', null, process.env.OPENAI_API_KEY),
  new Multillm('deepseek', 'deepseek-chat', null, process.env.DEEPSEEK_API_KEY)
);

const response = await resilient.createCompletion({ messages });
```

## Best Practices

1. **Check Capabilities First**: Use `getCapabilities()` before using features
2. **Handle All Error Codes**: Provide clear user feedback
3. **Implement Retry Logic**: Use exponential backoff for rate limits
4. **Log Errors**: Record errors for monitoring and debugging
5. **Provide Fallbacks**: Have backup providers for critical operations
6. **Validate Input**: Check input length before sending
7. **Monitor Error Rates**: Track error patterns and address underlying issues
8. **User-Friendly Messages**: Translate technical errors to actionable feedback
