/**
 * Library types for the Unified Agent Framework
 * Self-contained within the unified directory
 */

// ================================
// Message Types for Library API
// ================================

/**
 * Represents a message in the conversation with roles and content.
 */
export interface Message {
  /** The role of the message sender: user, assistant, tool, or system */
  role: 'user' | 'assistant' | 'tool' | 'system';
  /** The content of the message, can be an array of content blocks or a string */
  content: unknown[] | string;
  /** Optional ID for tool calls */
  tool_call_id?: string;
  /** Optional tool calls for assistant messages */
  tool_calls?: ToolCall[];
  /** Additional properties that might be present */
  [key: string]: unknown;
}

/**
 * Represents a tool call in OpenAI format
 */
export interface ToolCall {
  /** Unique identifier for this tool call */
  id: string;
  /** The type of tool call */
  type: 'function';
  /** Function call details */
  function: {
    /** Name of the function to call */
    name: string;
    /** Arguments for the function call as JSON string */
    arguments: string;
  };
}

/**
 * Represents a tool definition in OpenAI format
 */
export interface Tool {
  /** The type of tool */
  type: 'function';
  /** Function definition */
  function: {
    /** Name of the function */
    name: string;
    /** Description of what the function does */
    description?: string;
    /** JSON schema for the function parameters */
    parameters?: unknown;
  };
}

// ================================
// OpenAI Compatible Types
// ================================

/**
 * OpenAI-compatible message format for conversations
 */
export interface OpenAIMessage {
  /** Role of the message sender */
  role: 'system' | 'user' | 'assistant' | 'tool';
  /** Content of the message */
  content: string | Array<{ type: string; text: string }>;
  /** Tool call ID for tool messages */
  tool_call_id?: string;
  /** Tool calls for assistant messages */
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
  /** Name for tool messages */
  name?: string;
}

/**
 * OpenAI-compatible tool format
 */
export interface OpenAITool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, unknown>;
      required?: string[];
      additionalProperties?: boolean;
    };
  };
}

/**
 * Tool result from execution
 */
export interface ToolResult {
  /** Tool call ID that this result corresponds to */
  toolCallId: string;
  /** Name of the tool that was executed */
  toolName: string;
  /** Result of the tool execution */
  result: string;
  /** Whether the tool execution was successful */
  success: boolean;
  /** Error message if execution failed */
  error?: string;
  /** Execution metadata */
  metadata?: Record<string, unknown>;
}

// ================================
// LLM Types
// ================================

/**
 * LLM inference request parameters
 */
export interface LLMInferenceParams {
  /** Array of messages in the conversation */
  messages: Message[];
  /** Available tools for the model to use */
  tools?: Tool[];
  /** How the model should use tools */
  tool_choice?: 'auto' | 'none' | 'required' | { type: 'function'; function: { name: string } };
  /** The LLM role to determine which model to use */
  llmrole: string;
  /** Maximum number of tokens to generate */
  max_tokens?: number;
  /** Temperature for response generation */
  temperature?: number;
  /** Whether to stream the response */
  stream?: boolean;
}

/**
 * LLM response from inference
 */
export interface LLMResponse {
  /** Generated content */
  content?: string;
  /** Tool calls if any */
  tool_calls?: ToolCall[];
  /** Finish reason */
  finish_reason?: 'stop' | 'length' | 'tool_calls' | 'content_filter';
  /** Usage statistics */
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

// ================================
// CodeBolt API Types
// ================================

/**
 * CodeBolt API interface for agent operations
 */
export interface CodeboltAPI {
  /** Chat operations */
  chat: {
    /** Send a message to the user */
    sendMessage(message: string): Promise<void>;
    /** Get conversation history */
    getHistory(): Promise<OpenAIMessage[]>;
    /** Clear conversation history */
    clearHistory(): Promise<void>;
    /** Summarize conversation */
    summarizeConversation(messages: OpenAIMessage[], options?: {
      maxLength?: number;
      includeToolCalls?: boolean;
    }): Promise<string>;
  };

  /** LLM operations */
  llm: {
    /** Generate LLM response */
    inference(params: LLMInferenceParams): Promise<LLMResponse>;
    /** Stream LLM response */
    stream(params: LLMInferenceParams): AsyncIterable<LLMResponse>;
  };

  /** MCP (Micro-Component Platform) operations */
  mcp: {
    /** Execute an MCP tool */
    executeTool(toolName: string, params: unknown): Promise<{ data: unknown }>;
    /** List available MCP tools */
    listTools(): Promise<string[]>;
    /** Get tool schema */
    getToolSchema(toolName: string): Promise<OpenAITool>;
  };

  /** File system operations */
  fs: {
    /** Read file content */
    readFile(path: string): Promise<string>;
    /** Write file content */
    writeFile(path: string, content: string): Promise<void>;
    /** List directory contents */
    listDir(path: string): Promise<string[]>;
    /** Check if file exists */
    exists(path: string): Promise<boolean>;
  };

