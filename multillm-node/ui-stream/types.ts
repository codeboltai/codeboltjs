/**
 * UI Message Stream Types
 *
 * Types for streaming AI responses to user interfaces in real-time.
 * Compatible with Server-Sent Events (SSE) and WebSocket transports.
 */

/**
 * Base chunk type with common properties
 */
interface BaseChunk {
  /** Unique identifier for the message */
  messageId?: string;
  /** Timestamp of the chunk */
  timestamp?: number;
}

/**
 * Text content chunks
 */
export interface TextStartChunk extends BaseChunk {
  type: 'text-start';
}

export interface TextDeltaChunk extends BaseChunk {
  type: 'text-delta';
  /** Incremental text content */
  content: string;
}

export interface TextEndChunk extends BaseChunk {
  type: 'text-end';
}

/**
 * Reasoning/thinking chunks (for models that expose reasoning)
 */
export interface ReasoningStartChunk extends BaseChunk {
  type: 'reasoning-start';
}

export interface ReasoningDeltaChunk extends BaseChunk {
  type: 'reasoning-delta';
  /** Incremental reasoning content */
  content: string;
}

export interface ReasoningEndChunk extends BaseChunk {
  type: 'reasoning-end';
}

/**
 * Tool/function calling chunks
 */
export interface ToolCallStartChunk extends BaseChunk {
  type: 'tool-call-start';
  /** Tool call identifier */
  toolCallId: string;
  /** Name of the tool being called */
  toolName: string;
}

export interface ToolCallDeltaChunk extends BaseChunk {
  type: 'tool-call-delta';
  /** Tool call identifier */
  toolCallId: string;
  /** Incremental arguments JSON */
  argsTextDelta: string;
}

export interface ToolCallEndChunk extends BaseChunk {
  type: 'tool-call-end';
  /** Tool call identifier */
  toolCallId: string;
  /** Complete parsed arguments */
  args: Record<string, unknown>;
}

export interface ToolResultChunk extends BaseChunk {
  type: 'tool-result';
  /** Tool call identifier */
  toolCallId: string;
  /** Tool execution result */
  result: unknown;
  /** Whether the tool execution was successful */
  isError?: boolean;
}

/**
 * Message lifecycle chunks
 */
export interface MessageStartChunk extends BaseChunk {
  type: 'message-start';
  /** Message identifier */
  messageId: string;
  /** Model being used */
  model?: string;
}

export interface MessageEndChunk extends BaseChunk {
  type: 'message-end';
  /** Message identifier */
  messageId: string;
  /** Finish reason */
  finishReason?: 'stop' | 'length' | 'tool_calls' | 'content_filter' | 'error';
  /** Token usage information */
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Step chunks (for multi-step reasoning)
 */
export interface StepStartChunk extends BaseChunk {
  type: 'step-start';
  /** Step identifier */
  stepId: string;
  /** Step number (1-indexed) */
  stepNumber: number;
}

export interface StepEndChunk extends BaseChunk {
  type: 'step-end';
  /** Step identifier */
  stepId: string;
}

/**
 * Error chunk
 */
export interface ErrorChunk extends BaseChunk {
  type: 'error';
  /** Error message */
  error: string;
  /** Error code */
  code?: string;
}

/**
 * Custom data chunk for application-specific data
 */
export interface DataChunk<T = unknown> extends BaseChunk {
  type: 'data';
  /** Data key/name */
  key: string;
  /** Custom data payload */
  data: T;
}

/**
 * Source/citation chunks
 */
export interface SourceChunk extends BaseChunk {
  type: 'source';
  /** Source URL */
  url?: string;
  /** Source title */
  title?: string;
  /** Source content snippet */
  content?: string;
}

/**
 * File attachment chunk
 */
export interface FileChunk extends BaseChunk {
  type: 'file';
  /** File URL */
  url: string;
  /** MIME type */
  mimeType: string;
  /** File name */
  name?: string;
}

/**
 * Abort chunk (when stream is cancelled)
 */
export interface AbortChunk extends BaseChunk {
  type: 'abort';
  /** Reason for abort */
  reason?: string;
}

/**
 * Union type of all UI message chunks
 */
export type UIMessageChunk =
  | TextStartChunk
  | TextDeltaChunk
  | TextEndChunk
  | ReasoningStartChunk
  | ReasoningDeltaChunk
  | ReasoningEndChunk
  | ToolCallStartChunk
  | ToolCallDeltaChunk
  | ToolCallEndChunk
  | ToolResultChunk
  | MessageStartChunk
  | MessageEndChunk
  | StepStartChunk
  | StepEndChunk
  | ErrorChunk
  | DataChunk
  | SourceChunk
  | FileChunk
  | AbortChunk;

/**
 * Type guard functions
 */
export function isTextChunk(chunk: UIMessageChunk): chunk is TextStartChunk | TextDeltaChunk | TextEndChunk {
  return chunk.type === 'text-start' || chunk.type === 'text-delta' || chunk.type === 'text-end';
}

export function isToolCallChunk(chunk: UIMessageChunk): chunk is ToolCallStartChunk | ToolCallDeltaChunk | ToolCallEndChunk {
  return chunk.type === 'tool-call-start' || chunk.type === 'tool-call-delta' || chunk.type === 'tool-call-end';
}

export function isReasoningChunk(chunk: UIMessageChunk): chunk is ReasoningStartChunk | ReasoningDeltaChunk | ReasoningEndChunk {
  return chunk.type === 'reasoning-start' || chunk.type === 'reasoning-delta' || chunk.type === 'reasoning-end';
}

/**
 * Options for creating a UI message stream
 */
export interface UIMessageStreamOptions {
  /** Callback executed when stream starts */
  onStart?: () => void | Promise<void>;
  /** Callback executed when stream finishes */
  onFinish?: (result: UIStreamResult) => void | Promise<void>;
  /** Error handler - return string to send as error chunk */
  onError?: (error: unknown) => string;
  /** Generate unique IDs (default: uses crypto.randomUUID or Date.now) */
  generateId?: () => string;
  /** Initial message ID */
  messageId?: string;
}

/**
 * Result of a completed UI stream
 */
export interface UIStreamResult {
  /** Complete text content */
  text: string;
  /** All tool calls made */
  toolCalls: Array<{
    id: string;
    name: string;
    args: Record<string, unknown>;
    result?: unknown;
  }>;
  /** Token usage */
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  /** Finish reason */
  finishReason?: string;
  /** Total duration in milliseconds */
  durationMs: number;
}

/**
 * HTTP headers for UI message stream responses
 */
export const UI_STREAM_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache, no-transform',
  'Connection': 'keep-alive',
  'X-Accel-Buffering': 'no', // Disable nginx buffering
} as const;
