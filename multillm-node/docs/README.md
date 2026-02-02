# Multillm Documentation

Multillm is a unified TypeScript/JavaScript library for interacting with multiple LLM providers using a **consistent API**.

## Table of Contents

### Quick Start
- [Getting Started](./getting-started.md) - Installation, setup, and first steps

### Feature Documentation
- [Tool / Function Calling](./tools.md) - Function calling across providers
- [Embeddings](./embeddings.md) - Text embeddings and vector search
- [Image Generation](./image-generation.md) - Text-to-image generation
- [Speech Generation](./speech.md) - Text-to-speech synthesis
- [Audio Transcription](./transcription.md) - Speech-to-text conversion
- [Document Reranking](./reranking.md) - Document reranking for RAG
- [Multimodal Content](./multimodal.md) - Images and files in messages
- [Reasoning Models](./reasoning.md) - o1/o3 and extended thinking
- [Telemetry](./telemetry.md) - Automatic logging and monitoring
- [UI Streaming](./ui-stream.md) - Real-time UI updates
- [Prompt Caching](./caching.md) - Prompt caching for cost savings
- [Provider Capabilities](./capabilities.md) - Feature matrix
- [Error Handling](./capabilities.md#error-handling) - Error types and retry logic

### Reference
- [Providers](./providers.md) - All 16+ providers quick reference
- [API Reference](./api-reference.md) - Complete API documentation
- [Examples](./examples.md) - Code examples for all features

---

## Key Features

### Unified API

**One consistent interface across all providers:**

```typescript
import Multillm from '@arrowai/multillm';

// Same API for all providers!
const providers = [
  { name: 'OpenAI', provider: 'openai', model: 'gpt-4o', key: process.env.OPENAI_API_KEY },
  { name: 'Anthropic', provider: 'anthropic', model: 'claude-3-5-sonnet-20241022', key: process.env.ANTHROPIC_API_KEY },
  { name: 'DeepSeek', provider: 'deepseek', model: 'deepseek-chat', key: process.env.DEEPSEEK_API_KEY }
];

for (const { name, provider, model, key } of providers) {
  const llm = new Multillm(provider, model, null, key);
  const response = await llm.createCompletion({
    messages: [{ role: 'user', content: 'Hello!' }]
  });
  console.log(`${name}:`, response.choices[0].message.content);
}
```

### Streaming

Real-time token streaming with callbacks or async generators:

```typescript
// Callback-based streaming
await llm.createCompletionStream({
  messages: [{ role: 'user', content: 'Tell me a story' }],
  onChunk: (chunk) => {
    console.log(chunk.choices[0]?.delta?.content);
  }
});

// Async generator streaming
for await (const chunk of llm.streamCompletion({ messages })) {
  console.log(chunk.choices[0]?.delta?.content);
}
```

### Tool / Function Calling

Built-in support for function calling across providers:

```typescript
const tools = [{
  type: 'function',
  function: {
    name: 'get_weather',
    description: 'Get current weather',
    parameters: {
      type: 'object',
      properties: {
        location: { type: 'string' }
      },
      required: ['location']
    }
  }
}];

// Works with OpenAI, Anthropic, DeepSeek, Gemini, Mistral, Groq
const response = await llm.createCompletion({
  messages: [{ role: 'user', content: 'Weather in London?' }],
  tools
});
```

### Automatic Telemetry

Built-in OpenTelemetry-compatible logging (enabled by default):

```typescript
const llm = new Multillm('openai', 'gpt-4o', null, process.env.OPENAI_API_KEY);

// All calls automatically logged to ./llm-telemetry.ndjson
await llm.createCompletion({ messages: [...] });
```

### Multimodal Support

Send images and files (PDFs) in messages:

```typescript
const response = await llm.createCompletion({
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'Describe this image' },
      { type: 'image', image: 'https://example.com/image.jpg' }
    ]
  }]
});
```

### Reasoning Models

Full support for reasoning models (o1/o3, Claude extended thinking, DeepSeek reasoner):

```typescript
const response = await llm.createCompletion({
  messages: [{ role: 'user', content: 'Solve this complex problem...' }],
  reasoning: {
    thinkingBudget: 50000,
    reasoningEffort: 'high',
    includeReasoning: true
  }
});

console.log('Thinking:', response.choices[0].message.reasoning?.thinking);
console.log('Answer:', response.choices[0].message.content);
```

### Prompt Caching

Cache prompts to reduce costs and latency:

```typescript
// OpenAI - automatic
const response1 = await llm.createCompletion({
  messages: [{ role: 'system', content: largePrompt }, { role: 'user', content: 'Q1' }]
});
const response2 = await llm.createCompletion({
  messages: [{ role: 'system', content: largePrompt }, { role: 'user', content: 'Q2' }]
});
// Second call uses cached system prompt

// Anthropic - explicit
const response = await llm.createCompletion({
  messages: [...],
  enableCaching: true,
  systemCacheControl: { type: 'ephemeral' }
});
```

---

## Supported Providers

| Provider | Best For | Key Features |
|----------|----------|---------------|
| **OpenAI** | Best overall quality | GPT-4o, o1/o3, images, speech, transcription, embeddings |
| **Anthropic** | Complex reasoning, long context | Claude 3.5/4, PDFs, extended thinking |
| **DeepSeek** | Cost-effective, fast | DeepSeek-chat, reasoner |
| **Gemini** | Large context, multimodal | 1M+ tokens, vision |
| **Groq** | Speed, low latency | Llama 3, fast inference |
| **Mistral** | European data, privacy | Mistral Large, Codestral |
| **Ollama** | Local, privacy | Free, offline |
| **Replicate** | Image generation | SDXL, Flux, custom models |
| **CodeBolt AI** | Chat, embeddings, rerank | Custom features |
| **ZAi** | Custom models | Various features |

---

## Installation

```bash
npm install @arrowai/multillm
```

See [Getting Started](./getting-started.md) for detailed setup instructions.

---

## Quick Start

```typescript
import Multillm from '@arrowai/multillm';

const llm = new Multillm('openai', 'gpt-4o', null, process.env.OPENAI_API_KEY);

const response = await llm.createCompletion({
  messages: [{ role: 'user', content: 'Hello!' }]
});

console.log(response.choices[0].message.content);
```

---

## Feature Documentation

### Core Features
- **Tool/Function Calling** - See [tools.md](./tools.md)
- **Streaming** - See [UI streaming](./ui-stream.md)

### AI Features
- **Embeddings** - See [embeddings.md](./embeddings.md)
- **Image Generation** - See [image-generation.md](./image-generation.md)
- **Speech Generation** - See [speech.md](./speech.md)
- **Audio Transcription** - See [transcription.md](./transcription.md)
- **Document Reranking** - See [reranking.md](./reranking.md)

### Advanced Features
- **Multimodal** - See [multimodal.md](./multimodal.md)
- **Reasoning Models** - See [reasoning.md](./reasoning.md)
- **Telemetry** - See [telemetry.md](./telemetry.md)
- **Caching** - See [caching.md](./caching.md)
- **Capabilities** - See [capabilities.md](./capabilities.md)
- **Error Handling** - See [capabilities.md#error-handling)

---

## Examples

See [examples.md](./examples.md) for comprehensive code examples.

---

## License

ISC
