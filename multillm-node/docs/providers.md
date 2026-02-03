# Providers Reference

Quick reference for all supported providers. **Same API across all providers!**

## Quick Setup

Create `.env` file:
```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
DEEPSEEK_API_KEY=sk-...
GEMINI_API_KEY=...
# ... see .env.example
```

---

## Cloud Providers

### OpenAI

**Best for**: Best overall quality, reasoning models (o1/o3), images, speech, transcription

**Models**: gpt-4o, gpt-4, gpt-3.5, o1, o3, dall-e-3, whisper-1, tts-1

**Features**: Chat, Tools, Vision, Embeddings, Images, Speech, Transcription, Reasoning, Caching

```typescript
const llm = new Multillm('openai', 'gpt-4o', null, process.env.OPENAI_API_KEY);

const response = await llm.createCompletion({
  messages: [{ role: 'user', content: 'Hello!' }]
});
```

**Setup**: Get key at https://platform.openai.com/api-keys

---

### Anthropic

**Best for**: Complex reasoning, long context, PDF analysis, extended thinking

**Models**: claude-3-opus, claude-3-5-sonnet-20241022, claude-3-7-sonnet-20250219, claude-4

**Features**: Chat, Tools, Vision, PDFs, Reasoning, Caching (explicit), Multimodal

```typescript
const llm = new Multillm('anthropic', 'claude-3-5-sonnet-20241022', null, process.env.ANTHROPIC_API_KEY);

const response = await llm.createCompletion({
  messages: [{ role: 'user', content: 'Hello!' }]
});
```

**Setup**: Get key at https://console.anthropic.com/settings/keys

---

### DeepSeek

**Best for**: Cost-effective, fast reasoning, Chinese language support

**Models**: deepseek-chat, deepseek-coder, deepseek-reasoner

**Features**: Chat, Tools, Reasoning, Caching (automatic)

```typescript
const llm = new Multillm('deepseek', 'deepseek-chat', null, process.env.DEEPSEEK_API_KEY);

const response = await llm.createCompletion({
  messages: [{ role: 'user', content: '你好！' }]
});
```

**Setup**: Get key at https://platform.deepseek.com/api_keys

---

### Gemini (Google AI)

**Best for**: Extremely long context, multimodal

**Models**: gemini-1.5-pro, gemini-1.5-flash, gemini-1.5

**Features**: Chat, Tools, Vision, Embeddings, Caching (explicit), Multimodal

```typescript
const llm = new Multillm('gemini', 'gemini-1.5-pro', null, process.env.GEMINI_API_KEY);

const response = await llm.createCompletion({
  messages: [{ role: 'user', content: 'Hello!' }]
});
```

**Setup**: Get key at https://makersuite.google.com/app/apikey

---

### Mistral

**Best for**: European data residency, code generation, fast inference

**Models**: mistral-large, mistral-medium, mistral-small, codestral, embed

**Features**: Chat, Tools, Embeddings

```typescript
const llm = new Multillm('mistral', 'mistral-large', null, process.env.MISTRAL_API_KEY);

const response = await llm.createCompletion({
  messages: [{ role: 'user', content: 'Bonjour!' }]
});
```

**Setup**: Get key at https://console.mistral.ai/api-keys

---

### Groq

**Best for**: Speed, low latency, open-source models

**Models**: llama-3.1-70b, mixtral-8x7b, whisper-large-v3

**Features**: Chat, Tools, Transcription

```typescript
const llm = new Multillm('groq', 'llama-3.1-70b', null, process.env.GROQ_API_KEY);

const response = await llm.createCompletion({
  messages: [{ role: 'user', content: 'Hello!' }]
});
```

**Setup**: Get key at https://console.groq.com/keys

---

### Replicate

**Best for**: Image generation, custom models

**Models**: stabilityai/sdxl, black-forest-labs/flux, and many more

**Features**: Image Generation

```typescript
const llm = new Multillm('replicate', null, null, process.env.REPLICATE_API_TOKEN);

const response = await llm.createImage({
  prompt: 'A futuristic robot',
  model: 'stabilityai/sdxl'
});
```

