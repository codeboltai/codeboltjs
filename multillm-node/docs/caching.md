# Prompt Caching

Cache prompts to reduce costs and latency. Works consistently across all providers.

## Overview

Caching allows reusing cached responses for repeated prompts, saving both time and money. Multillm supports both automatic and explicit caching.

## Provider Caching Types

| Provider | Type | Configuration |
|----------|-------|---------------|
| OpenAI | Automatic | Built-in, no setup |
| Anthropic | Explicit | Requires `enableCaching: true` |
| DeepSeek | Automatic | Built-in, no setup |
| Gemini | Explicit | Requires configuration |

## Quick Start

### OpenAI (Automatic)

```typescript
import Multillm from '@arrowai/multillm';

const llm = new Multillm('openai', 'gpt-4o', null, process.env.OPENAI_API_KEY);

const systemPrompt = 'You are an expert assistant with deep knowledge of...';

// First call - creates cache
const response1 = await llm.createCompletion({
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: 'What is AI?' }
  ]
});

console.log('Cached tokens:', response1.usage.cached_tokens);

// Second call with same system prompt - uses cache
const response2 = await llm.createCompletion({
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: 'What is ML?' }
  ]
});

console.log('Cached tokens:', response2.usage.cached_tokens);
// Should be higher (cache hit)
```

### Anthropic (Explicit)

```typescript
const llm = new Multillm('anthropic', 'claude-3-5-sonnet-20241022', null, process.env.ANTHROPIC_API_KEY);

const response = await llm.createCompletion({
  messages: [
    {
      role: 'system',
      content: 'You are a documentation assistant with access to...'
    },
    { role: 'user', content: 'Explain API caching' }
  ],
  enableCaching: true,  // Enable caching
  systemCacheControl: { type: 'ephemeral' }  // Cache system prompt
});

console.log('Cache creation tokens:', response.usage.cache_creation_tokens);
console.log('Cache read tokens:', response.usage.cached_tokens);
```

## Cache Control Types

### Ephemeral Cache (Anthropic)

```typescript
const response = await llm.createCompletion({
  messages: [...],
  enableCaching: true,
  systemCacheControl: { type: 'ephemeral' }  // Temporary cache
});

// Cache lifetime: 5 minutes
// Use for: Short sessions, user-specific context
```

### Persistent Cache (Anthropic)

```typescript
const response = await llm.createCompletion({
  messages: [...],
  enableCaching: true,
  systemCacheControl: {
    type: 'ephemeral',
    // Set up to 1 hour with multiple turns
  }
});

// Cache lifetime: Up to 1 hour with continued dialogue
// Use for: Long conversations, persistent context
```

### Cache Prefix (Anthropic)

```typescript
const response = await llm.createCompletion({
  messages: [
    {
      role: 'system',
      content: 'You are a helpful assistant.',
      // Cache this for all users in session
      cache_control: { type: 'ephemeral' }
    },
    { role: 'user', content: 'Hello!' }
  ],
  enableCaching: true
});
```

## Usage Patterns

### Large System Prompt

```typescript
const largeSystemPrompt = `
  You are an expert in:
  - Machine learning and deep learning
  - Natural language processing
  - Computer vision
  - Reinforcement learning
  ${'Documentation: '.repeat(100)}
`;

// Reuse cached system prompt across many user queries
const userQueries = ['What is a neural network?', 'Explain backpropagation', 'What is CNN?'];

const responses = await Promise.all(
  userQueries.map(query =>
    llm.createCompletion({
      messages: [
        { role: 'system', content: largeSystemPrompt },
        { role: 'user', content: query }
      ],
      enableCaching: true
    })
  )
);

console.log('Total cache savings:', responses.reduce((sum, r) => sum + (r.usage.cached_tokens || 0), 0));
```

### Document Context

```typescript
// Cache large document once
const document = `
  Project X Technical Specification
  Version 2.5
  Last updated: January 2024
  
  ${'Technical details...'.repeat(500)}
