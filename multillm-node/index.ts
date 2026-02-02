import type {
  Provider,
  SupportedProvider,
  ProviderConfig,
  ChatCompletionOptions,
  ChatCompletionResponse,
  StreamChunk,
  StreamingOptions,
  ProviderCapabilities,
  LLMProviderWithStreaming,
  EmbeddingOptions,
  EmbeddingResponse,
  ImageGenerationOptions,
  ImageGenerationResponse,
  RerankOptions,
  RerankResponse,
  TranscriptionOptions,
  TranscriptionResponse,
  SpeechOptions,
  SpeechResponse
} from './types';

// Import telemetry classes
import { TelemetryCollector } from './telemetry/collector';
import { FileExporter, ConsoleExporter, CompositeExporter } from './telemetry/exporters';
import type { GenAIProviderName } from './telemetry/types';

// Import content utilities
import { extractTextContent } from './utils/contentTransformer';

// Providers that support streaming
const STREAMING_PROVIDERS = new Set<SupportedProvider>([
  'openai', 'anthropic', 'mistral', 'groq', 'ollama', 'deepseek', 'gemini'
]);

// Providers that support tools/function calling
const TOOL_PROVIDERS = new Set<SupportedProvider>([
  'openai', 'anthropic', 'mistral', 'groq', 'deepseek', 'gemini'
]);

// Providers that support vision/images
const VISION_PROVIDERS = new Set<SupportedProvider>([
  'openai', 'anthropic', 'gemini', 'ollama'
]);

// Providers that support embeddings
const EMBEDDING_PROVIDERS = new Set<SupportedProvider>([
  'openai', 'codeboltai', 'mistral', 'ollama', 'zai'
]);

// Providers that support caching
const CACHING_PROVIDERS = new Set<SupportedProvider>([
  'openai', 'anthropic', 'deepseek', 'gemini'
]);

// Providers with automatic caching (vs explicit)
const AUTOMATIC_CACHING_PROVIDERS = new Set<SupportedProvider>([
  'openai', 'deepseek'
]);

// Providers that support image generation
const IMAGE_GENERATION_PROVIDERS = new Set<SupportedProvider>([
  'openai', 'replicate'
]);

// Providers that support reranking
const RERANKING_PROVIDERS = new Set<SupportedProvider>([
  'codeboltai'
]);

// Providers that support transcription (speech-to-text)
const TRANSCRIPTION_PROVIDERS = new Set<SupportedProvider>([
  'openai', 'groq'
]);

// Providers that support speech (text-to-speech)
const SPEECH_PROVIDERS = new Set<SupportedProvider>([
  'openai'
]);

// Providers that support reasoning models (o1/o3, extended thinking, reasoner)
const REASONING_PROVIDERS = new Set<SupportedProvider>([
  'openai', 'anthropic', 'deepseek'
]);

// Providers that support multimodal content (images, files in messages)
const MULTIMODAL_PROVIDERS = new Set<SupportedProvider>([
  'openai', 'anthropic', 'gemini', 'ollama'
]);

// Import providers
import CodeBoltAI from './providers/codebolt/index';
import OpenAI from './providers/openai/index';
import Anthropic from './providers/anthropic/index';
import Perplexity from './providers/perplexity/index';
import LMStudio from './providers/lmstudio/index';
import MistralAI from './providers/mistral/index';
import Gemini from './providers/gemini/index';
import Ollama from './providers/ollama/index';
import OpenRouter from './providers/openrouter/index';
import HuggingFace from './providers/huggingface/index';
import Bedrock from './providers/bedrock/index';
import CloudflareAI from './providers/cloudflare/index';
import Groq from './providers/groq/index';
import Grok from './providers/grok/index';
import Replicate from './providers/replicate/index';
import DeepseekAI from './providers/deepseek/index';
import ZAi from './providers/zai/index';

class Multillm implements LLMProviderWithStreaming {
  public provider: SupportedProvider;
  public device_map: string | null;
  public apiKey: string | null;
  public model: string | null;
  public apiEndpoint: string | null;
  public config: ProviderConfig;
  private instance: LLMProviderWithStreaming;
  private telemetryCollector: TelemetryCollector | null = null;

