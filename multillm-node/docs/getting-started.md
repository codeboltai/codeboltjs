# Getting Started

Get up and running with Multillm in minutes.

## Installation

Install Multillm using npm:

```bash
npm install @arrowai/multillm
```

Or using yarn:

```bash
yarn add @arrowai/multillm
```

Or using pnpm:

```bash
pnpm add @arrowai/multillm
```

## Setup API Keys

### Environment Variables

Create a `.env` file in your project root:

```env
# OpenAI
OPENAI_API_KEY=sk-your-key-here

# Anthropic
ANTHROPIC_API_KEY=sk-ant-your-key-here

# DeepSeek
DEEPSEEK_API_KEY=sk-your-key-here

# Gemini
GEMINI_API_KEY=your-key-here

# Mistral
MISTRAL_API_KEY=your-key-here

# Groq
GROQ_API_KEY=gsk-your-key-here

# Add more providers as needed...
```

**Important**: Add `.env` to your `.gitignore` file to prevent committing API keys.

### Loading Environment Variables

```typescript
// Using process.env (Node.js)
const openaiKey = process.env.OPENAI_API_KEY;
const anthropicKey = process.env.ANTHROPIC_API_KEY;
```

## First Completion

### Basic Chat

```typescript
import Multillm from '@arrowai/multillm';

const llm = new Multillm('openai', 'gpt-4o', null, process.env.OPENAI_API_KEY);

const response = await llm.createCompletion({
  messages: [{ role: 'user', content: 'Hello, how are you?' }]
});

console.log(response.choices[0].message.content);
// Output: "I'm doing well, thank you! How can I help you today?"
```

### Multi-turn Conversation

```typescript
const messages = [
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'What is 2+2?' },
  { role: 'assistant', content: '2+2 equals 4.' },
  { role: 'user', content: 'What about 3+3?' }
];

const response = await llm.createCompletion({ messages });

console.log(response.choices[0].message.content);
// Output: "3+3 equals 6."
```

### Streaming Response

```typescript
for await (const chunk of llm.streamCompletion({
  messages: [{ role: 'user', content: 'Tell me a story' }]
})) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```

## Choosing a Provider

Multillm supports 16+ providers. Choose based on your needs:

### Quick Reference

| Provider | Best For | Key Features |
|----------|----------|---------------|
| **OpenAI** | General purpose, best quality | GPT-4o, o1/o3, images, speech, transcription |
| **Anthropic** | Complex reasoning, long context | Claude 3.5/4, PDFs, extended thinking |
| **DeepSeek** | Cost-effective, fast | DeepSeek-chat, reasoner |
| **Gemini** | Large context, multimodal | 1M+ tokens, vision |
| **Groq** | Speed, low latency | Llama 3, fast inference |
| **Mistral** | European data, privacy | Mistral Large, Codestral |
| **Ollama** | Local, privacy | Free, offline |
| **Replicate** | Image generation | SDXL, Flux, custom models |

### Provider Selection Guide

**Choose OpenAI if:**
- You want the best overall quality
- Need o1/o3 reasoning models
- Need all features (chat, images, speech, embeddings)
- Cost is not primary concern

**Choose Anthropic if:**
- Need extended context (200k tokens)
- Want PDF document analysis
- Need extended thinking for complex problems
- Privacy is important

**Choose DeepSeek if:**
- Want cost-effective solution
- Need good reasoning at low cost
- API speed matters
- Chinese language support

**Choose Gemini if:**
- Need extremely long context (1M+ tokens)
- Want multimodal capabilities
- Google ecosystem integration

**Choose Groq if:**
- Speed is critical
- Want low latency
- Using open-source models (Llama, Mixtral)

**Choose Ollama if:**
- Want to run locally
- Data privacy is critical
- Don't want to pay API fees
- Have powerful hardware

**Choose Mistral if:**
- Need EU data residency
- Want good performance at reasonable cost
- Need code generation (Codestral)

## Configuration Options

### Basic Configuration

```typescript
const llm = new Multillm(
  'openai',           // Provider
  'gpt-4o',          // Model (optional)
  null,               // Device map (for local models)
  process.env.OPENAI_API_KEY,  // API key
  null,               // Custom API endpoint (optional)
  {}                  // Additional config
);
```

### Telemetry Configuration

Multillm includes automatic telemetry (enabled by default):

```typescript
const llm = new Multillm('openai', 'gpt-4o', null, process.env.OPENAI_API_KEY, null, {
  telemetry: {
    enabled: true,
    filePath: './logs/llm-calls.ndjson',
    consoleLog: true,
    consoleVerbose: true,
    recordInputs: true,
    recordOutputs: true,
    serviceName: 'my-application',
    metadata: {
      environment: 'production',
      version: '1.0.0',
      userId: 'user-123'
    }
  }
});
```

### AWS Bedrock Configuration

```typescript
const llm = new Multillm('bedrock', null, null, null, null, {
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1'
  }
});
```

### Custom API Endpoint

```typescript
const llm = new Multillm('openai', 'gpt-4o', null, process.env.OPENAI_API_KEY, 'https://custom-api.example.com/v1');
```

## Switching Providers

Same code works across all providers:

