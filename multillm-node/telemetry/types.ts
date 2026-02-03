/**
 * Telemetry Types
 *
 * Types following OpenTelemetry GenAI Semantic Conventions
 * @see https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-spans/
 */

/**
 * OpenTelemetry GenAI Operation Names
 */
export type GenAIOperationName =
  | 'chat'
  | 'embeddings'
  | 'text_completion'
  | 'generate_content'
  | 'create_image'
  | 'rerank'
  | 'execute_tool'
  | 'transcription'
  | 'speech';

/**
 * OpenTelemetry GenAI Provider Names
 */
export type GenAIProviderName =
  | 'openai'
  | 'anthropic'
  | 'mistral_ai'
  | 'groq'
  | 'ollama'
  | 'deepseek'
  | 'gemini'
  | 'replicate'
  | 'codeboltai'
  | 'perplexity'
  | 'huggingface'
  | 'bedrock'
  | 'cloudflare'
  | 'openrouter'
  | 'grok'
  | 'lmstudio'
  | 'zai'
  | string;

/**
 * Finish reason values
 */
export type FinishReason =
  | 'stop'
  | 'length'
  | 'tool_calls'
  | 'content_filter'
  | 'error'
  | string;

/**
 * Span status
 */
export type SpanStatus = 'OK' | 'ERROR' | 'UNSET';

/**
 * Span kind
 */
export type SpanKind = 'CLIENT' | 'SERVER' | 'INTERNAL' | 'PRODUCER' | 'CONSUMER';

/**
 * OpenTelemetry GenAI Span Attributes
 * Following the semantic conventions
 */
export interface GenAISpanAttributes {
  // Required attributes
  'gen_ai.operation.name': GenAIOperationName;
  'gen_ai.provider.name': GenAIProviderName;

  // Request attributes
  'gen_ai.request.model'?: string;
  'gen_ai.request.temperature'?: number;
  'gen_ai.request.max_tokens'?: number;
  'gen_ai.request.top_p'?: number;
  'gen_ai.request.top_k'?: number;
  'gen_ai.request.frequency_penalty'?: number;
  'gen_ai.request.presence_penalty'?: number;
  'gen_ai.request.stop_sequences'?: string[];

  // Response attributes
  'gen_ai.response.model'?: string;
  'gen_ai.response.id'?: string;
  'gen_ai.response.finish_reasons'?: FinishReason[];

  // Usage attributes
  'gen_ai.usage.input_tokens'?: number;
  'gen_ai.usage.output_tokens'?: number;
  'gen_ai.usage.total_tokens'?: number;

  // Cache attributes (custom extension)
  'gen_ai.usage.cached_tokens'?: number;
  'gen_ai.usage.cache_creation_tokens'?: number;

  // Reasoning attributes (for reasoning models like o1, Claude extended thinking, DeepSeek reasoner)
  'gen_ai.usage.reasoning_tokens'?: number;

  // Content attributes (opt-in for privacy)
  'gen_ai.prompt'?: string;
  'gen_ai.completion'?: string;

  // Error attributes
  'error.type'?: string;
  'error.message'?: string;

  // Tool attributes
  'gen_ai.tool.name'?: string;
  'gen_ai.tool.call.id'?: string;
  'gen_ai.tool.call.arguments'?: string;
  'gen_ai.tool.call.result'?: string;

  // Custom attributes
  [key: string]: unknown;
}

/**
 * Span event
 */
export interface SpanEvent {
  name: string;
  timestamp: number;
  attributes?: Record<string, unknown>;
}

/**
 * Telemetry Span
 * Represents a single operation with timing and attributes
 */