  constructor(
    provider: SupportedProvider,
    model: string | null = null,
    device_map: string | null = null,
    apiKey: string | null = null,
    apiEndpoint: string | null = null,
    config: ProviderConfig = {}
  ) {
    this.provider = provider;
    this.device_map = device_map;
    this.apiKey = apiKey;
    this.model = model;
    this.apiEndpoint = apiEndpoint;
    this.config = config;

    // Initialize telemetry if enabled
    this.initTelemetry();

    switch (this.provider) {
      case "codeboltai": {
        this.instance = new CodeBoltAI(this.model, this.device_map, this.apiKey, this.apiEndpoint);
        break;
      }
      case "openai": {
        this.instance = new OpenAI(this.model, this.device_map, this.apiKey, this.apiEndpoint);
        break;
      }
      case "anthropic": {
        this.instance = new Anthropic(this.model, this.device_map, this.apiKey, this.apiEndpoint);
        break;
      }
      case "perplexity": {
        this.instance = new Perplexity(this.model, this.device_map, this.apiKey, this.apiEndpoint);
        break;
      }
      case "lmstudio": {
        this.instance = new LMStudio(this.model, this.device_map, this.apiEndpoint);
        break;
      }
      case "mistral": {
        this.instance = new MistralAI(this.model, this.device_map, this.apiKey, this.apiEndpoint);
        break;
      }
      case "gemini": {
        this.instance = new Gemini(this.model, this.device_map, this.apiKey, this.apiEndpoint);
        break;
      }
      case "ollama": {
        this.instance = new Ollama(this.model, this.device_map, this.apiKey, this.apiEndpoint);
        break;
      }
      case "openrouter": {
        this.instance = new OpenRouter(this.model, this.device_map, this.apiKey, this.apiEndpoint);
        break;
      }
      case "huggingface": {
        this.instance = new HuggingFace(this.model, this.device_map, this.apiKey, this.apiEndpoint);
        break;
      }
      case "grok": {
        this.instance = new Grok(this.model, this.device_map, this.apiKey, this.apiEndpoint);
        break;
      }
      case "replicate": {
        this.instance = new Replicate(this.model, this.device_map, this.apiKey, this.apiEndpoint);
        break;
      }
      case "groq": {
        this.instance = new Groq(this.model, this.device_map, this.apiKey, this.apiEndpoint);
        break;
      }
      case "bedrock": {
        this.instance = new Bedrock(this.model, this.device_map, this.apiKey, this.apiEndpoint, this.config);
        break;
      }
      case "cloudflare": {
        this.instance = new CloudflareAI({
          apiKey: this.apiKey || '',
          apiEndpoint: this.apiEndpoint || '',
          model: this.model || '@cf/meta/llama-3.1-8b-instruct'
        });
        break;
      }
      case "deepseek": {
        this.instance = new DeepseekAI(this.model, this.device_map, this.apiKey, this.apiEndpoint);
        break;
      }

      case "zai": {
        this.instance = new ZAi(this.model, this.device_map, this.apiKey, this.apiEndpoint);
        break;
      }
      default: {
        console.log(`Unsupported provider: ${this.provider}`);
        throw new Error(`Unsupported provider: ${this.provider}`);
      }
    }
  }

  /**
   * Initialize telemetry (enabled by default)
   */
  private initTelemetry(): void {
    const telemetryConfig = this.config.telemetry;

    // Telemetry is enabled by default unless explicitly disabled
    if (telemetryConfig?.enabled === false) {
      return;
    }

    // Create telemetry collector with sensible defaults
    this.telemetryCollector = new TelemetryCollector({
      isEnabled: true,
      recordInputs: telemetryConfig?.recordInputs ?? true,
      recordOutputs: telemetryConfig?.recordOutputs ?? true,
      serviceName: telemetryConfig?.serviceName ?? 'multillm',
      metadata: telemetryConfig?.metadata
    });

    // Add exporters based on config
    const exporters: Array<ConsoleExporter | FileExporter> = [];

    // Console exporter (if requested)
    if (telemetryConfig?.consoleLog) {
      exporters.push(new ConsoleExporter({ verbose: telemetryConfig.consoleVerbose ?? false }));
    }

    // File exporter - always add with custom or default path
    exporters.push(new FileExporter({
      filePath: telemetryConfig?.filePath ?? './llm-telemetry.ndjson',
      exportOtlp: telemetryConfig?.exportOtlp ?? false
    }));

    // Add all exporters
    if (exporters.length === 1) {
      this.telemetryCollector.addExporter(exporters[0]);
    } else {
      this.telemetryCollector.addExporter(new CompositeExporter(exporters));
    }

    // Auto-flush on process exit (Node.js only)
    this.setupAutoFlush();
  }

