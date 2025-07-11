/**
 * TypeScript types for the public API functions exported by the codeboltjs library
 * 
 * This file contains types for:
 * - Public function parameters and return types
 * - API interfaces exposed to library users
 * - Configuration options for library functions
 * - User-facing data structures
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
  content: any[] | string;
  /** Optional ID for tool calls */
  tool_call_id?: string;
  /** Optional tool calls for assistant messages */
  tool_calls?: ToolCall[];
  /** Additional properties that might be present */
  [key: string]: any;
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
    parameters?: any;
  };
}

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
      properties: Record<string, {
        type: string;
        description: string;
      }>;
      required?: string[];
      additionalProperties?: boolean;
    };
    strict?: boolean;
  };
}

/**
 * Conversation history entry for agent interactions
 */
export interface ConversationEntry {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | Array<{ type: string; text: string }>;
  tool_call_id?: string;
  tool_calls?: any[];
}

/**
 * Result from a tool execution
 */
export interface ToolResult {
  /** Always 'tool' for tool execution results */
  role: 'tool';
  /** ID that links this result to the original tool call */
  tool_call_id: string;
  /** The content returned by the tool */
  content: any;
  /** Optional user message to be added after tool execution */
  userMessage?: any;
}

/**
 * Details about a tool to be executed
 */
export interface ToolDetails {
  /** The name of the tool to execute */
  toolName: string;
  /** Input parameters for the tool */
  toolInput: any;
  /** Unique ID for this tool use instance */
  toolUseId: string;
}

/**
 * Content block within a user message
 */
export interface UserMessageContent {
  /** Type of content (e.g., "text", "image") */
  type: string;
  /** The text content */
  text: string;
}

/**
 * User message received from the Codebolt platform
 * This is a simplified, user-friendly version of the internal message format
 */
export interface UserMessage {
  /** The user's message content */
  userMessage: string;
  /** Current file being worked on */
  currentFile: string;
  /** Files mentioned in the message */
  mentionedFiles: string[];
  /** Full file paths mentioned */
  mentionedFullPaths: string[];
  /** Folders mentioned */
  mentionedFolders: string[];
  /** Images uploaded with the message */
  uploadedImages: string[];
  /** Selected agent information */
  selectedAgent: {
    id: string;
    name: string;
  };
  /** Unique message identifier */
  messageId: string;
  /** Thread identifier */
  threadId: string;
  /** Any text selection in the editor */
  selection?: any;
}

/**
 * Interface for codebolt API functionality
 */
export interface CodeboltAPI {
  mcp: {
    listMcpFromServers: (servers: string[]) => Promise<{ data: OpenAITool[] }>;
    getTools: (mcps: any[]) => Promise<{ data: OpenAITool[] }>;
  };
  fs: {
    readFile: (filepath: string) => Promise<string>;
    listFile: (path: string, recursive: boolean) => Promise<{ success: boolean; result: string }>;
  };
  project: {
    getProjectPath: () => Promise<{ projectPath: string }>;
  };
}

// ================================
// File System API Types
// ================================

export interface ReadFileOptions {
  /** File path to read */
  path: string;
  /** Text encoding (default: utf8) */
  encoding?: string;
  /** Whether to ask for permission before reading */
  askForPermission?: boolean;
}

export interface WriteFileOptions {
  /** File path to write to */
  path: string;
  /** Content to write */
  content: string;
  /** Text encoding (default: utf8) */
  encoding?: string;
  /** Whether to ask for permission before writing */
  askForPermission?: boolean;
}

export interface ListFilesOptions {
  /** Directory path to list */
  path: string;
  /** Whether to list files recursively */
  recursive?: boolean;
}

export interface SearchFilesOptions {
  /** Search query/pattern */
  query: string;
  /** Directory to search in */
  path?: string;
  /** File pattern to include (glob) */
  filePattern?: string;
  /** Whether search is case sensitive */
  caseSensitive?: boolean;
}

export interface GrepSearchOptions {
  /** Search pattern */
  query: string;
  /** Directory to search in */
  path?: string;
  /** Include pattern (glob) */
  includePattern?: string;
  /** Exclude pattern (glob) */
  excludePattern?: string;
  /** Whether search is case sensitive */
  caseSensitive?: boolean;
}

// ================================
// Browser API Types
// ================================

export interface BrowserNavigationOptions {
  /** URL to navigate to */
  url: string;
  /** Wait for page load (default: true) */
  waitForLoad?: boolean;
  /** Timeout in milliseconds */
  timeout?: number;
}