export interface TelemetrySpan {
  /** Unique span identifier */
  spanId: string;
  /** Parent span ID (for nested operations) */
  parentSpanId?: string;
  /** Trace ID (groups related spans) */
  traceId: string;
  /** Span name following convention: {operation} {model} */
  name: string;
  /** Span kind */
  kind: SpanKind;
  /** Start timestamp in milliseconds */
  startTime: number;
  /** End timestamp in milliseconds */
  endTime?: number;
  /** Duration in milliseconds */
  duration?: number;
  /** Span status */
  status: SpanStatus;
  /** Status message (for errors) */
  statusMessage?: string;
  /** Span attributes */
  attributes: GenAISpanAttributes;
  /** Span events */
  events: SpanEvent[];
  /** Resource attributes (service info) */
  resource?: ResourceAttributes;
}

/**
 * Resource attributes (service/application info)
 */
export interface ResourceAttributes {
  'service.name'?: string;
  'service.version'?: string;
  'service.instance.id'?: string;
  'telemetry.sdk.name'?: string;
  'telemetry.sdk.version'?: string;
  'telemetry.sdk.language'?: string;
  [key: string]: unknown;
}

/**
 * Telemetry configuration options
 */
export interface TelemetryConfig {
  /** Enable/disable telemetry */
  isEnabled: boolean;
  /** Record input prompts (may contain sensitive data) */
  recordInputs?: boolean;
  /** Record output completions (may contain sensitive data) */
  recordOutputs?: boolean;
  /** Function/operation identifier for grouping */
  functionId?: string;
  /** Custom metadata to attach to spans */
  metadata?: Record<string, unknown>;
  /** Service name for resource attributes */
  serviceName?: string;
  /** Service version */
  serviceVersion?: string;
}

/**
 * Telemetry export format (OTLP-compatible)
 */
export interface TelemetryExportData {
  resourceSpans: Array<{
    resource: {
      attributes: Array<{ key: string; value: { stringValue?: string; intValue?: number; boolValue?: boolean } }>;
    };
    scopeSpans: Array<{
      scope: {
        name: string;
        version?: string;
      };
      spans: Array<{
        traceId: string;
        spanId: string;
        parentSpanId?: string;
        name: string;
        kind: number; // SpanKind as number
        startTimeUnixNano: string;
        endTimeUnixNano: string;
        attributes: Array<{ key: string; value: { stringValue?: string; intValue?: number; boolValue?: boolean; doubleValue?: number } }>;
        status: { code: number; message?: string };
        events: Array<{
          timeUnixNano: string;
          name: string;
          attributes?: Array<{ key: string; value: { stringValue?: string } }>;
        }>;
      }>;
    }>;
  }>;
}

/**
 * Simple log format for local file storage
 */
export interface TelemetryLogEntry {
  /** ISO timestamp */
  timestamp: string;
  /** Trace ID */
  traceId: string;
  /** Span ID */
  spanId: string;
  /** Parent span ID */
  parentSpanId?: string;
  /** Operation name */
  operation: GenAIOperationName;
  /** Provider name */
  provider: GenAIProviderName;
  /** Model name */
  model?: string;
  /** Duration in ms */
  durationMs?: number;
  /** Status */
  status: SpanStatus;
  /** Token usage */
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
    cachedTokens?: number;
  };
  /** Finish reason */
  finishReason?: string;
  /** Error info */
  error?: {
    type: string;
    message: string;
  };
  /** Custom metadata */
  metadata?: Record<string, unknown>;
  /** Input (if recording enabled) */
  input?: string;
  /** Output (if recording enabled) */
  output?: string;
}

/**
 * Telemetry exporter interface
 */
export interface TelemetryExporter {
  /** Export spans */
  export(spans: TelemetrySpan[]): Promise<void>;
  /** Flush any buffered data */
  flush(): Promise<void>;
  /** Shutdown the exporter */
  shutdown(): Promise<void>;
}

/**
 * Span context for propagation
 */
export interface SpanContext {
  traceId: string;
  spanId: string;
  traceFlags?: number;
}

/**
 * Default telemetry configuration
 */
export const DEFAULT_TELEMETRY_CONFIG: TelemetryConfig = {
  isEnabled: false,
  recordInputs: false,
  recordOutputs: false,
  serviceName: 'multillm',
  serviceVersion: '1.0.0'
};