  /**
   * Setup automatic flush on process exit (Node.js environments)
   */
  private setupAutoFlush(): void {
    try {
      // Only run in Node.js environment - use eval to avoid bundler issues
      const proc = (new Function('return typeof process !== "undefined" ? process : null'))() as {
        on?: (event: string, listener: () => void) => void;
      } | null;

      if (proc?.on) {
        const collector = this.telemetryCollector;
        proc.on('beforeExit', () => {
          collector?.flush().catch(() => {});
        });
      }
    } catch {
      // Not in Node.js environment, skip auto-flush setup
    }
  }

  /**
   * Create a completion (backward compatible)
   * Automatically records telemetry if enabled
   */
  async createCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    if (!this.telemetryCollector) {
      return this.instance.createCompletion(options);
    }

    const span = this.telemetryCollector.startSpan(
      'chat',
      this.provider as GenAIProviderName,
      this.model || options.model
    );

    // Set request parameters
    if (options.temperature !== undefined) {
      span.setRequestParams({ temperature: options.temperature });
    }
    if (options.max_tokens !== undefined) {
      span.setRequestParams({ maxTokens: options.max_tokens });
    }

    // Record input
    if (options.messages?.length) {
      const lastMessage = options.messages[options.messages.length - 1];
      const inputText = extractTextContent(lastMessage.content);
      if (inputText) {
        span.setInput(inputText);
      }
    }