**Setup**: Get key at https://replicate.com/account/api-tokens

---

### AWS Bedrock

**Best for**: Enterprise, AWS integration, compliance

**Models**: Claude, Titan, Llama, Mistral (via AWS)

**Features**: Chat, Tools, Embeddings, Vision, Caching (automatic)

```typescript
const llm = new Multillm('bedrock', null, null, null, null, {
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1'
  }
});

const response = await llm.createCompletion({
  messages: [{ role: 'user', content: 'Hello!' }]
});
```

**Setup**: Get credentials at https://console.aws.amazon.com/iam/home

---

### Cloudflare AI

**Best for**: Edge computing, fast global deployment

**Models**: Various models available via Workers AI

**Features**: Chat

```typescript
const llm = new Multillm('cloudflare', null, null, process.env.CLOUDFLARE_API_KEY);

const response = await llm.createCompletion({
  messages: [{ role: 'user', content: 'Hello!' }]
});
```

**Setup**: Get key at https://dash.cloudflare.com/profile/api-tokens

---

### OpenRouter

**Best for**: Access to many models through one API

**Models**: OpenAI, Anthropic, Mistral, and more (via OpenRouter)

**Features**: Chat, Tools, Vision, Embeddings, Images, Transcription

```typescript
const llm = new Multillm('openrouter', null, null, process.env.OPENROUTER_API_KEY);

const response = await llm.createCompletion({
  messages: [{ role: 'user', content: 'Hello!' }],
  model: 'openai/gpt-4'
});
```

**Setup**: Get key at https://openrouter.ai/keys

---

### Hugging Face

**Best for**: Open-source models, community models

**Models**: Thousands of models available

**Features**: Chat, Embeddings

```typescript
const llm = new Multillm('huggingface', null, null, process.env.HUGGINGFACE_API_KEY);

const response = await llm.createCompletion({
  messages: [{ role: 'user', content: 'Hello!' }]
});
```

**Setup**: Get key at https://huggingface.co/settings/tokens

---

### Grok (xAI)

**Best for**: Real-time information access

**Models**: grok-beta, grok-2

**Features**: Chat, Tools, Vision

```typescript
const llm = new Multillm('grok', null, null, process.env.GROK_API_KEY);

const response = await llm.createCompletion({
  messages: [{ role: 'user', content: 'Hello!' }]
});
```

**Setup**: Get key at https://console.x.ai/

---

### Perplexity

**Best for**: Search-enhanced chat, real-time information

**Models**: sonnet-medium, sonnet-small

**Features**: Chat, Tools

```typescript
const llm = new Multillm('perplexity', 'sonnet-medium', null, process.env.PERPLEXITY_API_KEY);

const response = await llm.createCompletion({
  messages: [{ role: 'user', content: 'Hello!' }]
});
```

**Setup**: Get key at https://www.perplexity.ai/settings/api

---

### CodeBolt AI

**Best for**: Custom features, embeddings, reranking

**Models**: Various models available

**Features**: Chat, Tools, Embeddings, Reranking

```typescript
const llm = new Multillm('codeboltai', null, null, process.env.CODEBOLT_API_KEY);

const response = await llm.createCompletion({
  messages: [{ role: 'user', content: 'Hello!' }]
});
```

**Setup**: Get key at https://codebolt.ai/

---

### ZAi

**Best for**: Custom models, specialized use cases

**Models**: Various models available

**Features**: Chat, Tools

```typescript
const llm = new Multillm('zai', null, null, process.env.ZAI_API_KEY);

const response = await llm.createCompletion({
  messages: [{ role: 'user', content: 'Hello!' }]
});
```

**Setup**: Get key at https://api.z.ai/

---

## Local Providers

### Ollama

**Best for**: Local inference, privacy, cost savings

**Models**: Any model you install (llama2, mistral, codellama, etc.)

**Features**: Chat, Streaming, Vision, Embeddings, Multimodal

```typescript
const llm = new Multillm('ollama', 'llama2', null, null, 'http://localhost:11434');

const response = await llm.createCompletion({
  messages: [{ role: 'user', content: 'Hello!' }]
});
```

