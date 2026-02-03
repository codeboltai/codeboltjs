/**
 * Telemetry Collector
 *
 * Collects and manages telemetry spans following OpenTelemetry conventions.
 */

import type {
  TelemetrySpan,
  TelemetryConfig,
  TelemetryExporter,
  GenAISpanAttributes,
  GenAIOperationName,
  GenAIProviderName,
  SpanStatus,
  SpanKind,
  SpanEvent,
  ResourceAttributes,
  SpanContext
} from './types';
import { DEFAULT_TELEMETRY_CONFIG } from './types';

/**
 * Generate a random hex ID
 */
function generateId(length: number): string {
  const bytes = new Uint8Array(length / 2);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generate a trace ID (32 hex chars / 16 bytes)
 */
function generateTraceId(): string {
  return generateId(32);
}

/**
 * Generate a span ID (16 hex chars / 8 bytes)
 */
function generateSpanId(): string {
  return generateId(16);
}

/**
 * Span builder for fluent API
 */
export class SpanBuilder {
  private span: TelemetrySpan;
  private collector: TelemetryCollector;

  constructor(
    collector: TelemetryCollector,
    name: string,
    operation: GenAIOperationName,
    provider: GenAIProviderName,
    parentContext?: SpanContext
  ) {
    this.collector = collector;
    this.span = {
      spanId: generateSpanId(),
      traceId: parentContext?.traceId || generateTraceId(),
      parentSpanId: parentContext?.spanId,
      name,
      kind: 'CLIENT',
      startTime: Date.now(),
      status: 'UNSET',
      attributes: {
        'gen_ai.operation.name': operation,
        'gen_ai.provider.name': provider
      },
      events: [],
      resource: collector.getResourceAttributes()
    };
  }

  /**
   * Set span kind
   */
  setKind(kind: SpanKind): SpanBuilder {
    this.span.kind = kind;
    return this;
  }

  /**
   * Set model
   */
  setModel(model: string): SpanBuilder {
    this.span.attributes['gen_ai.request.model'] = model;
    return this;
  }

  /**
   * Set request parameters
   */
  setRequestParams(params: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    topK?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    stopSequences?: string[];
  }): SpanBuilder {
    if (params.temperature !== undefined) {
      this.span.attributes['gen_ai.request.temperature'] = params.temperature;
    }
    if (params.maxTokens !== undefined) {
      this.span.attributes['gen_ai.request.max_tokens'] = params.maxTokens;
    }
    if (params.topP !== undefined) {
      this.span.attributes['gen_ai.request.top_p'] = params.topP;
    }
    if (params.topK !== undefined) {
      this.span.attributes['gen_ai.request.top_k'] = params.topK;
    }
    if (params.frequencyPenalty !== undefined) {
      this.span.attributes['gen_ai.request.frequency_penalty'] = params.frequencyPenalty;
    }
    if (params.presencePenalty !== undefined) {
      this.span.attributes['gen_ai.request.presence_penalty'] = params.presencePenalty;
    }
    if (params.stopSequences !== undefined) {
      this.span.attributes['gen_ai.request.stop_sequences'] = params.stopSequences;
    }
    return this;
  }

  /**
   * Set usage metrics
   */
  setUsage(usage: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
    cachedTokens?: number;
    cacheCreationTokens?: number;
    reasoningTokens?: number;
  }): SpanBuilder {
    if (usage.inputTokens !== undefined) {
      this.span.attributes['gen_ai.usage.input_tokens'] = usage.inputTokens;
    }
    if (usage.outputTokens !== undefined) {
      this.span.attributes['gen_ai.usage.output_tokens'] = usage.outputTokens;
    }
    if (usage.totalTokens !== undefined) {
      this.span.attributes['gen_ai.usage.total_tokens'] = usage.totalTokens;
    }
    if (usage.cachedTokens !== undefined) {
      this.span.attributes['gen_ai.usage.cached_tokens'] = usage.cachedTokens;
    }
    if (usage.cacheCreationTokens !== undefined) {
      this.span.attributes['gen_ai.usage.cache_creation_tokens'] = usage.cacheCreationTokens;
    }
    if (usage.reasoningTokens !== undefined) {
      this.span.attributes['gen_ai.usage.reasoning_tokens'] = usage.reasoningTokens;
    }
    return this;
  }

  /**
   * Set response attributes
   */
  setResponse(response: {
    model?: string;
    id?: string;
    finishReasons?: string[];
  }): SpanBuilder {
    if (response.model) {
      this.span.attributes['gen_ai.response.model'] = response.model;
    }
    if (response.id) {
      this.span.attributes['gen_ai.response.id'] = response.id;
    }
    if (response.finishReasons) {
      this.span.attributes['gen_ai.response.finish_reasons'] = response.finishReasons as any;
    }
    return this;
  }

  /**
   * Set input content (if recording enabled)
   */
  setInput(input: string): SpanBuilder {
    if (this.collector.getConfig().recordInputs) {
      this.span.attributes['gen_ai.prompt'] = input;
    }
    return this;
  }

  /**
   * Set output content (if recording enabled)
   */
  setOutput(output: string): SpanBuilder {
    if (this.collector.getConfig().recordOutputs) {
      this.span.attributes['gen_ai.completion'] = output;
    }
    return this;
  }

  /**
   * Set tool call attributes
   */
  setToolCall(toolCall: {
    name: string;
    callId: string;
    arguments?: string;
    result?: string;
  }): SpanBuilder {
    this.span.attributes['gen_ai.tool.name'] = toolCall.name;
    this.span.attributes['gen_ai.tool.call.id'] = toolCall.callId;
    if (toolCall.arguments) {
      this.span.attributes['gen_ai.tool.call.arguments'] = toolCall.arguments;
    }
    if (toolCall.result) {
      this.span.attributes['gen_ai.tool.call.result'] = toolCall.result;
    }
    return this;
  }

  /**
   * Set custom attribute
   */
  setAttribute(key: string, value: unknown): SpanBuilder {
    this.span.attributes[key] = value;
    return this;
  }

  /**
   * Add an event
   */
  addEvent(name: string, attributes?: Record<string, unknown>): SpanBuilder {
    this.span.events.push({
      name,
      timestamp: Date.now(),
      attributes
    });
    return this;
  }

  /**
   * Set error status
   */
  setError(error: Error | string): SpanBuilder {
    this.span.status = 'ERROR';
    const errorMessage = error instanceof Error ? error.message : error;
    const errorType = error instanceof Error ? error.name : 'Error';
    this.span.statusMessage = errorMessage;
    this.span.attributes['error.type'] = errorType;
    this.span.attributes['error.message'] = errorMessage;
    return this;
  }

  /**
   * Mark span as successful
   */
  setSuccess(): SpanBuilder {
    this.span.status = 'OK';
    return this;
  }

  /**
   * End the span and record it
   */
  end(): TelemetrySpan {
    this.span.endTime = Date.now();
    this.span.duration = this.span.endTime - this.span.startTime;

    if (this.span.status === 'UNSET') {
      this.span.status = 'OK';
    }

    this.collector.recordSpan(this.span);
    return this.span;
  }

  /**
   * Get span context for child spans
   */
  getContext(): SpanContext {
    return {
      traceId: this.span.traceId,
      spanId: this.span.spanId
    };
  }

  /**
   * Get the raw span (before ending)
   */
  getSpan(): TelemetrySpan {
    return this.span;
  }
}