    try {
      const response = await this.instance.createCompletion(options);

      // Record response
      span.setResponse({
        model: response.model,
        id: response.id,
        finishReasons: response.choices?.map(c => c.finish_reason).filter(Boolean) as string[]
      });

      // Record usage
      if (response.usage) {
        span.setUsage({
          inputTokens: response.usage.prompt_tokens,
          outputTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
          cachedTokens: response.usage.cached_tokens,
          cacheCreationTokens: response.usage.cache_creation_tokens,
          reasoningTokens: response.usage.reasoning_tokens
        });
      }

      // Record output
      const outputContent = response.choices?.[0]?.message?.content;
      const outputText = extractTextContent(outputContent);
      if (outputText) {
        span.setOutput(outputText);
      }

      span.setSuccess();
      span.end();

      return response;
    } catch (error) {
      span.setError(error instanceof Error ? error : new Error(String(error)));
      span.end();
      throw error;
    }
  }

  /**
   * Create a completion with streaming support and callbacks
   * @param options - Streaming options with onChunk, onComplete, onError callbacks
   * @returns Final aggregated response
   */
  async createCompletionStream(options: StreamingOptions): Promise<ChatCompletionResponse> {
    if (this.instance.createCompletionStream) {
      return this.instance.createCompletionStream(options);
    }
    // Fallback: use non-streaming and call onComplete
    const response = await this.instance.createCompletion(options);
    options.onComplete?.(response);
    return response;
  }

  /**
   * AsyncGenerator-based streaming for use with for-await-of
   * Automatically records telemetry if enabled
   * @param options - Completion options
   * @yields StreamChunk objects
   */
  async *streamCompletion(options: ChatCompletionOptions): AsyncGenerator<StreamChunk, void, unknown> {
    // If no telemetry, just yield the stream directly
    if (!this.telemetryCollector) {
      if (this.instance.streamCompletion) {
        yield* this.instance.streamCompletion(options);
      } else {
        const response = await this.instance.createCompletion(options);
        yield {
          id: response.id,
          object: 'chat.completion.chunk',
          created: response.created,
          model: response.model,
          choices: [{
            index: 0,
            delta: {
              role: 'assistant',
              content: extractTextContent(response.choices[0]?.message?.content)
            },
            finish_reason: response.choices[0]?.finish_reason || 'stop'
          }]
        };
      }
      return;
    }

    // With telemetry
    const span = this.telemetryCollector.startSpan(
      'chat',
      this.provider as GenAIProviderName,
      this.model || options.model
    );
    span.addEvent('stream_start');

    let outputContent = '';
    let lastChunk: StreamChunk | null = null;

    try {
      if (this.instance.streamCompletion) {
        for await (const chunk of this.instance.streamCompletion(options)) {
          lastChunk = chunk;
          const delta = chunk.choices?.[0]?.delta?.content;
          if (delta) {
            outputContent += delta;
          }
          yield chunk;
        }
      } else {
        const response = await this.instance.createCompletion(options);
        outputContent = extractTextContent(response.choices[0]?.message?.content);
        const chunk: StreamChunk = {
          id: response.id,
          object: 'chat.completion.chunk',
          created: response.created,
          model: response.model,
          choices: [{
            index: 0,
            delta: {
              role: 'assistant',
              content: outputContent
            },
            finish_reason: response.choices[0]?.finish_reason || 'stop'
          }]
        };
        lastChunk = chunk;
        yield chunk;
      }

      span.addEvent('stream_end');
      if (outputContent) {
        span.setOutput(outputContent);
      }
      if (lastChunk) {
        span.setResponse({
          model: lastChunk.model,
          id: lastChunk.id,
          finishReasons: lastChunk.choices?.map(c => c.finish_reason).filter(Boolean) as string[]
        });
      }
      span.setSuccess();
      span.end();
    } catch (error) {
      span.setError(error instanceof Error ? error : new Error(String(error)));
      span.end();
      throw error;
    }
  }

  /**
   * Get provider capabilities
   * @returns Object describing what features the provider supports
   */
  getCapabilities(): ProviderCapabilities {
    if (this.instance.getCapabilities) {
      return this.instance.getCapabilities();
    }
    // Default capabilities based on known providers
    return {
      supportsStreaming: STREAMING_PROVIDERS.has(this.provider),
      supportsTools: TOOL_PROVIDERS.has(this.provider),
      supportsVision: VISION_PROVIDERS.has(this.provider),
      supportsEmbeddings: EMBEDDING_PROVIDERS.has(this.provider),
      supportsCaching: CACHING_PROVIDERS.has(this.provider),
      cachingType: AUTOMATIC_CACHING_PROVIDERS.has(this.provider) ? 'automatic' :
                   CACHING_PROVIDERS.has(this.provider) ? 'explicit' : 'none',
      supportsImageGeneration: IMAGE_GENERATION_PROVIDERS.has(this.provider),
      supportsReranking: RERANKING_PROVIDERS.has(this.provider),
      supportsTranscription: TRANSCRIPTION_PROVIDERS.has(this.provider),
      supportsSpeech: SPEECH_PROVIDERS.has(this.provider),
      supportsReasoning: REASONING_PROVIDERS.has(this.provider),
      supportsMultimodal: MULTIMODAL_PROVIDERS.has(this.provider)
    };
  }

  /**
   * Get available models for this provider
   */
  async getModels(): Promise<any> {
    return this.instance.getModels();
  }

  /**
   * Create embeddings for text input
   * Automatically records telemetry if enabled
   * @param options - Embedding options including input text and model
   * @returns Embedding response with vectors
   * @throws Error if provider does not support embeddings
   */
  async createEmbedding(options: EmbeddingOptions): Promise<EmbeddingResponse> {
    if (!EMBEDDING_PROVIDERS.has(this.provider)) {
      throw new Error(`Provider "${this.provider}" does not support embeddings. Supported providers: ${Array.from(EMBEDDING_PROVIDERS).join(', ')}`);
    }

    if (!this.instance.createEmbedding) {
      throw new Error(`Provider "${this.provider}" has not implemented createEmbedding method`);
    }

    if (!this.telemetryCollector) {
      return this.instance.createEmbedding(options);
    }

    const span = this.telemetryCollector.startSpan(
      'embeddings',
      this.provider as GenAIProviderName,
      options.model
    );

    try {
      const response = await this.instance.createEmbedding(options);
      span.setResponse({ model: response.model });
      if (response.usage) {
        span.setUsage({
          inputTokens: response.usage.prompt_tokens,
          totalTokens: response.usage.total_tokens
        });
      }
      span.setSuccess();
      span.end();
      return response;
    } catch (error) {
      span.setError(error instanceof Error ? error : new Error(String(error)));
      span.end();
      throw error;
    }
  }

  /**
   * Generate images from text prompt
   * Automatically records telemetry if enabled
   * @param options - Image generation options
   * @returns Generated images with URLs or base64 data
   * @throws Error if provider does not support image generation
   */
  async createImage(options: ImageGenerationOptions): Promise<ImageGenerationResponse> {
    if (!IMAGE_GENERATION_PROVIDERS.has(this.provider)) {
      throw new Error(`Provider "${this.provider}" does not support image generation. Supported providers: ${Array.from(IMAGE_GENERATION_PROVIDERS).join(', ')}`);
    }

    if (!this.instance.createImage) {
      throw new Error(`Provider "${this.provider}" has not implemented createImage method`);
    }

    if (!this.telemetryCollector) {
      return this.instance.createImage(options);
    }

    const span = this.telemetryCollector.startSpan(
      'create_image',
      this.provider as GenAIProviderName,
      options.model
    );
    span.setInput(options.prompt);
    if (options.size) span.setAttribute('gen_ai.image.size', options.size);
    if (options.n) span.setAttribute('gen_ai.image.n', options.n);

    try {
      const response = await this.instance.createImage(options);
      span.setAttribute('gen_ai.image.count', response.data.length);
      span.setSuccess();
      span.end();
      return response;
    } catch (error) {
      span.setError(error instanceof Error ? error : new Error(String(error)));
      span.end();
      throw error;
    }
  }

  /**
   * Rerank documents by relevance to a query
   * Automatically records telemetry if enabled
   * @param options - Reranking options including query and documents
   * @returns Reranked results sorted by relevance
   * @throws Error if provider does not support reranking
   */
  async rerank(options: RerankOptions): Promise<RerankResponse> {
    if (!RERANKING_PROVIDERS.has(this.provider)) {
      throw new Error(`Provider "${this.provider}" does not support reranking. Supported providers: ${Array.from(RERANKING_PROVIDERS).join(', ')}`);
    }

    if (!this.instance.rerank) {
      throw new Error(`Provider "${this.provider}" has not implemented rerank method`);
    }

    if (!this.telemetryCollector) {
      return this.instance.rerank(options);
    }

    const span = this.telemetryCollector.startSpan(
      'rerank',
      this.provider as GenAIProviderName,
      options.model
    );
    span.setInput(options.query);
    span.setAttribute('gen_ai.rerank.document_count', options.documents.length);

    try {
      const response = await this.instance.rerank(options);
      span.setAttribute('gen_ai.rerank.result_count', response.results.length);
      span.setSuccess();
      span.end();
      return response;
    } catch (error) {
      span.setError(error instanceof Error ? error : new Error(String(error)));
      span.end();
      throw error;
    }
  }

  /**
   * Transcribe audio to text (speech-to-text)
   * Automatically records telemetry if enabled
   * @param options - Transcription options including audio file
   * @returns Transcription response with text
   * @throws Error if provider does not support transcription
   */
  async createTranscription(options: TranscriptionOptions): Promise<TranscriptionResponse> {
    if (!TRANSCRIPTION_PROVIDERS.has(this.provider)) {
      throw new Error(`Provider "${this.provider}" does not support transcription. Supported providers: ${Array.from(TRANSCRIPTION_PROVIDERS).join(', ')}`);
    }

    if (!this.instance.createTranscription) {
      throw new Error(`Provider "${this.provider}" has not implemented createTranscription method`);
    }

    if (!this.telemetryCollector) {
      return this.instance.createTranscription(options);
    }

    const span = this.telemetryCollector.startSpan(
      'transcription',
      this.provider as GenAIProviderName,
      options.model
    );
    span.setAttribute('gen_ai.transcription.language', options.language || 'auto');
    span.setAttribute('gen_ai.transcription.response_format', options.response_format || 'json');

    try {
      const response = await this.instance.createTranscription(options);
      span.setOutput(response.text);
      if (response.duration !== undefined) {
        span.setAttribute('gen_ai.transcription.duration', response.duration);
      }
      if (response.language) {
        span.setAttribute('gen_ai.transcription.detected_language', response.language);
      }
      span.setSuccess();
      span.end();
      return response;
    } catch (error) {
      span.setError(error instanceof Error ? error : new Error(String(error)));
      span.end();
      throw error;
    }
  }

  /**
   * Generate speech from text (text-to-speech)
   * Automatically records telemetry if enabled
   * @param options - Speech options including input text and voice
   * @returns Speech response with audio data
   * @throws Error if provider does not support speech
   */
  async createSpeech(options: SpeechOptions): Promise<SpeechResponse> {
    if (!SPEECH_PROVIDERS.has(this.provider)) {
      throw new Error(`Provider "${this.provider}" does not support speech. Supported providers: ${Array.from(SPEECH_PROVIDERS).join(', ')}`);
    }

    if (!this.instance.createSpeech) {
      throw new Error(`Provider "${this.provider}" has not implemented createSpeech method`);
    }

    if (!this.telemetryCollector) {
      return this.instance.createSpeech(options);
    }

    const span = this.telemetryCollector.startSpan(
      'speech',
      this.provider as GenAIProviderName,
      options.model
    );
    span.setInput(options.input);
    span.setAttribute('gen_ai.speech.voice', options.voice || 'alloy');
    span.setAttribute('gen_ai.speech.response_format', options.response_format || 'mp3');
    if (options.speed !== undefined) {
      span.setAttribute('gen_ai.speech.speed', options.speed);
    }

    try {
      const response = await this.instance.createSpeech(options);
      span.setAttribute('gen_ai.speech.content_type', response.contentType);
      span.setAttribute('gen_ai.speech.audio_size', response.audio.byteLength);
      span.setSuccess();
      span.end();
      return response;
    } catch (error) {
      span.setError(error instanceof Error ? error : new Error(String(error)));
      span.end();
      throw error;
    }
  }

  /**
   * Flush any pending telemetry data
   * Call this before shutting down your application
   */
  async flushTelemetry(): Promise<void> {
    if (this.telemetryCollector) {
      await this.telemetryCollector.flush();
    }
  }

  /**
   * Shutdown telemetry and flush all pending data
   * Call this when your application is shutting down
   */
  async shutdown(): Promise<void> {
    if (this.telemetryCollector) {
      await this.telemetryCollector.shutdown();
    }
  }
}

