# API Reference

Complete API reference for the Multillm library.

## Table of Contents

- [Multillm Class](#multillm-class)
- [Types](#types)
- [Utility Functions](#utility-functions)

---

## Multillm Class

The main class for interacting with LLM providers.

### Constructor

```typescript
new Multillm(
  provider: SupportedProvider,
  model?: string | null,
  device_map?: string | null,
  apiKey?: string | null,
  apiEndpoint?: string | null,
  config?: ProviderConfig
)
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `provider` | `SupportedProvider` | The LLM provider to use |
| `model` | `string \| null` | Model name/ID (optional, uses provider default) |
| `device_map` | `string \| null` | Device mapping (for local models) |
| `apiKey` | `string \| null` | API key for the provider |
| `apiEndpoint` | `string \| null` | Custom API endpoint URL |
| `config` | `ProviderConfig` | Additional configuration options |

**Example:**

```typescript
const llm = new Multillm('openai', 'gpt-4o', null, 'sk-...', null, {
  telemetry: { enabled: true }
});
```

### Methods

#### createCompletion

Create a chat completion.

```typescript
async createCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse>
```

**Example:**

```typescript
const response = await llm.createCompletion({
  messages: [{ role: 'user', content: 'Hello!' }],
  temperature: 0.7,
  max_tokens: 100
});
```

#### createCompletionStream

Create a streaming completion with callbacks.

```typescript
async createCompletionStream(options: StreamingOptions): Promise<ChatCompletionResponse>
```

**Example:**

```typescript
const response = await llm.createCompletionStream({
  messages: [{ role: 'user', content: 'Tell me a story' }],
  onChunk: (chunk) => process.stdout.write(chunk.choices[0].delta.content || ''),
  onComplete: (response) => console.log('\nDone!'),
  onError: (error) => console.error(error)
});
```

#### streamCompletion

Create a streaming completion using async generator.

```typescript
async *streamCompletion(options: ChatCompletionOptions): AsyncGenerator<StreamChunk>
```

**Example:**

```typescript
for await (const chunk of llm.streamCompletion({ messages: [...] })) {
  process.stdout.write(chunk.choices[0].delta.content || '');
}
```

#### getCapabilities

Get provider capabilities.

```typescript
getCapabilities(): ProviderCapabilities
```

**Example:**

```typescript
const caps = llm.getCapabilities();
if (caps.supportsVision) {
  // Can use image content
}
```

#### getModels

Get available models for the provider.

```typescript
async getModels(): Promise<Array<{ id: string; name: string; provider: string; type: string }>>
```

#### createEmbedding

Create embeddings for text.

```typescript
async createEmbedding(options: EmbeddingOptions): Promise<EmbeddingResponse>
```

#### createImage

Generate images from text (OpenAI, Replicate).

```typescript
async createImage(options: ImageGenerationOptions): Promise<ImageGenerationResponse>
```

#### createTranscription

Transcribe audio to text (OpenAI, Groq).

```typescript
async createTranscription(options: TranscriptionOptions): Promise<TranscriptionResponse>
```

#### createSpeech

Convert text to speech (OpenAI).

```typescript
async createSpeech(options: SpeechOptions): Promise<SpeechResponse>
```

#### flushTelemetry

Flush pending telemetry data.

```typescript
async flushTelemetry(): Promise<void>
```

#### shutdown

Shutdown and cleanup resources.

```typescript
async shutdown(): Promise<void>
```

---

## Types

### SupportedProvider

```typescript
type SupportedProvider =
  | 'openai'
  | 'anthropic'
  | 'mistral'
  | 'groq'
  | 'ollama'
  | 'deepseek'
  | 'gemini'
  | 'perplexity'
  | 'lmstudio'
  | 'openrouter'
  | 'huggingface'
  | 'grok'
  | 'replicate'
  | 'bedrock'
  | 'cloudflare'
  | 'codeboltai'
  | 'zai';
```

### ChatCompletionOptions

```typescript
interface ChatCompletionOptions {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stop?: string | string[];
  stream?: boolean;
  tools?: Tool[];
  tool_choice?: ToolChoice;

  // Caching options
  enableCaching?: boolean;
  cacheControl?: CacheControl;
  systemCacheControl?: CacheControl;
  toolsCacheControl?: CacheControl;

  // Reasoning options
  reasoning?: ReasoningConfig;
}
```

### ChatMessage

```typescript
interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'function' | 'tool';
  content: MessageContent;  // string | null | ContentPart[]
  name?: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  reasoning?: ReasoningContent;
}
```

### MessageContent

```typescript
type MessageContent = string | null | ContentPart[];
```

### ContentPart

```typescript
type ContentPart = TextContentPart | ImageContentPart | FileContentPart;

interface TextContentPart {
  type: 'text';
  text: string;
}

interface ImageContentPart {
  type: 'image';
  image: string | URL | ArrayBuffer | Uint8Array;
  mimeType?: string;
  detail?: 'auto' | 'low' | 'high';
}

interface FileContentPart {
  type: 'file';
  file: string | URL | ArrayBuffer | Uint8Array;
  mimeType: string;
  filename?: string;
}
```

### ReasoningConfig

```typescript
interface ReasoningConfig {
  thinkingBudget?: number;
  includeReasoning?: boolean;
  reasoningEffort?: 'low' | 'medium' | 'high';
}
```

### ReasoningContent

```typescript
interface ReasoningContent {
  thinking: string;
  signature?: string;
}
```

### ChatCompletionResponse

```typescript
interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    delta?: {
      role?: string;
      content?: string;
      reasoning?: string;
    };
    finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    cached_tokens?: number;
    cache_creation_tokens?: number;
    cache_hit_tokens?: number;
    cache_miss_tokens?: number;
    reasoning_tokens?: number;
    reasoning_tokens_cached?: number;
    provider_usage?: Record<string, any>;
  };
}
```

### StreamChunk

```typescript
interface StreamChunk {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: 'assistant';
      content?: string;
      reasoning?: string;
      tool_calls?: Array<{...}>;
    };
    finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    reasoning_tokens?: number;
  };
}
```

### StreamingOptions

```typescript
interface StreamingOptions extends ChatCompletionOptions {
  onChunk?: (chunk: StreamChunk) => void;
  onComplete?: (response: ChatCompletionResponse) => void;
  onError?: (error: Error) => void;
  signal?: AbortSignal;
}
```

### ProviderCapabilities

```typescript
interface ProviderCapabilities {
  supportsStreaming?: boolean;
  supportsTools?: boolean;
  supportsVision?: boolean;
  supportsEmbeddings?: boolean;
  supportsCaching?: boolean;
  cachingType?: 'automatic' | 'explicit' | 'none';
  supportsImageGeneration?: boolean;
  supportsReranking?: boolean;
  supportsTranscription?: boolean;
  supportsSpeech?: boolean;
  supportsReasoning?: boolean;
  supportsMultimodal?: boolean;
}
```

### ProviderConfig

```typescript
interface ProviderConfig {
  telemetry?: TelemetryOptions;
  // AWS config for Bedrock
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
}