`;

const response1 = await llm.createCompletion({
  messages: [
    { role: 'system', content: `Context: ${document}` },
    { role: 'user', content: 'What is the project timeline?' }
  ],
  enableCaching: true
});

// Subsequent questions about same document use cache
const response2 = await llm.createCompletion({
  messages: [
    { role: 'system', content: `Context: ${document}` },
    { role: 'user', content: 'What are the dependencies?' }
  ],
  enableCaching: true
});

console.log('Cache creation:', response1.usage.cache_creation_tokens);
console.log('Cache reads:', response2.usage.cached_tokens);
```

### Function Calling with Caching

```typescript
const tools = [{
  type: 'function' as const,
  function: {
    name: 'search_docs',
    description: 'Search documentation',
    parameters: {
      type: 'object',
      properties: { query: { type: 'string' } },
      required: ['query']
    }
  }
}];

// System prompt with tools definition - cache this
const systemPrompt = `
  You have access to the following tools:
  ${JSON.stringify(tools)}
  
  Use tools when needed to answer questions.
`;

const response = await llm.createCompletion({
  messages: [
    {
      role: 'system',
      content: systemPrompt,
      // Cache tools definition
      cache_control: { type: 'ephemeral' }
    },
    { role: 'user', content: 'How do I authenticate?' }
  ],
  tools,
  enableCaching: true
});

console.log('Tools cached:', response.usage.cache_creation_tokens);
```

## Cost Savings Calculation

```typescript
interface CacheMetrics {
  totalTokens: number;
  cachedTokens: number;
  cacheCreationTokens: number;
}

function calculateSavings(metrics: CacheMetrics[]) {
  const total = metrics.reduce((sum, m) => sum + m.totalTokens, 0);
  const cached = metrics.reduce((sum, m) => sum + (m.cached_tokens || 0), 0);
  const created = metrics.reduce((sum, m) => sum + (m.cache_creation_tokens || 0), 0);

  const cacheHitRate = (cached / total) * 100;
  const savings = cached - created;
  const savingsPercentage = (savings / total) * 100;

  return {
    total,
    cached,
    created,
    cacheHitRate: cacheHitRate.toFixed(1),
    savings,
    savingsPercentage: savingsPercentage.toFixed(1)
  };
}

// Example usage
const responses = await Promise.all([
  llm.createCompletion({
    messages: [{ role: 'system', content: largePrompt }, { role: 'user', content: 'Q1' }],
    enableCaching: true
  }),
  llm.createCompletion({
    messages: [{ role: 'system', content: largePrompt }, { role: 'user', content: 'Q2' }],
    enableCaching: true
  }),
  llm.createCompletion({
    messages: [{ role: 'system', content: largePrompt }, { role: 'user', content: 'Q3' }],
    enableCaching: true
  })
]);

const metrics = responses.map(r => ({
  totalTokens: r.usage.total_tokens,
  cachedTokens: r.usage.cached_tokens || 0,
  cacheCreationTokens: r.usage.cache_creation_tokens || 0
}));

const savings = calculateSavings(metrics);
console.log('Cache hit rate:', savings.cacheHitRate + '%');
console.log('Cost savings:', savings.savingsPercentage + '%');
```

## Monitoring Cache Performance

