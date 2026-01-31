/**
 * Common TypeScript types and interfaces shared across the codeboltjs library
 *
 * This file contains:
 * - Shared data structures
 * - Common enums
 * - Utility types
 * - Application state types
 * - Git-related types
 * - Vector database types
 * - General purpose interfaces
 */

// ================================
// Application State Types
// ================================

export interface ApplicationState {
  currentProject?: string;
  workingDirectory?: string;
  openFiles?: string[];
  recentProjects?: string[];
  userPreferences?: Record<string, any>;
  sessionData?: Record<string, any>;
}

// Note: Git types (GitFileStatus, GitStatusData, GitCommitSummary, GitDiffResult) are exported from baseappResponse.ts
// Note: AgentDetail is exported from baseappResponse.ts

// ================================
// Agent Function Types (not in baseappResponse)
// ================================

export interface AgentFunction {
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

// ================================
// Task Types
// ================================

export interface SubTask {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    requirements?: string[];
}

export interface Task {
    id: string;
    title: string;
  description?: string;
    phase?: string;
    category?: string;
    agentId: string;
    subtasks: SubTask[];
    completed: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    priority?: 'low' | 'medium' | 'high';
    tags?: string[];
}

export interface TaskResponse {
    success: boolean;
    data?: Task | Task[] | SubTask | string[] | string;
    message?: string;
    error?: string;
    agentId?: string;
    count?: number;
}

// ================================
// Vector Database Types
// ================================

export interface VectorItem {
  id: string;
  vector: number[];
  metadata: Record<string, any>;
  content?: string;
}

export interface VectorQueryResult {
  items: VectorItem[];
  scores?: number[];
  distances?: number[];
}

// ================================
// File System UI State Types
// ================================

export interface FileStateInfo {
  type: 'file' | 'folder' | 'search' | 'fileSearch' | 'mcp';
  path?: string;
  content?: string | string[];
  query?: string;
  stateEvent: 'ASK_FOR_CONFIRMATION' | 'FILE_READ' | 'FILE_READ_ERROR' | 'REJECTED' | 'SEARCHING' |
              'ASK_FOR_CONFIRMATION' | 'APPLYING_EDIT' | 'EDIT_STARTING' | 'FILE_WRITE' | 'FILE_WRITE_ERROR';
  originalContent?: string;
  results?: any[];
  includePattern?: string;
  excludePattern?: string;
  caseSensitive?: boolean;
  toolName?: string;
  serverName?: string;
  params?: any;
}

// ================================
// Log Types
// ================================

export enum LogType {
  /** Informational messages */
  info = "info",
  /** Error messages */
  error = "error",
  /** Warning messages */
  warning = "warning"
}

// ================================
// Pending Request Types (for WebSocket)
// ================================

export interface PendingRequest {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  messageTypes: string[];
  requestId?: string;
}

export interface MessageRoute {
  messageTypes: string[];
  handler: (message: any) => void;
}

// ================================
// Service Response Type Mapping
// ================================

export interface ServiceResponseTypeMap {
  filesystem: any; // Will be defined in socketMessageTypes
  fsService: any; // Will be defined in socketMessageTypes
  browser: any; // Will be defined in socketMessageTypes
  terminal: any; // Will be defined in socketMessageTypes
  git: any; // Will be defined in socketMessageTypes
  memory: any; // Will be defined in socketMessageTypes
  tasks: any; // Will be defined in socketMessageTypes
  vectordb: any; // Will be defined in socketMessageTypes
  debug: any; // Will be defined in socketMessageTypes
  codeutils: any; // Will be defined in socketMessageTypes
  agents: any; // Will be defined in socketMessageTypes
  state: any; // Will be defined in socketMessageTypes
  chat: any; // Will be defined in socketMessageTypes
  crawler: any; // Will be defined in socketMessageTypes
  mcp: any; // Will be defined in socketMessageTypes
  project: any; // Will be defined in socketMessageTypes
  notification: any; // Will be defined in socketMessageTypes
  problemMatcher: any; // Will be defined in socketMessageTypes
  jsTreeParser: any; // Will be defined in socketMessageTypes
}

// ================================
// Helper Types
// ================================

export type SuccessResponse<T = any> = { success: true; data?: T };
export type FailureResponse = { success: false; error: string };

export type WebSocketMessageHandler<T = any> = (response: T) => void | Promise<void>;

export type ServiceWebSocketHandler<K extends keyof ServiceResponseTypeMap> = WebSocketMessageHandler<
  ServiceResponseTypeMap[K]
>;

// ================================
// Utility Types
// ================================

/**
 * Makes all properties of T optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Makes all properties of T required recursively
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Extract keys from T that have values assignable to U
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/**
 * Make specific properties optional
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific properties required
 */
export type RequiredFields<T, K extends keyof T> = T & {
  [P in K]-?: T[P];
};

// ================================
// Event Emitter Types
// ================================

export interface EventMap {
  [key: string]: (...args: any[]) => void;
}

export interface TypedEventEmitter<T extends EventMap> {
  on<K extends keyof T>(event: K, listener: T[K]): this;
  off<K extends keyof T>(event: K, listener: T[K]): this;
  emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>): boolean;
  removeAllListeners<K extends keyof T>(event?: K): this;
}