interface TelemetryOptions {
  enabled?: boolean;
  filePath?: string;
  consoleLog?: boolean;
  consoleVerbose?: boolean;
  recordInputs?: boolean;
  recordOutputs?: boolean;
  exportOtlp?: boolean;
  serviceName?: string;
  metadata?: Record<string, unknown>;
}
```

### Tool

```typescript
interface Tool {
  type: 'function';
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, any>;
  };
}
```

---

## Utility Functions

### Content Transformer

```typescript
import {
  isMultimodalContent,
  isStringContent,
  extractTextContent,
  imageToBase64,
  transformContentForOpenAI,
  transformContentForAnthropic,
  transformContentForGemini,
  transformContentForOllama
} from '@arrowai/multillm/utils/contentTransformer';
```

#### isMultimodalContent

Check if content is an array of content parts.

```typescript
function isMultimodalContent(content: MessageContent): content is ContentPart[]
```

#### isStringContent

Check if content is a string.

```typescript
function isStringContent(content: MessageContent): content is string
```

#### extractTextContent

Extract text from any content type.

```typescript
function extractTextContent(content: MessageContent): string
```

#### imageToBase64

Convert image to base64 with metadata.

```typescript
async function imageToBase64(
  image: string | URL | ArrayBuffer | Uint8Array,
  providedMimeType?: string
): Promise<{ data: string; mimeType: string; isUrl: boolean }>
```

### Reasoning Models

```typescript
import {
  isReasoningModel,
  getDefaultThinkingBudget,
  getOpenAIReasoningParams,
  getAnthropicThinkingParams,
  requiresSpecialParams,
  OPENAI_REASONING_MODELS,
  ANTHROPIC_THINKING_MODELS,
  DEEPSEEK_REASONING_MODELS
} from '@arrowai/multillm/utils/reasoningModels';
```

#### isReasoningModel

Check if a model supports reasoning.

```typescript
function isReasoningModel(model: string | null | undefined, provider: string): boolean
```

#### getDefaultThinkingBudget

Get default token budget for reasoning.

```typescript
function getDefaultThinkingBudget(model: string | null | undefined, provider: string): number
```

#### getOpenAIReasoningParams

Get OpenAI-specific reasoning parameters.

```typescript
function getOpenAIReasoningParams(
  model: string,
  options: {
    temperature?: number;
    max_tokens?: number;
    thinkingBudget?: number;
    reasoningEffort?: 'low' | 'medium' | 'high';
  }
): Record<string, unknown>
```

#### getAnthropicThinkingParams

Get Anthropic-specific thinking parameters.

```typescript
function getAnthropicThinkingParams(
  options: {
    includeReasoning?: boolean;
    thinkingBudget?: number;
  }
): Record<string, unknown> | undefined
```

#### requiresSpecialParams

Check if model needs special parameter handling.

```typescript
function requiresSpecialParams(model: string | null | undefined, provider: string): boolean
```