export function getProviders(): Provider[] {
  const providers: Provider[] = [
    {
      id: 1,
      logo: "https://avatars.githubusercontent.com/u/166920414?s=200&v=4",
      name: "CodeBolt AI",
      apiUrl: "https://codeboltproxy.arrowai.workers.dev/v1",
      category: 'codebolt'
    },
    {
      id: 2,
      logo: "https://github.com/openai.png",
      name: "Open AI",
      apiUrl: "https://gateway.ai.cloudflare.com/v1/8073e84dbfc4e2bc95666192dcee62c0/codebolt/openai",
      category: 'cloudProviders'
    },
    {
      id: 3,
      logo: "https://github.com/lmstudio-ai.png",
      name: "LM Studio",
      apiUrl: "http://localhost:1234/v1",
      category: 'localProviders'
    },
    {
      id: 4,
      logo: "https://github.com/anthropics.png",
      name: "Anthropic",
      apiUrl: "https://api.anthropic.com",
      category: 'cloudProviders'
    },
    {
      id: 5,
      logo: "https://github.com/deepseek-ai.png",
      name: "Deepseek",
      apiUrl: "https://api.deepseek.com/v1",
      category: 'cloudProviders'
    },
    {
      id: 6,
      logo: "https://github.com/mistralai.png",
      name: "Mistral",
      apiUrl: "https://api.mistral.ai/v1",
      category: 'cloudProviders'
    },
    {
      id: 7,
      logo: "https://github.com/google.png",
      name: "Gemini",
      apiUrl: "https://gateway.ai.cloudflare.com/v1/8073e84dbfc4e2bc95666192dcee62c0/codebolt/google-ai-studio",
      category: 'cloudProviders'
    },
    {
      id: 8,
      logo: "https://github.com/ollama/ollama/raw/main/docs/ollama.png",
      name: "Ollama",
      apiUrl: "http://localhost:11434",
      category: 'localProviders'
    },
    {
      id: 9,
      logo: "https://openrouter.ai/favicon.ico",
      name: "OpenRouter",
      apiUrl: "https://openrouter.ai/api/v1",
      category: 'cloudProviders'
    },
    {
      id: 10,
      logo: "https://huggingface.co/front/assets/huggingface_logo.svg",
      name: "HuggingFace",
      apiUrl: "https://api-inference.huggingface.co/models",
      category: 'cloudProviders'
    },
    {
      id: 11,
      logo: "https://github.com/grok-ai.png",
      name: "Grok",
      apiUrl: "https://api.grok.x.ai/v1",
      category: 'cloudProviders'
    },
    {
      id: 12,
      logo: "https://replicate.com/favicon.ico",
      name: "Replicate",
      apiUrl: "https://api.replicate.com/v1",
      category: 'cloudProviders'
    },
    {
      id: 13,
      logo: "https://github.com/perplexity-ai.png",
      name: "Perplexity",
      apiUrl: "https://api.perplexity.ai",
      category: 'cloudProviders'
    },
    {
      id: 14,
      logo: "https://d1.awsstatic.com/logos/aws-logo-lockups/poweredbyaws/PB_AWS_logo_RGB_REV_SQ.8c88ac215fe4e441cbd3b3be1d023927390ec2d5.png",
      name: "AWS Bedrock",
      apiUrl: "https://bedrock-runtime.us-east-1.amazonaws.com/v1",
      category: 'cloudProviders'
    },
    {
      id: 15,
      logo: "https://github.com/cloudflare.png",
      name: "Cloudflare AI",
      apiUrl: "https://gateway.ai.cloudflare.com/v1",
      category: 'cloudProviders'
    },
    {
      id: 16,
      logo: "https://docs.aimlapi.com/~gitbook/image?url=https%3A%2F%2F2584696304-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Forganizations%252FisNk5xPnJebTWJa4JCg5%252Fsites%252Fsite_AIphz%252Ficon%252F3vjfczmsHtaYTsiXVtck%252FLogotype%2520%282%29.png%3Falt%3Dmedia%26token%3D0e80ddab-9c08-4b49-8189-df24733c5e4a&width=32&dpr=2&quality=100&sign=80d75ef2&sv=2",
      name: "zai",
      apiUrl: "https://api.z.ai/api/coding/paas/v4",
      category: 'cloudProviders'
    }
  ];

  return providers;
}