// ================================
// Configuration Types
// ================================

export interface Config {
  websocket?: {
    url?: string;
    timeout?: number;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
  };
  logging?: {
    level?: 'debug' | 'info' | 'warn' | 'error';
    enabled?: boolean;
  };
  [key: string]: any;
}

// ================================
// Error Types
// ================================

export interface CodeboltErrorInterface extends Error {
  code?: string;
  details?: any;
  timestamp?: string;
}

export class CodeboltError extends Error implements CodeboltErrorInterface {
  public timestamp: string;

  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'CodeboltError';
    this.timestamp = new Date().toISOString();
  }
}

// ================================
// File System Types
// ================================

export interface FileEntry {
  name: string;
  isDirectory: boolean;
  size?: number;
  modified?: string;
  created?: string;
  permissions?: string;
}

export interface SearchMatch {
  line: number;
  content: string;
  lineNumber: number;
}

export interface SearchResult {
  path: string;
  matches: SearchMatch[];
}

// ================================
// Browser Types (Additional)
// ================================

export interface BrowserElement {
  id: string;
  tag: string;
  text: string;
  attributes: Record<string, string>;
}

// ================================
// Code Analysis Types
// ================================

export interface CodeIssue {
  type: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  file: string;
  line: number;
  column?: number;
}

export interface CodeAnalysis {
  complexity: number;
  maintainability: number;
  issues: CodeIssue[];
}

export interface CodeMatcher {
  name: string;
  description: string;
  language: string;
  pattern: string;
  examples?: string[];
}

// ================================
// MCP Tool Types
// ================================

export interface MCPTool {
  /** Name of the MCP */
  name?: string;
  /** Toolbox name */
  toolbox?: string;
  /** Tool name */
  toolName?: string;
  /** Available tools */
  tools?: any[];
  /** Description */
  description?: string;
  /** Parameters */
  parameters?: Record<string, any>;
}

export interface MCPServer {
  name: string;
  enabled: boolean;
  tools: MCPTool[];
  configuration?: Record<string, any>;
}

// ================================
// Agent Types
// ================================

/**
 * Interface for Agent structure
 */
export interface Agent {
  /** Agent name */
  name?: string;
  /** Agent ID */
  id?: string | number;
  /** Agent description */
  description?: string;
  /** Agent title */
  title?: string;
  /** Agent identifier string */
  agent_id?: string;
  /** Unique identifier for the agent */
  unique_id?: string;
  /** Detailed description of the agent and its capabilities */
  longDescription?: string;
}

// ================================
// User Message Types
// ================================

/**
 * Interface for initial user message structure
 */
export interface InitialUserMessage {
  /** The message text */
  messageText?: string;
  /** The actual text content of the user message */
  userMessage?: string;
  /** List of mentioned files */
  mentionedFiles?: string[];
  /** List of mentioned MCPs */
  mentionedMCPs?: MCPTool[];
  /** List of mentioned agents */
  mentionedAgents?: Agent[];
}

// ================================
// AST and Code Parsing Types
// ================================

/**
 * Type definition for an AST node.
 */
export interface ASTNode {
  type: string;
  text: string;
  startPosition: { row: number; column: number };
  endPosition: { row: number; column: number };
  children: ASTNode[];
}

// ================================
// Notification Types
// ================================

export interface Notification {
  id?: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  message: string;
  timestamp?: string;
  duration?: number;
}
