/**
 * @fileoverview Type definitions for the Composable Agent Pattern
 * @description Re-exports types from @codebolt/types and adds additional types
 */

import { z } from 'zod';

// Import types from the parent workspace
// Temporary workaround for build issues
export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | MessageContent[];
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  timestamp?: string;
  metadata?: Record<string, any>;
}

export interface MessageContent {
  type: 'text' | 'image' | 'file';
  text?: string;
  image_url?: string;
  file?: string;
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

// Model configuration is handled by codeboltagents.yaml
// Just use string model names that reference configurations in the YAML file

export interface ToolConfig<TInput = any, TOutput = any> {
  id: string;
  description: string;
  inputSchema: z.ZodType<TInput>;
  outputSchema: z.ZodType<TOutput>;
  execute: (params: { context: TInput; agent?: ComposableAgent }) => Promise<TOutput>;
}

export interface Tool<TInput = any, TOutput = any> extends ToolConfig<TInput, TOutput> {
  validateInput: (input: unknown) => TInput;
  validateOutput: (output: unknown) => TOutput;
}

export interface StorageProvider {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  delete(key: string): Promise<void>;
  keys(): Promise<string[]>;
  clear(): Promise<void>;
}

export interface LibSQLStoreConfig {
  url: string;
  authToken?: string;
  tableName?: string;
}

export interface MemoryConfig {
  storage: StorageProvider;
  maxMessages?: number;
  autoSave?: boolean;
}

// Memory interface is implemented by the Memory class in memory.ts

export interface AgentProcessingConfig {
  processMentionedMCPs?: boolean;
  processRemixPrompt?: boolean;
  processMentionedFiles?: boolean;
  processMentionedAgents?: boolean;
  fileContentProcessor?: (filePath: string) => Promise<string>;
  mcpToolProcessor?: (toolbox: string, toolName: string) => Promise<Tool | null>;
}

export interface ComposableAgentConfig {
  name: string;
  instructions: string;
  model: string; // Model name that references configuration in codeboltagents.yaml
  tools?: Record<string, Tool>;
  memory?: any; // Use any for now to avoid circular import with Memory class
  maxTurns?: number;
  processing?: AgentProcessingConfig;
  metadata?: Record<string, any>;
}

export interface ExecutionResult {
  success: boolean;
  message?: string;
  error?: string;
  conversation: Message[];
  metadata?: Record<string, any>;
}

export interface StreamChunk {
  type: 'text' | 'tool_call' | 'tool_result' | 'error';
  content: string;
  tool_call?: ToolCall;
  metadata?: Record<string, any>;
}

export type StreamCallback = (chunk: StreamChunk) => void | Promise<void>;

export interface ComposableAgent {
  readonly config: ComposableAgentConfig;
  execute(message: string, options?: { stream?: boolean; callback?: StreamCallback }): Promise<ExecutionResult>;
  executeMessage(message: CodeBoltMessage, options?: { stream?: boolean; callback?: StreamCallback }): Promise<ExecutionResult>;
  run(options?: { stream?: boolean; callback?: StreamCallback }): Promise<ExecutionResult>;
  addMessage(message: Message): void;
  getConversation(): Message[];
  clearConversation(): void;
  saveConversation(): Promise<void>;
  loadConversation(): Promise<void>;
}

export interface CodeBoltMessage {
  userMessage: string;
  mentionedFiles?: string[];
  mentionedMCPs: { toolbox: string, toolName: string }[];
  mentionedAgents: any[];
  remixPrompt?: string;
}

export interface DocumentConfig {
  content: string;
  type?: 'text' | 'markdown' | 'json' | 'xml';
  metadata?: Record<string, any>;
}

export interface ProcessedDocument {
  content: string;
  chunks?: string[];
  metadata: Record<string, any>;
  embeddings?: number[][];
}

export interface WorkflowContext {
  data: Record<string, any>;
  history: WorkflowStepResult[];
  currentStep: number;
  metadata: Record<string, any>;
}

export interface WorkflowStepResult {
  stepId: string;
  success: boolean;
  output?: any;
  error?: string;
  executionTime: number;
  metadata?: Record<string, any>;
}

export interface WorkflowStep {
  id: string;
  name: string;
  description?: string;
  inputSchema?: any;
  outputSchema?: any;
  execute: (context: WorkflowContext) => Promise<WorkflowStepResult>;
  condition?: (context: WorkflowContext) => boolean | Promise<boolean>;
  dependencies?: string[];
  parallel?: boolean;
  retry?: {
    maxAttempts: number;
    delay: number;
    backoff?: 'linear' | 'exponential';
  };
}

export interface WorkflowConfig {
  name: string;
  description?: string;
  steps: WorkflowStep[];
  initialData?: Record<string, any>;
  timeout?: number;
  continueOnError?: boolean;
  maxParallelSteps?: number;
}

export interface WorkflowResult {
  success: boolean;
  data: Record<string, any>;
  stepResults: WorkflowStepResult[];
  executionTime: number;
  error?: string;
  metadata: Record<string, any>;
}

export interface AgentStepConfig {
  agent: ComposableAgent;
  messageTemplate: string;
  inputMapping?: Record<string, string>;
  outputMapping?: Record<string, string>;
}

// ================================
// Additional Types Not in @codebolt/types
// ================================

export interface ExecutionContext {
  /** Current conversation history */
  messages: Message[];
  /** Available tools */
  tools: Record<string, Tool>;
  /** Agent configuration */
  config: ComposableAgentConfig;
  /** Execution metadata */
  metadata?: Record<string, any>;
}
