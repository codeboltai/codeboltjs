/**
 * Internal TypeScript types for the codeboltjs library implementation
 * 
 * This file contains types that are used internally by the library:
 * - Internal class structures
 * - Implementation-specific interfaces
 * - Private API types
 * - Module-specific types
 * - WebSocket management types
 */

import { EventEmitter } from 'events';
import WebSocket from 'ws';
import type { PendingRequest } from './commonTypes';

// ================================
// WebSocket Management Types
// ================================

export interface WebSocketManager {
  websocket: WebSocket | null;
  isConnected: boolean;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  reconnectInterval: number;
  messageQueue: any[];
  pendingRequests: Map<string, PendingRequest>;
}

export interface WebSocketConfig {
  url: string;
  timeout: number;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  autoReconnect: boolean;
}

// ================================
// Message Manager Types
// ================================

export interface MessageManagerConfig {
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export interface MessageQueueItem {
  message: any;
  timestamp: number;
  priority: number;
  retryCount: number;
  maxRetries: number;
}

// ================================
// Module Manager Types
// ================================

export interface ModuleManager {
  fs: any;
  git: any;
  llm: any;
  browser: any;
  chat: any;
  terminal: any;
  codeutils: any;
  crawler: any;
  search: any;
  knowledge: any;
  rag: any;
  codeparsers: any;
  outputparsers: any;
  project: any;
  dbmemory: any;
  cbstate: any;
  taskplaner: any;
  vectordb: any;
  debug: any;
  tokenizer: any;
  chatSummary: any;
  mcp: any;
  agent: any;
  utils: any;
}

// ================================
// Code Parser Internal Types
// ================================

export interface ASTNode {
  /** Type of the AST node */
  type: string;
  /** Start position in the source code */
  start?: number;
  /** End position in the source code */
  end?: number;
  /** Line number where the node starts */
  line?: number;
  /** Column number where the node starts */
  column?: number;
  /** Child nodes */
  children?: ASTNode[];
  /** Node value/content */
  value?: any;
  /** Additional node properties */
  [key: string]: any;
}

export interface ParserConfig {
  language: string;
  options: {
    includeComments?: boolean;
    includeLocations?: boolean;
    tolerant?: boolean;
  };
}

// ================================
// Code Utils Internal Types
// ================================

export interface JSTreeStructureItem {
  /** Type of the item (function, class, variable, etc.) */
  type: string;
  /** Name of the code structure item */
  name: string;
  /** Start line number */
  startLine: number;
  /** End line number */
  endLine: number;
  /** Start column number */
  startColumn: number;
  /** End column number */
  endColumn: number;
  /** Node type from the AST */
  nodeType: string;
}

export interface JSTreeResponse {
  /** Event type */
  event: string;
  /** Response payload */
  payload?: {
    /** File path that was parsed */
    filePath: string;
    /** Parsed structure items */
    structure: JSTreeStructureItem[];
  };
  /** Error message if parsing failed */
  error?: string;
}

export interface LanguageParser {
  name: string;
  extensions: string[];
  parser: any;
  grammar: any;
}

// ================================
// Internal Cache Types
// ================================

export interface CacheManager {
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T, ttl?: number): void;
  delete(key: string): boolean;
  clear(): void;
  size(): number;
}

