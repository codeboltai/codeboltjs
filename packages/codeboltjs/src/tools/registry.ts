/**
 * Tool Registry for managing and executing tools
 */

import type {
    AnyDeclarativeTool,
    ToolResult,
    OpenAIToolSchema,
    OpenAIFunctionCall,
} from './types';
import { ToolErrorType } from './types';

/**
 * Registry for managing tools
 */
export class ToolRegistry {
    private tools: Map<string, AnyDeclarativeTool> = new Map();

    /**
     * Register a tool with the registry
     * @param tool - The tool to register
     */
    registerTool(tool: AnyDeclarativeTool): void {
        if (this.tools.has(tool.name)) {
            console.warn(`Tool "${tool.name}" is already registered. Overwriting.`);
        }
        this.tools.set(tool.name, tool);
    }

    /**
     * Register multiple tools at once
     * @param tools - Array of tools to register
     */
    registerTools(tools: AnyDeclarativeTool[]): void {
        for (const tool of tools) {
            this.registerTool(tool);
        }
    }

    /**
     * Unregister a tool by name
     * @param name - The name of the tool to unregister
     * @returns true if the tool was found and removed
     */
    unregisterTool(name: string): boolean {
        return this.tools.delete(name);
    }

    /**
     * Get a tool by name
     * @param name - The name of the tool
     * @returns The tool if found, undefined otherwise
     */
    getTool(name: string): AnyDeclarativeTool | undefined {
        return this.tools.get(name);
    }

    /**
     * Check if a tool is registered
     * @param name - The name of the tool
     * @returns true if the tool is registered
     */
    hasTool(name: string): boolean {
        return this.tools.has(name);
    }

    /**
     * Get all registered tools
     * @returns Array of all registered tools
     */
    getAllTools(): AnyDeclarativeTool[] {
        return Array.from(this.tools.values());
    }

    /**
     * Get the names of all registered tools
     * @returns Array of tool names
     */
    getToolNames(): string[] {
        return Array.from(this.tools.keys());
    }

    /**
     * Get the count of registered tools
     * @returns Number of registered tools
     */
    getToolCount(): number {
        return this.tools.size;
    }

    /**
     * Get OpenAI tool schemas for all registered tools
     * @returns Array of OpenAI tool schemas
     */
    getToolSchemas(): OpenAIToolSchema[] {
        return this.getAllTools().map(tool => tool.schema);
    }

    /**
     * Get OpenAI function call schemas for all registered tools
     * @returns Array of OpenAI function call schemas
     */
    getFunctionCallSchemas(): OpenAIFunctionCall[] {
        return this.getAllTools().map(tool => ({
            name: tool.name,
            description: tool.description,
            parameters: tool.schema.function.parameters,
        }));
    }

    /**
     * Execute a tool by name with given parameters
     * @param name - The name of the tool to execute
     * @param params - The parameters to pass to the tool
     * @param signal - Optional AbortSignal for cancellation
     * @param updateOutput - Optional callback for streaming output
     * @returns The tool execution result
     */
    async executeTool(
        name: string,
        params: object,
        signal?: AbortSignal,
        updateOutput?: (output: string) => void,
    ): Promise<ToolResult> {
        const tool = this.tools.get(name);

        if (!tool) {
            return {
                llmContent: `Error: Tool "${name}" is not registered.`,
                returnDisplay: `Tool "${name}" not found`,
                error: {
                    message: `Tool "${name}" is not registered`,
                    type: ToolErrorType.TOOL_NOT_REGISTERED,
                },
            };
        }

        const abortSignal = signal || new AbortController().signal;

        try {
            return await tool.validateBuildAndExecute(params, abortSignal);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                llmContent: `Error executing tool "${name}": ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }

    /**
     * Execute a tool with confirmation support
     * @param name - The name of the tool
     * @param params - The parameters to pass
     * @param signal - AbortSignal for cancellation
     * @param onConfirmation - Callback when confirmation is needed
     * @param updateOutput - Optional callback for streaming output
     * @returns The tool execution result
     */
    async executeToolWithConfirmation(
        name: string,
        params: object,
        signal: AbortSignal,
        onConfirmation: (details: any) => Promise<boolean>,
        updateOutput?: (output: string) => void,
    ): Promise<ToolResult> {
        const tool = this.tools.get(name);

        if (!tool) {
            return {
                llmContent: `Error: Tool "${name}" is not registered.`,
                returnDisplay: `Tool "${name}" not found`,
                error: {
                    message: `Tool "${name}" is not registered`,
                    type: ToolErrorType.TOOL_NOT_REGISTERED,
                },
            };
        }

        try {
            // Build the invocation first
            const invocation = tool.build(params);

            // Check if confirmation is needed
            const confirmationDetails = await invocation.shouldConfirmExecute(signal);

            if (confirmationDetails) {
                const shouldProceed = await onConfirmation(confirmationDetails);
                if (!shouldProceed) {
                    return {
                        llmContent: 'Tool execution cancelled by user.',
                        returnDisplay: 'Execution cancelled',
                        error: {
                            message: 'User cancelled the operation',
                            type: ToolErrorType.EXECUTION_FAILED,
                        },
                    };
                }
            }

            // Execute the tool
            return await invocation.execute(signal, updateOutput);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                llmContent: `Error executing tool "${name}": ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }

    /**
     * Clear all registered tools
     */
    clear(): void {
        this.tools.clear();
    }
}

/**
 * Default global registry instance
 */
export const defaultRegistry = new ToolRegistry();