```typescript
const messages = [{ role: 'user', content: 'Explain quantum computing' }];
const model = 'claude-3-5-sonnet-20241022';

// OpenAI
const openai = new Multillm('openai', 'gpt-4o', null, process.env.OPENAI_API_KEY);
const openaiResponse = await openai.createCompletion({ messages });

// Anthropic (same code!)
const anthropic = new Multillm('anthropic', model, null, process.env.ANTHROPIC_API_KEY);
const anthropicResponse = await anthropic.createCompletion({ messages });

// DeepSeek (same code!)
const deepseek = new Multillm('deepseek', 'deepseek-chat', null, process.env.DEEPSEEK_API_KEY);
const deepseekResponse = await deepseek.createCompletion({ messages });
```

## Common Patterns

### With Error Handling

```typescript
try {
  const response = await llm.createCompletion({
    messages: [{ role: 'user', content: 'Hello' }]
  });
  console.log(response.choices[0].message.content);
} catch (error) {
  if (error instanceof Error) {
    console.error('Error:', error.message);
    
    if (error.message.includes('rate_limit')) {
      console.error('Rate limited. Please wait and retry.');
    } else if (error.message.includes('authentication')) {
      console.error('Invalid API key. Please check your credentials.');
    }
  }
}
```

### With Retry Logic

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
    backoffMultiplier: 2
  }
);
```

### Check Provider Capabilities

```typescript
const caps = llm.getCapabilities();

if (caps.supportsStreaming) {
  console.log('Streaming is supported');
}

if (caps.supportsTools) {
  console.log('Function calling is supported');
}

if (caps.supportsVision) {
  console.log('Vision/multimodal is supported');
}

if (caps.supportsEmbeddings) {
  console.log('Embeddings are supported');
}

if (caps.supportsReasoning) {
  console.log('Reasoning models are supported');
}
```

### Get Available Models

```typescript
const models = await llm.getModels();
console.log('Available models:', models);
```

## Examples by Use Case

### Chatbot

```typescript
const llm = new Multillm('openai', 'gpt-4o', null, process.env.OPENAI_API_KEY);
let conversation = [{ role: 'system', content: 'You are a helpful assistant.' }];

async function chat(userMessage: string) {
  conversation.push({ role: 'user', content: userMessage });
  
  const response = await llm.createCompletion({ messages: conversation });
  conversation.push(response.choices[0].message);
  
  return response.choices[0].message.content;
}
```

### Code Generation

```typescript
const llm = new Multillm('openai', 'gpt-4o', null, process.env.OPENAI_API_KEY);

const response = await llm.createCompletion({
  messages: [{
    role: 'system',
    content: 'You are a coding assistant. Write clean, well-commented code.'
  }, {
    role: 'user',
    content: 'Write a function to sort an array in JavaScript.'
  }]
});

console.log(response.choices[0].message.content);
```

### Text Analysis

```typescript
const llm = new Multillm('openai', 'gpt-4o', null, process.env.OPENAI_API_KEY);

const response = await llm.createCompletion({
  messages: [{
    role: 'system',
    content: 'You are a text analysis assistant. Return analysis in JSON format.'
  }, {
    role: 'user',
    content: 'Analyze the sentiment of: "I love this product!"'
  }]
});

const analysis = JSON.parse(response.choices[0].message.content);
console.log(analysis);  // { sentiment: "positive", confidence: 0.95 }
```

## TypeScript Support

Multillm is written in TypeScript with full type definitions:

```typescript
import Multillm, {
  type ChatMessage,
  type ChatCompletionOptions,
  type ChatCompletionResponse
} from '@arrowai/multillm';

const message: ChatMessage = {
  role: 'user',
  content: 'Hello'
};

const options: ChatCompletionOptions = {
  messages: [message],
  temperature: 0.7
};

const response: ChatCompletionResponse = await llm.createCompletion(options);
```

## Next Steps

- Explore [Tools Documentation](./tools.md) for function calling
- Learn about [Embeddings](./embeddings.md) for vector search
- Check [Image Generation](./image-generation.md) for creating images
- See [Speech Generation](./speech.md) for text-to-speech
- Read [Transcription](./transcription.md) for speech-to-text
- Understand [Multimodal Content](./multimodal.md) for images and files
- Explore [Reasoning Models](./reasoning.md) for o1/o3 and extended thinking
- View [All Examples](./examples.md) for more code samples

## Troubleshooting

### Installation Issues

```bash
# Clear npm cache
npm cache clean --force

# Reinstall
rm -rf node_modules package-lock.json
npm install @arrowai/multillm
```

### API Key Issues

```typescript
// Verify API key is loaded
console.log('API Key loaded:', !!process.env.OPENAI_API_KEY);

// Test connection
try {
  const response = await llm.createCompletion({
    messages: [{ role: 'user', content: 'test' }]
  });
  console.log('Connection successful!');
} catch (error) {
  console.error('Connection failed:', error.message);
}
```

### Module Not Found

```typescript
// For CommonJS
const Multillm = require('@arrowai/multillm').default;

// For ES Modules
import Multillm from '@arrowai/multillm';
```

## Environment Checklist

- [ ] Node.js installed (v18 or higher recommended)
- [ ] npm/yarn/pnpm installed
- [ ] API keys obtained for chosen provider(s)
- [ ] `.env` file created with API keys
- [ ] `.env` added to `.gitignore`
- [ ] Project initialized (npm init if needed)
- [ ] Multillm installed (`npm install @arrowai/multillm`)

## Getting Help

- **Documentation**: Explore all docs in `/docs` folder
- **Examples**: Check `/docs/examples.md` for more samples
- **Issues**: Report bugs at https://github.com/your-repo/multillm-node/issues
- **Community**: Join discussions for help and best practices