// Export types for consumers
export type {
  Provider,
  SupportedProvider,
  ProviderConfig,
  ChatCompletionOptions,
  ChatCompletionResponse,
  ChatMessage,
  StreamChunk,
  StreamingOptions,
  ProviderCapabilities,
  LLMProviderWithStreaming,
  // Multimodal content types
  ContentPart,
  TextContentPart,
  ImageContentPart,
  FileContentPart,
  MessageContent,
  // Reasoning types
  ReasoningConfig,
  ReasoningContent,
  // Caching types
  CacheControl,
  CacheableContent,
  CacheableChatMessage,
  CachingOptions,
  EnhancedUsage,
  // Embedding types
  EmbeddingOptions,
  EmbeddingResponse,
  Embedding,
  // Image generation types
  ImageGenerationOptions,
  ImageGenerationResponse,
  GeneratedImage,
  // Reranking types
  RerankOptions,
  RerankResponse,
  RerankResult,
  // Transcription types (speech-to-text)
  TranscriptionOptions,
  TranscriptionResponse,
  TranscriptionWord,
  TranscriptionSegment,
  // Speech types (text-to-speech)
  SpeechOptions,
  SpeechResponse
} from './types';

// Export utilities
export { modelCache, CacheManager } from './utils/cacheManager';
export { LLMProviderError, ErrorCode, parseProviderError } from './utils/errors';
export { withRetry } from './utils/retry';

// Export UI message stream module
export * from './ui-stream';

// Export telemetry module
export * from './telemetry';

export default Multillm;