export interface CacheEntry<T = any> {
  value: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

// ================================
// Internal State Management
// ================================

export interface InternalState {
  isInitialized: boolean;
  isConnected: boolean;
  lastHeartbeat: number;
  sessionId: string;
  userId?: string;
  activeRequests: Set<string>;
  moduleStates: Map<string, any>;
  errorCount: number;
  lastError?: Error;
}

export interface StateChangeEvent {
  type: 'state_change';
  property: keyof InternalState;
  oldValue: any;
  newValue: any;
  timestamp: number;
}

// ================================
// Internal Error Types
// ================================

export interface InternalError extends Error {
  code: string;
  module: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
  timestamp: number;
  stackTrace?: string;
}

export class InternalError extends Error {
  constructor(
    message: string,
    public code: string,
    public module: string,
    public severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'InternalError';
    this.timestamp = Date.now();
    this.stackTrace = this.stack;
  }
}

// ================================
// Internal Event Types
// ================================

export interface InternalEventMap {
  'websocket:connected': () => void;
  'websocket:disconnected': () => void;
  'websocket:error': (error: Error) => void;
  'websocket:message': (message: any) => void;
  'websocket:reconnecting': (attempt: number) => void;
  'module:loaded': (moduleName: string) => void;
  'module:error': (moduleName: string, error: Error) => void;
  'cache:hit': (key: string) => void;
  'cache:miss': (key: string) => void;
  'cache:evicted': (key: string) => void;
  'state:changed': (event: StateChangeEvent) => void;
  'request:started': (requestId: string) => void;
  'request:completed': (requestId: string, duration: number) => void;
  'request:failed': (requestId: string, error: Error) => void;
}

export interface InternalEventEmitter extends EventEmitter {
  on<K extends keyof InternalEventMap>(event: K, listener: InternalEventMap[K]): this;
  off<K extends keyof InternalEventMap>(event: K, listener: InternalEventMap[K]): this;
  emit<K extends keyof InternalEventMap>(event: K, ...args: Parameters<InternalEventMap[K]>): boolean;
}

// ================================
// Request Tracking Types
// ================================

export interface RequestTracker {
  id: string;
  type: string;
  module: string;
  startTime: number;
  endTime?: number;
  status: 'pending' | 'success' | 'error' | 'timeout';
  error?: Error;
  metadata?: Record<string, any>;
}

export interface RequestMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  requestsByModule: Map<string, number>;
  errorsByType: Map<string, number>;
}

// ================================
// Performance Monitoring Types
// ================================

export interface PerformanceMetrics {
  memoryUsage: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  cpuUsage: {
    user: number;
    system: number;
  };
  eventLoopLag: number;
  gcStats?: {
    totalHeapSize: number;
    totalHeapSizeExecutable: number;
    totalPhysicalSize: number;
    totalAvailableSize: number;
    usedHeapSize: number;
    heapSizeLimit: number;
  };
}

export interface PerformanceMonitor {
  start(): void;
  stop(): void;
  getMetrics(): PerformanceMetrics;
  reset(): void;
  isRunning(): boolean;
}

// ================================
// Logging Types
// ================================

export interface InternalLogger {
  debug(message: string, meta?: Record<string, any>): void;
  info(message: string, meta?: Record<string, any>): void;
  warn(message: string, meta?: Record<string, any>): void;
  error(message: string, error?: Error, meta?: Record<string, any>): void;
  setLevel(level: 'debug' | 'info' | 'warn' | 'error'): void;
  getLevel(): string;
}

export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: number;
  module?: string;
  requestId?: string;
  meta?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

// ================================
// Module Loading Types
// ================================

export interface ModuleDefinition {
  name: string;
  path: string;
  dependencies: string[];
  version: string;
  exports: string[];
  config?: Record<string, any>;
}

export interface ModuleLoader {
  load(name: string): Promise<any>;
  unload(name: string): Promise<void>;
  reload(name: string): Promise<any>;
  isLoaded(name: string): boolean;
  getLoadedModules(): string[];
}

// ================================
// Configuration Management Types
// ================================

export interface ConfigurationManager {
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T): void;
  has(key: string): boolean;
  delete(key: string): boolean;
  getAll(): Record<string, any>;
  merge(config: Record<string, any>): void;
  validate(schema: any): boolean;
}

export interface ConfigurationSchema {
  type: 'object';
  properties: Record<string, {
    type: string;
    required?: boolean;
    default?: any;
    description?: string;
  }>;
  required?: string[];
}

// ================================
// Queue Management Types
// ================================