**Setup**: 
```bash
# Install Ollama
curl https://ollama.ai/install.sh | sh

# Pull a model
ollama pull llama2

# Start server
ollama serve
```

---

### LM Studio

**Best for**: Local inference with GUI, Mac/Windows

**Models**: Any model available in LM Studio

**Features**: Chat, Streaming, Tools, Vision

```typescript
const llm = new Multillm('lmstudio', null, null, null, 'http://localhost:1234/v1');

const response = await llm.createCompletion({
  messages: [{ role: 'user', content: 'Hello!' }]
});
```

**Setup**: Download from https://lmstudio.ai/

---

## Feature Matrix

| Provider | Chat | Tools | Vision | Embeddings | Images | Speech | Transcription | Reasoning | Caching | Multimodal |
|----------|-----|-------|--------|------------|---------|--------|---------------|-----------|----------|-----------|
| OpenAI | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Auto | ✅ |
| Anthropic | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | Explicit | ✅ |
| DeepSeek | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | Auto | ❌ |
| Gemini | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | Explicit | ✅ |
| Mistral | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Groq | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Replicate | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Bedrock | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | Auto | ✅ |
| Cloudflare | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| OpenRouter | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | Varies | ✅ |
| HuggingFace | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Grok | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Perplexity | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| CodeBolt AI | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| ZAi | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Ollama | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | Auto | ✅ |
| LM Studio | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Provider Selection Guide

### Choose OpenAI if:
- You want best overall quality
- Need o1/o3 reasoning models
- Need all features (chat, images, speech, transcription, embeddings)
- Cost is not primary concern

### Choose Anthropic if:
- Need extended context (200k tokens)
- Want PDF document analysis
- Need extended thinking for complex problems
- Privacy is important

### Choose DeepSeek if:
- Want cost-effective solution
- Need good reasoning at low cost
- API speed matters
- Chinese language support

### Choose Gemini if:
- Need extremely long context (1M+ tokens)
- Want multimodal capabilities
- Google ecosystem integration

### Choose Groq if:
- Speed is critical
- Want low latency
- Using open-source models (Llama, Mixtral)

### Choose Mistral if:
- Need EU data residency
- Want good performance at reasonable cost
- Need code generation (Codestral)

### Choose Ollama if:
- Want to run locally
- Data privacy is critical
- Don't want to pay API fees
- Have powerful hardware

### Choose Replicate if:
- Need specialized image models
- Want custom model access
- Need SDXL, Flux, or other image generators

### Choose Cloud Providers (Bedrock, Cloudflare, etc.) if:
- Enterprise requirements
- Need compliance/certifications
- Want cloud-native integration

### Choose Aggregator (OpenRouter) if:
- Want access to many models
- Don't want multiple API keys
- Want to test different models easily

---

## Switching Providers

The main value of Multillm: **Switch providers by changing one line**:

```typescript
// Same code works for all providers!
const providers = [
  { name: 'OpenAI', provider: 'openai', model: 'gpt-4o', key: process.env.OPENAI_API_KEY },
  { name: 'Anthropic', provider: 'anthropic', model: 'claude-3-5-sonnet-20241022', key: process.env.ANTHROPIC_API_KEY },
  { name: 'DeepSeek', provider: 'deepseek', model: 'deepseek-chat', key: process.env.DEEPSEEK_API_KEY },
  { name: 'Gemini', provider: 'gemini', model: 'gemini-1.5-pro', key: process.env.GEMINI_API_KEY },
  { name: 'Mistral', provider: 'mistral', model: 'mistral-large', key: process.env.MISTRAL_API_KEY }
];

const prompt = 'Explain quantum computing simply.';

for (const { name, provider, model, key } of providers) {
  const llm = new Multillm(provider, model, null, key);
  const response = await llm.createCompletion({
    messages: [{ role: 'user', content: prompt }]
  });
  
  console.log(`${name}:`, response.choices[0].message.content);
}
```

All providers use the **exact same API** - only the initialization differs!