```typescript
class CacheMonitor {
  private metrics: CacheMetrics[] = [];
  private cacheHits: number = 0;
  private cacheMisses: number = 0;

  async trackRequest(llm: any, messages: any[]) {
    const response = await llm.createCompletion({ messages, enableCaching: true });

    const cached = response.usage.cached_tokens || 0;
    const created = response.usage.cache_creation_tokens || 0;

    if (cached > 0) {
      this.cacheHits++;
    }
    if (created > 0) {
      this.cacheMisses++;
    }

    this.metrics.push({
      totalTokens: response.usage.total_tokens,
      cachedTokens: cached,
      cacheCreationTokens: created
    });

    return response;
  }

  getStats() {
    const stats = calculateSavings(this.metrics);

    return {
      ...stats,
      hitRate: (this.cacheHits / (this.cacheHits + this.cacheMisses)) * 100,
      missRate: (this.cacheMisses / (this.cacheHits + this.cacheMisses)) * 100
    };
  }
}

const monitor = new CacheMonitor();

const response1 = await monitor.trackRequest(llm, messages1);
const response2 = await monitor.trackRequest(llm, messages2);
const response3 = await monitor.trackRequest(llm, messages3);

console.log('Cache stats:', monitor.getStats());
```

## Best Practices

1. **Cache Large Prompts**: Cache system prompts and documentation
2. **Monitor Hit Rate**: Track cache performance
3. **Lifetime Management**: Use ephemeral for short sessions
4. **Cache Keys**: Be consistent with cached content
5. **Combine with Reranking**: Cache + rerank for optimal performance
6. **Testing**: Test with/without caching to validate savings
7. **Clear Cache**: Periodically clear stale cache (provider-specific)

## Cache Invalidation

### Anthropic

```typescript
// Create new cache for fresh content
const response = await llm.createCompletion({
  messages: [
    {
      role: 'system',
      content: 'You are a helpful assistant',
      cache_control: { type: 'ephemeral' }
    },
    { role: 'user', content: 'Fresh question' }
  ],
  enableCaching: true
});

// Or disable caching for fresh content
const freshResponse = await llm.createCompletion({
  messages: [
    { role: 'system', content: 'You are a helpful assistant' },
    { role: 'user', content: 'Fresh question' }
  ],
  enableCaching: false  // No cache
});
```

### OpenAI

```typescript
// OpenAI manages cache automatically
// New cache created when prompt pattern changes significantly
// No manual invalidation needed
```

## Performance Comparison

```typescript
async function benchmarkCaching(
  llm: any,
  messages: any[],
  iterations: number = 10
) {
  // Without caching
  const withoutCache = await Promise.all(
    Array.from({ length: iterations }, (_, i) =>
      llm.createCompletion({
        messages,
        enableCaching: false
      })
    )
  );

  // With caching
  const withCache = await Promise.all(
    Array.from({ length: iterations }, (_, i) =>
      llm.createCompletion({
        messages,
        enableCaching: true
      })
    )
  );

  const avgWithout = withoutCache.reduce((sum, r) => sum + r.usage.total_tokens, 0) / iterations;
  const avgWithCache = withCache.reduce((sum, r) => sum + r.usage.total_tokens, 0) / iterations;

  console.log('Without cache:', avgWithout.toFixed(0), 'tokens');
  console.log('With cache:', avgWithCache.toFixed(0), 'tokens');
  console.log('Savings:', ((1 - avgWithCache / avgWithout) * 100).toFixed(1), '%');
}

// Usage
await benchmarkCaching(llm, messages, 5);
```

## Troubleshooting

### Low Cache Hit Rate

```typescript
// Problem: Cache not being used
// Solution: Check if system prompt is consistent

const inconsistent = [
  { role: 'system', content: 'Prompt A' },
  { role: 'user', content: 'Question' }
];

const consistent = [
  { role: 'system', content: 'Prompt A' },  // Same across calls
  { role: 'user', content: 'Question' }
];

// Use consistent system prompt for better caching
```

### Stale Cache

```typescript
// Problem: Cache contains outdated information
// Solution: Add timestamp or version to prompt

const versionedPrompt = `Documentation v2.5\n\n${documentation}`;

const response = await llm.createCompletion({
  messages: [
    {
      role: 'system',
      content: versionedPrompt,
      cache_control: { type: 'ephemeral' }  // New cache
    },
    { role: 'user', content: 'Question' }
  ],
  enableCaching: true
});
```