export interface QueueManager<T = any> {
  enqueue(item: T, priority?: number): void;
  dequeue(): T | undefined;
  peek(): T | undefined;
  size(): number;
  isEmpty(): boolean;
  clear(): void;
}

export interface PriorityQueue<T = any> extends QueueManager<T> {
  enqueuePriority(item: T, priority: number): void;
  dequeuePriority(): T | undefined;
}

// ================================
// Connection Pool Types
// ================================

export interface ConnectionPool {
  acquire(): Promise<WebSocket>;
  release(connection: WebSocket): void;
  destroy(connection: WebSocket): void;
  size(): number;
  available(): number;
  pending(): number;
  close(): Promise<void>;
}

export interface PoolConfiguration {
  min: number;
  max: number;
  acquireTimeoutMillis: number;
  idleTimeoutMillis: number;
  createTimeoutMillis: number;
  destroyTimeoutMillis: number;
  reapIntervalMillis: number;
}

// ================================
// Security Types
// ================================

export interface SecurityContext {
  userId?: string;
  sessionId: string;
  permissions: string[];
  roles: string[];
  isAuthenticated: boolean;
  expiresAt?: number;
}

export interface SecurityManager {
  authenticate(credentials: any): Promise<SecurityContext>;
  authorize(action: string, resource?: string): boolean;
  validateSession(sessionId: string): boolean;
  revokeSession(sessionId: string): void;
  hasPermission(permission: string): boolean;
}

// ================================
// Validation Types
// ================================

export interface ValidationRule {
  field: string;
  type: 'required' | 'string' | 'number' | 'boolean' | 'array' | 'object' | 'custom';
  message?: string;
  validator?: (value: any) => boolean;
  options?: Record<string, any>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    value?: any;
  }>;
}

export interface Validator {
  validate(data: any, rules: ValidationRule[]): ValidationResult;
  addRule(rule: ValidationRule): void;
  removeRule(field: string): void;
  hasRule(field: string): boolean;
}

// ================================
// Serialization Types
// ================================

export interface Serializer<T = any> {
  serialize(data: T): string | Buffer;
  deserialize(data: string | Buffer): T;
  getContentType(): string;
}

export interface SerializationManager {
  register(name: string, serializer: Serializer): void;
  unregister(name: string): void;
  get(name: string): Serializer | undefined;
  serialize(data: any, format?: string): string | Buffer;
  deserialize(data: string | Buffer, format?: string): any;
}

// ================================
// Plugin System Types
// ================================

export interface Plugin {
  name: string;
  version: string;
  initialize(context: PluginContext): Promise<void>;
  destroy(): Promise<void>;
  dependencies?: string[];
  config?: Record<string, any>;
}

export interface PluginContext {
  logger: InternalLogger;
  config: ConfigurationManager;
  events: InternalEventEmitter;
  state: InternalState;
  registerHandler(type: string, handler: Function): void;
  unregisterHandler(type: string, handler: Function): void;
}

export interface PluginManager {
  load(plugin: Plugin): Promise<void>;
  unload(name: string): Promise<void>;
  isLoaded(name: string): boolean;
  getLoaded(): Plugin[];
  enable(name: string): void;
  disable(name: string): void;
}

// ================================
// Health Check Types
// ================================

export interface HealthCheck {
  name: string;
  check(): Promise<HealthStatus>;
  timeout?: number;
  interval?: number;
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  message?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface HealthMonitor {
  register(check: HealthCheck): void;
  unregister(name: string): void;
  checkAll(): Promise<Map<string, HealthStatus>>;
  getStatus(name: string): HealthStatus | undefined;
  isHealthy(): boolean;
}

// ================================
// Circuit Breaker Types
// ================================

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
  expectedErrorCodes?: string[];
}

export interface CircuitBreaker {
  execute<T>(operation: () => Promise<T>): Promise<T>;
  getState(): 'closed' | 'open' | 'half-open';
  getFailureRate(): number;
  reset(): void;
  forceOpen(): void;
  forceClose(): void;
}