/**
 * Telemetry Collector
 *
 * Main class for collecting and exporting telemetry data.
 */
export class TelemetryCollector {
  private config: TelemetryConfig;
  private spans: TelemetrySpan[] = [];
  private exporters: TelemetryExporter[] = [];
  private resourceAttributes: ResourceAttributes;
  private batchSize: number = 100;
  private flushInterval: number = 30000; // 30 seconds
  private flushTimer?: ReturnType<typeof setInterval>;

  constructor(config: Partial<TelemetryConfig> = {}) {
    this.config = { ...DEFAULT_TELEMETRY_CONFIG, ...config };
    this.resourceAttributes = {
      'service.name': this.config.serviceName || 'multillm',
      'service.version': this.config.serviceVersion || '1.0.0',
      'telemetry.sdk.name': 'multillm-telemetry',
      'telemetry.sdk.version': '1.0.0',
      'telemetry.sdk.language': 'javascript'
    };

    // Start periodic flush if enabled
    if (this.config.isEnabled) {
      this.startPeriodicFlush();
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): TelemetryConfig {
    return this.config;
  }

  /**
   * Update configuration
   */
  setConfig(config: Partial<TelemetryConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get resource attributes
   */
  getResourceAttributes(): ResourceAttributes {
    return this.resourceAttributes;
  }

  /**
   * Set resource attributes
   */
  setResourceAttributes(attributes: ResourceAttributes): void {
    this.resourceAttributes = { ...this.resourceAttributes, ...attributes };
  }

  /**
   * Check if telemetry is enabled
   */
  isEnabled(): boolean {
    return this.config.isEnabled;
  }

  /**
   * Add an exporter
   */
  addExporter(exporter: TelemetryExporter): void {
    this.exporters.push(exporter);
  }

  /**
   * Remove an exporter
   */
  removeExporter(exporter: TelemetryExporter): void {
    const index = this.exporters.indexOf(exporter);
    if (index !== -1) {
      this.exporters.splice(index, 1);
    }
  }

  /**
   * Create a new span builder
   */
  startSpan(
    operation: GenAIOperationName,
    provider: GenAIProviderName,
    model?: string,
    parentContext?: SpanContext
  ): SpanBuilder {
    const name = model ? `${operation} ${model}` : operation;
    const builder = new SpanBuilder(this, name, operation, provider, parentContext);

    if (model) {
      builder.setModel(model);
    }

    // Add custom metadata from config
    if (this.config.metadata) {
      for (const [key, value] of Object.entries(this.config.metadata)) {
        builder.setAttribute(key, value);
      }
    }

    if (this.config.functionId) {
      builder.setAttribute('gen_ai.function.id', this.config.functionId);
    }

    return builder;
  }

  /**
   * Record a completed span
   */
  recordSpan(span: TelemetrySpan): void {
    if (!this.config.isEnabled) {
      return;
    }

    this.spans.push(span);

    // Auto-flush if batch size reached
    if (this.spans.length >= this.batchSize) {
      this.flush().catch(console.error);
    }
  }

  /**
   * Flush spans to exporters
   */
  async flush(): Promise<void> {
    if (this.spans.length === 0) {
      return;
    }

    const spansToExport = [...this.spans];
    this.spans = [];

    await Promise.all(
      this.exporters.map(exporter =>
        exporter.export(spansToExport).catch(err => {
          console.error('Telemetry export error:', err);
        })
      )
    );
  }

  /**
   * Start periodic flush timer
   */
  private startPeriodicFlush(): void {
    if (this.flushTimer) {
      return;
    }
    this.flushTimer = setInterval(() => {
      this.flush().catch(console.error);
    }, this.flushInterval);
  }

  /**
   * Stop periodic flush timer
   */
  private stopPeriodicFlush(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }
  }

  /**
   * Shutdown the collector
   */
  async shutdown(): Promise<void> {
    this.stopPeriodicFlush();
    await this.flush();
    await Promise.all(this.exporters.map(e => e.shutdown()));
  }

  /**
   * Get all recorded spans (for testing/debugging)
   */
  getSpans(): TelemetrySpan[] {
    return [...this.spans];
  }

  /**
   * Clear all recorded spans
   */
  clearSpans(): void {
    this.spans = [];
  }
}

/**
 * Global telemetry collector instance
 */
let globalCollector: TelemetryCollector | null = null;

/**
 * Get or create the global telemetry collector
 */
export function getGlobalTelemetryCollector(config?: Partial<TelemetryConfig>): TelemetryCollector {
  if (!globalCollector) {
    globalCollector = new TelemetryCollector(config);
  } else if (config) {
    globalCollector.setConfig(config);
  }
  return globalCollector;
}

/**
 * Set the global telemetry collector
 */
export function setGlobalTelemetryCollector(collector: TelemetryCollector): void {
  globalCollector = collector;
}