  /** Agent operations */
  agent?: {
    /** Start a sub-agent */
    startAgent(agentName: string, params: unknown): Promise<{ data: unknown }>;
    /** List available agents */
    listAgents(): Promise<string[]>;
  };
}

// ================================
// Configuration Types
// ================================

/**
 * LLM configuration
 */
export interface LLMConfig {
  /** LLM name/role identifier */
  llmname?: string;
  /** Model name */
  model?: string;
  /** Temperature for generation */
  temperature?: number;
  /** Maximum tokens */
  maxTokens?: number;
  /** API key */
  apiKey?: string;
  /** Base URL for API */
  baseUrl?: string;
  /** Additional configuration */
  [key: string]: unknown;
}

/**
 * Agent execution context
 */
export interface ExecutionContext {
  /** Session identifier */
  sessionId?: string;
  /** User identifier */
  userId?: string;
  /** Conversation identifier */
  conversationId?: string;
  /** Request identifier */
  requestId?: string;
  /** Execution start time */
  startTime: string;
  /** Additional metadata */
  metadata: Record<string, unknown>;
}

/**
 * Agent execution result
 */
export interface AgentExecutionResult {
  /** Whether execution completed successfully */
  success: boolean;
  /** Final response message */
  response: string;
  /** Complete conversation history */
  conversationHistory: OpenAIMessage[];
  /** Tool execution results */
  toolResults: ToolResult[];
  /** Number of iterations performed */
  iterations: number;
  /** Whether the agent completed its task */
  completed: boolean;
  /** Execution context */
  context: Record<string, unknown>;
  /** Error message if execution failed */
  error?: string;
  /** Execution metadata */
  metadata?: Record<string, unknown>;
}

// ================================
// Event Types
// ================================

/**
 * Agent event types
 */
export type AgentEventType = 
  | 'AgentStarted'
  | 'AgentCompleted'
  | 'AgentError'
  | 'MessageProcessed'
  | 'ToolExecuted'
  | 'ConversationUpdated'
  | 'IterationCompleted';

/**
 * Agent event data
 */
export interface AgentEvent {
  type: AgentEventType;
  timestamp: string;
  data: Record<string, unknown>;
  error?: string;
}

/**
 * Event handler function
 */
export type AgentEventHandler = (event: AgentEvent) => void | Promise<void>;

// ================================
// Utility Types
// ================================

/**
 * Deep partial type for configuration objects
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Function that can be sync or async
 */
export type MaybeAsync<T> = T | Promise<T>;

/**
 * Callback function type
 */
export type Callback<T = unknown> = (data: T) => void | Promise<void>;

/**
 * Error with context information
 */
export interface ContextualError extends Error {
  context?: Record<string, unknown>;
  code?: string;
  statusCode?: number;
}

// ================================
// Validation Types
// ================================

/**
 * Validation result
 */
export interface ValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  /** Validation errors */
  errors: string[];
  /** Validation warnings */
  warnings: string[];
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Schema validation function
 */
export type SchemaValidator<T = unknown> = (data: unknown) => ValidationResult & { data?: T };

// ================================
// Streaming Types
// ================================

/**
 * Stream chunk for real-time responses
 */
export interface StreamChunk {
  /** Type of chunk */
  type: 'text' | 'tool_call' | 'tool_result' | 'error' | 'done';
  /** Chunk content */
  content: string;
  /** Tool call information if applicable */
  toolCall?: ToolCall;
  /** Tool result if applicable */
  toolResult?: ToolResult;
  /** Error information if applicable */
  error?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Stream callback function
 */
export type StreamCallback = (chunk: StreamChunk) => void | Promise<void>;

// ================================
// Memory and Storage Types
// ================================

/**
 * Memory storage interface
 */
export interface MemoryStorage {
  /** Store data */
  set(key: string, value: unknown): Promise<void>;
  /** Retrieve data */
  get(key: string): Promise<unknown>;
  /** Delete data */
  delete(key: string): Promise<void>;
  /** List all keys */
  keys(): Promise<string[]>;
  /** Clear all data */
  clear(): Promise<void>;
}

/**
 * Conversation memory entry
 */
export interface ConversationMemory {
  /** Conversation ID */
  id: string;
  /** Messages in the conversation */
  messages: OpenAIMessage[];
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
  /** Additional metadata */
  metadata: Record<string, unknown>;
}

// ================================
// Export all types
// ================================

export type {
  // Re-export for convenience
  Message as LibMessage,
  ToolCall as LibToolCall,
  Tool as LibTool,
  OpenAIMessage as LibOpenAIMessage,
  OpenAITool as LibOpenAITool,
  ToolResult as LibToolResult,
  LLMInferenceParams as LibLLMInferenceParams,
  LLMResponse as LibLLMResponse,
  CodeboltAPI as LibCodeboltAPI,
  LLMConfig as LibLLMConfig,
  ExecutionContext as LibExecutionContext,
  AgentExecutionResult as LibAgentExecutionResult,
  AgentEvent as LibAgentEvent,
  AgentEventHandler as LibAgentEventHandler,
  StreamChunk as LibStreamChunk,
  StreamCallback as LibStreamCallback,
  MemoryStorage as LibMemoryStorage,
  ConversationMemory as LibConversationMemory
};