export interface BrowserScreenshotOptions {
  /** Take full page screenshot */
  fullPage?: boolean;
  /** Image quality (0-100) */
  quality?: number;
  /** Image format */
  format?: 'png' | 'jpeg';
}

export interface BrowserElementSelector {
  /** CSS selector */
  selector: string;
  /** Whether to wait for element */
  waitFor?: boolean;
  /** Timeout for waiting */
  timeout?: number;
}

// ================================
// Terminal API Types
// ================================

export interface TerminalExecuteOptions {
  /** Command to execute */
  command: string;
  /** Working directory */
  cwd?: string;
  /** Environment variables */
  env?: Record<string, string>;
  /** Timeout in milliseconds */
  timeout?: number;
  /** Whether to run in background */
  background?: boolean;
}

// ================================
// Git API Types
// ================================

export interface GitCommitOptions {
  /** Commit message */
  message: string;
  /** Author name */
  author?: string;
  /** Author email */
  email?: string;
  /** Whether to add all files */
  addAll?: boolean;
}

export interface GitLogOptions {
  /** Number of commits to retrieve */
  maxCount?: number;
  /** Starting from commit hash */
  from?: string;
  /** Until commit hash */
  to?: string;
  /** File path to filter logs */
  path?: string;
}

// ================================
// LLM API Types
// ================================

export interface LLMChatOptions {
  /** Messages in the conversation */
  messages: Message[];
  /** Model to use */
  model?: string;
  /** Temperature (0-1) */
  temperature?: number;
  /** Maximum tokens to generate */
  maxTokens?: number;
  /** Whether to stream response */
  stream?: boolean;
  /** Available tools */
  tools?: Tool[];
  /** Tool choice strategy */
  toolChoice?: 'auto' | 'none' | 'required';
}

// ================================
// Vector Database API Types
// ================================

export interface VectorAddOptions {
  /** Unique identifier */
  id: string;
  /** Vector data */
  vector: number[];
  /** Associated metadata */
  metadata?: Record<string, any>;
  /** Text content */
  content?: string;
}

export interface VectorQueryOptions {
  /** Query vector */
  vector: number[];
  /** Number of results to return */
  topK?: number;
  /** Metadata filters */
  filter?: Record<string, any>;
  /** Minimum similarity score */
  minScore?: number;
}

// ================================
// Agent API Types
// ================================

export interface AgentMessageHandler {
  (userMessage: UserMessage): void | Promise<void> | any | Promise<any>;
}

export interface AgentConfiguration {
  /** Agent name */
  name?: string;
  /** Agent description */
  description?: string;
  /** Available tools */
  tools?: Tool[];
  /** System prompt */
  systemPrompt?: string;
}

// ================================
// Memory API Types
// ================================

export interface MemorySetOptions {
  /** Memory key */
  key: string;
  /** Memory value */
  value: any;
  /** Expiration time in seconds */
  ttl?: number;
}

export interface MemoryGetOptions {
  /** Memory key */
  key: string;
  /** Default value if key not found */
  defaultValue?: any;
}

// ================================
// Task API Types
// ================================

export interface TaskCreateOptions {
  /** Task title */
  title: string;
  /** Task description */
  description?: string;
  /** Task priority */
  priority?: 'low' | 'medium' | 'high';
  /** Due date */
  dueDate?: Date | string;
  /** Associated tags */
  tags?: string[];
}

export interface TaskUpdateOptions {
  /** Task ID */
  id: string;
  /** New title */
  title?: string;
  /** New description */
  description?: string;
  /** Completion status */
  completed?: boolean;
  /** New priority */
  priority?: 'low' | 'medium' | 'high';
}

// ================================
// Code Utils API Types
// ================================

export interface CodeAnalysisOptions {
  /** File or directory path */
  path: string;
  /** Language to analyze */
  language?: string;
  /** Analysis rules to apply */
  rules?: string[];
}

export interface CodeParseOptions {
  /** Code content or file path */
  input: string;
  /** Programming language */
  language: string;
  /** Whether input is file path */
  isFilePath?: boolean;
}

// ================================
// Debug API Types
// ================================

export interface DebugLogOptions {
  /** Log message */
  message: string;
  /** Log level */
  level?: 'debug' | 'info' | 'warn' | 'error';
  /** Additional metadata */
  metadata?: Record<string, any>;
  /** Component name */
  component?: string;
}

// ================================
// Project API Types
// ================================

