/**
 * Tool registry for managing and discovering tools
 */

//import type { any } from '@google/generative-ai';
import type { AnyDeclarativeTool, OpenAIToolSchema, OpenAIFunctionCall } from './types';

/**
 * Central registry for managing tools
 */
export class ToolRegistry {
  private tools: Map<string, AnyDeclarativeTool> = new Map();

  /**
   * Register a tool in the registry
   */
  registerTool(tool: AnyDeclarativeTool): void {
    if (this.tools.has(tool.name)) {
      console.warn(
        `Tool with name "${tool.name}" is already registered. Overwriting.`,
      );
    }
    this.tools.set(tool.name, tool);
  }

  /**
   * Unregister a tool from the registry
   */
  unregisterTool(name: string): boolean {
    return this.tools.delete(name);
  }

  /**
   * Get a tool by name
   */
  getTool(name: string): AnyDeclarativeTool | undefined {
    return this.tools.get(name);
  }

  /**
   * Get all registered tool names
   */
  getAllToolNames(): string[] {
    return Array.from(this.tools.keys());
  }

  /**
   * Get all registered tools
   */
  getAllTools(): AnyDeclarativeTool[] {
    return Array.from(this.tools.values()).sort((a, b) =>
      a.displayName.localeCompare(b.displayName),
    );
  }

  /**
   * Get OpenAI tool schemas for all tools (primary format)
   */
  getToolSchemas(): OpenAIToolSchema[] {
    const schemas: OpenAIToolSchema[] = [];
    this.tools.forEach((tool) => {
      schemas.push(tool.schema);
    });
    return schemas;
  }

  /**
   * Get OpenAI tool schemas for specific tools (primary format)
   */
  getToolSchemasFiltered(toolNames: string[]): OpenAIToolSchema[] {
    const schemas: OpenAIToolSchema[] = [];
    for (const name of toolNames) {
      const tool = this.tools.get(name);
      if (tool) {
        schemas.push(tool.schema);
      }
    }
    return schemas;
  }

  /**
   * Get function declarations for all tools (backward compatibility)
   */
  getanys(): any[] {
    const declarations: any[] = [];
    this.tools.forEach((tool) => {
      declarations.push((tool as any).genAISchema);
    });
    return declarations;
  }

  /**
   * Get function declarations for specific tools (backward compatibility)
   */
  getanysFiltered(toolNames: string[]): any[] {
    const declarations: any[] = [];
    for (const name of toolNames) {
      const tool = this.tools.get(name);
      if (tool) {
        declarations.push((tool as any).genAISchema);
      }
    }
    return declarations;
  }

  /**
   * Check if a tool is registered
   */
  hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Clear all tools from the registry
   */
  clear(): void {
    this.tools.clear();
  }

  /**
   * Get tools by kind
   */
  getToolsByKind(kind: string): AnyDeclarativeTool[] {
    return Array.from(this.tools.values()).filter(tool => tool.kind === kind);
  }

  /**
   * Get the number of registered tools
   */
  size(): number {
    return this.tools.size;
  }

  /**
   * Execute a tool by name with parameters
   */
  async executeTool(
    toolName: string,
    params: object,
    abortSignal: AbortSignal,
    updateOutput?: (output: string) => void,
  ) {
    const tool = this.tools.get(toolName);
    if (!tool) {
      throw new Error(`Tool '${toolName}' not found in registry`);
    }

    return tool.buildAndExecute(params, abortSignal, updateOutput);
  }

  /**
   * Validate tool parameters without executing
   */
  validateToolParams(toolName: string, params: object): string | null {
    const tool = this.tools.get(toolName);
    if (!tool) {
      return `Tool '${toolName}' not found in registry`;
    }

    return tool.validateToolParams(params);
  }

  /**
   * Get OpenAI tool schemas for all tools (alias for primary format)
   */
  getOpenAIToolSchemas(): OpenAIToolSchema[] {
    return this.getToolSchemas();
  }

  /**
   * Get OpenAI tool schemas for specific tools (alias for primary format)
   */
  getOpenAIToolSchemasFiltered(toolNames: string[]): OpenAIToolSchema[] {
    return this.getToolSchemasFiltered(toolNames);
  }

  /**
   * Get OpenAI function calls for all tools
   */
  getOpenAIFunctionCalls(): OpenAIFunctionCall[] {
    const functionCalls: OpenAIFunctionCall[] = [];
    this.tools.forEach((tool) => {
      functionCalls.push((tool as any).openAIFunctionCall);
    });
    return functionCalls;
  }

  /**
   * Get OpenAI function calls for specific tools
   */
  getOpenAIFunctionCallsFiltered(toolNames: string[]): OpenAIFunctionCall[] {
    const functionCalls: OpenAIFunctionCall[] = [];
    for (const name of toolNames) {
      const tool = this.tools.get(name);
      if (tool) {
        functionCalls.push((tool as any).openAIFunctionCall);
      }
    }
    return functionCalls;
  }

  /**
   * Get a specific tool's schema (primary OpenAI format)
   */
  getToolSchema(toolName: string): OpenAIToolSchema | null {
    const tool = this.tools.get(toolName);
    if (!tool) {
      return null;
    }
    return tool.schema;
  }

  /**
   * Get a specific tool's OpenAI tool schema (alias for primary format)
   */
  getToolOpenAISchema(toolName: string): OpenAIToolSchema | null {
    return this.getToolSchema(toolName);
  }

  /**
   * Get a specific tool's OpenAI function call
   */
  getToolOpenAIFunctionCall(toolName: string): OpenAIFunctionCall | null {
    const tool = this.tools.get(toolName);
    if (!tool) {
      return null;
    }
    return (tool as any).openAIFunctionCall;
  }
}