/**
 * Standalone Tools Framework
 * 
 * A comprehensive tool execution framework extracted from gemini-cli
 * that provides file operations, shell execution, and extensible tool management.
 */

// Core types and interfaces
export * from './types';
export type { OpenAIToolSchema, OpenAIFunctionCall } from './types';

// Configuration management
export * from './config';

// Base tool classes
export * from './base-tool';

// Tool registry
export * from './registry';

// All tools
export * from './tools/index';

// Utilities
export * from './utils/paths';
export * from './utils/errors';
export * from './utils/diff';
export * from './utils/schema-validator';

// Main framework class for easy usage
import { ToolRegistry } from './registry';
import { ConfigManager, createDefaultConfig } from './config';
import {
  ReadFileTool,
  WriteFileTool,
  EditTool,
 
  LSTool,
  ReadManyFilesTool,
  GrepTool,
  GlobTool,
  SmartEditTool,
  // ExecuteCommandTool,

  AttemptCompletionTool,

  SearchFilesTool,
  ListFilesTool,

  GitActionTool,
  WriteTodosTool,
  ExplainNextActionTool,
} from './tools/index';

/**
 * Main framework class that provides a convenient interface for using the tools
 */
export class StandaloneToolsFramework {
  private registry: ToolRegistry;
  private config: ConfigManager;

  constructor(options?: {
    targetDir?: string;
    workspaceDirectories?: string[];
    debugMode?: boolean;
    approvalMode?: 'auto' | 'manual';
    timeout?: number;
  }) {
    this.config = new ConfigManager(createDefaultConfig(options || {}));
    this.registry = new ToolRegistry();
    this.initializeDefaultTools();
  }

  /**
   * Initialize the default set of tools
   */
  private initializeDefaultTools(): void {
    // Core file operations
    this.registry.registerTool(new ReadFileTool());
    this.registry.registerTool(new WriteFileTool(this.config));
    this.registry.registerTool(new EditTool(this.config));
    this.registry.registerTool(new LSTool(this.config));

    // Advanced file operations
    this.registry.registerTool(new ReadManyFilesTool());
    this.registry.registerTool(new SmartEditTool());

    // Shell operations
    // this.registry.registerTool(new ShellTool(this.config));

    // Search operations
    this.registry.registerTool(new GrepTool(this.config));
    this.registry.registerTool(new GlobTool(this.config));

    // New tools from mcpService
    this.registry.registerTool(new ExecuteCommandTool(this.config));
    // this.registry.registerTool(new AskFollowupQuestionTool(this.config));
    this.registry.registerTool(new AttemptCompletionTool(this.config));

    this.registry.registerTool(new SearchFilesTool(this.config));
    this.registry.registerTool(new ListFilesTool(this.config));

    // this.registry.registerTool(new BrowserActionTool(this.config));
    // this.registry.registerTool(new GitActionTool(this.config));

    // Register the WriteTodosTool
    this.registry.registerTool(new WriteTodosTool());

    // Register the ExplainNextActionTool
    this.registry.registerTool(new ExplainNextActionTool());
  }

  /**
   * Get the tool registry
   */
  getRegistry(): ToolRegistry {
    return this.registry;
  }

  /**
   * Get the configuration manager
   */
  getConfig(): ConfigManager {
    return this.config;
  }

  /**
   * Execute a tool by name
   */
  async executeTool(
    toolName: string,
    params: object,
    abortSignal?: AbortSignal,
    updateOutput?: (output: string) => void,
  ) {
    return this.registry.executeTool(
      toolName,
      params,
      abortSignal || new AbortController().signal,
      updateOutput,
    );
  }

  /**
   * Get all available tools
   */
  getAvailableTools() {
    return this.registry.getAllTools();
  }

  /**
   * Get tool schemas (primary OpenAI format)
   */
  getToolSchemas() {
    return this.registry.getToolSchemas();
  }

  /**
   * Get OpenAI tool schemas for all tools (alias for primary format)
   */
  getOpenAIToolSchemas() {
    return this.registry.getOpenAIToolSchemas();
  }

  /**
   * Get function declarations for LLM integration (backward compatibility)
   */
  getFunctionDeclarations() {
    return this.registry.getFunctionDeclarations();
  }

  /**
   * Get OpenAI function calls for all tools
   */
  getOpenAIFunctionCalls() {
    return this.registry.getOpenAIFunctionCalls();
  }

  /**
   * Get OpenAI tool schemas for specific tools
   */
  getOpenAIToolSchemasFiltered(toolNames: string[]) {
    return this.registry.getOpenAIToolSchemasFiltered(toolNames);
  }

  /**
   * Get OpenAI function calls for specific tools
   */
  getOpenAIFunctionCallsFiltered(toolNames: string[]) {
    return this.registry.getOpenAIFunctionCallsFiltered(toolNames);
  }

  /**
   * Register a custom tool
   */
  registerTool(tool: any) {
    this.registry.registerTool(tool);
  }

  /**
   * Update configuration
   */
  updateConfig(updates: any) {
    this.config.updateConfig(updates);
  }
}