export interface ProjectInfo {
  /** Project name */
  name: string;
  /** Project path */
  path: string;
  /** Project type */
  type?: string;
  /** Project configuration */
  config?: Record<string, any>;
}

// ================================
// Crawler API Types
// ================================

export interface CrawlerOptions {
  /** URL to crawl */
  url: string;
  /** Maximum depth */
  maxDepth?: number;
  /** Follow external links */
  followExternal?: boolean;
  /** Custom headers */
  headers?: Record<string, string>;
  /** Request timeout */
  timeout?: number;
}

// ================================
// MCP Tools API Types
// ================================

export interface MCPExecuteOptions {
  /** Tool name */
  toolName: string;
  /** Server name */
  serverName?: string;
  /** Tool parameters */
  params?: Record<string, any>;
  /** Request timeout */
  timeout?: number;
}

export interface MCPConfigureOptions {
  /** Server name */
  serverName: string;
  /** Configuration data */
  config: Record<string, any>;
  /** Whether to enable the server */
  enabled?: boolean;
}

// ================================
// State Management API Types
// ================================

export interface StateUpdateOptions {
  /** State key */
  key: string;
  /** State value */
  value: any;
  /** Whether to merge with existing state */
  merge?: boolean;
}

// ================================
// Chat API Types
// ================================

export interface ChatSendOptions {
  /** Message content */
  message: string;
  /** Conversation ID */
  conversationId?: string;
  /** Message metadata */
  metadata?: Record<string, any>;
  /** Mentioned files */
  mentionedFiles?: string[];
  /** Mentioned agents */
  mentionedAgents?: string[];
}

export interface ChatHistoryOptions {
  /** Conversation ID */
  conversationId?: string;
  /** Maximum number of messages */
  limit?: number;
  /** Starting from message ID */
  from?: string;
  /** Include system messages */
  includeSystem?: boolean;
}

// ================================
// Notification API Types
// ================================

export interface NotificationOptions {
  /** Notification message */
  message: string;
  /** Notification type */
  type?: 'info' | 'warning' | 'error' | 'success';
  /** Notification title */
  title?: string;
  /** Display duration in milliseconds */
  duration?: number;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

// ================================
// Utility Types for API
// ================================

/**
 * Standard API response wrapper
 */
export interface APIResponse<T = any> {
  /** Whether the operation was successful */
  success: boolean;
  /** Response data */
  data?: T;
  /** Error message if unsuccessful */
  error?: string;
  /** Error code if unsuccessful */
  code?: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Pagination options for list operations
 */
export interface PaginationOptions {
  /** Page number (1-based) */
  page?: number;
  /** Number of items per page */
  pageSize?: number;
  /** Sort field */
  sortBy?: string;
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Filtering options for list operations
 */
export interface FilterOptions {
  /** Search query */
  query?: string;
  /** Field filters */
  filters?: Record<string, any>;
  /** Date range */
  dateRange?: {
    from?: Date | string;
    to?: Date | string;
  };
}

/**
 * Common options for async operations
 */
export interface AsyncOperationOptions {
  /** Operation timeout in milliseconds */
  timeout?: number;
  /** Retry configuration */
  retry?: {
    attempts?: number;
    delay?: number;
  };
  /** Progress callback */
  onProgress?: (progress: number) => void;
  /** Cancellation signal */
  signal?: AbortSignal;
}

// ================================
// Event Types for API
// ================================

export interface APIEventMap {
  connected: () => void;
  disconnected: () => void;
  error: (error: Error) => void;
  message: (message: any) => void;
  progress: (progress: number) => void;
}

// ================================
// Configuration Types for Library
// ================================

export interface CodeboltConfig {
  /** WebSocket configuration */
  websocket?: {
    url?: string;
    timeout?: number;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
    autoReconnect?: boolean;
  };
  /** Logging configuration */
  logging?: {
    level?: 'debug' | 'info' | 'warn' | 'error';
    enabled?: boolean;
    format?: 'json' | 'text';
  };
  /** Default timeouts for operations */
  timeouts?: {
    default?: number;
    llm?: number;
    browser?: number;
    terminal?: number;
    fileSystem?: number;
  };
  /** Feature flags */
  features?: {
    autoRetry?: boolean;
    caching?: boolean;
    compression?: boolean;
  };
}

// ================================
// Callback Types
// ================================

export type ProgressCallback = (progress: number, message?: string) => void;
export type ErrorCallback = (error: Error) => void;
export type SuccessCallback<T = any> = (result: T) => void;
export type CompletionCallback<T = any> = (error: Error | null, result?: T) => void;
