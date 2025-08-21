/**
 * @fileoverview Tool creation and management for Composable Agent Pattern
 * @description Provides utilities for creating and managing tools in the composable agent framework
 */

import { z } from 'zod';
import type { Tool, ToolConfig } from './types';

/**
 * Creates a new tool with input/output validation and execution logic
 * 
 * @template TInput - Type for tool input parameters
 * @template TOutput - Type for tool output
 * @param config - Tool configuration object
 * @returns Fully configured tool with validation methods
 * 
 * @example
 * ```typescript
 * const weatherTool = createTool({
 *   id: 'get-weather',
 *   description: 'Get current weather for a location',
 *   inputSchema: z.object({
 *     location: z.string().describe('City name'),
 *   }),
 *   outputSchema: z.object({
 *     temperature: z.number(),
 *     conditions: z.string(),
 *     location: z.string(),
 *   }),
 *   execute: async ({ context }) => {
 *     return await getWeather(context.location);
 *   },
 * });
 * ```
 */
export function createTool<TInput = any, TOutput = any>(
  config: ToolConfig<TInput, TOutput>
): Tool<TInput, TOutput> {
  return {
    ...config,
    
    /**
     * Validates input against the tool's input schema
     * @param input - Raw input to validate
     * @returns Validated and typed input
     * @throws {z.ZodError} If validation fails
     */
    validateInput(input: unknown): TInput {
      try {
        return config.inputSchema.parse(input);
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new Error(
            `Tool "${config.id}" input validation failed: ${error.issues
              .map((issue: any) => `${issue.path.join('.')}: ${issue.message}`)
              .join(', ')}`
          );
        }
        throw error;
      }
    },

    /**
     * Validates output against the tool's output schema
     * @param output - Raw output to validate
     * @returns Validated and typed output
     * @throws {z.ZodError} If validation fails
     */
    validateOutput(output: unknown): TOutput {
      try {
        return config.outputSchema.parse(output);
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new Error(
            `Tool "${config.id}" output validation failed: ${error.issues
              .map((issue: any) => `${issue.path.join('.')}: ${issue.message}`)
              .join(', ')}`
          );
        }
        throw error;
      }
    }
  };
}

/**
 * Converts a tool to OpenAI function format for LLM usage
 * 
 * @param tool - The tool to convert
 * @returns OpenAI function specification
 */
export function toolToOpenAIFunction(tool: Tool): any {
  return {
    type: 'function',
    function: {
      name: tool.id,
      description: tool.description,
      parameters: zodSchemaToJsonSchema(tool.inputSchema)
    }
  };
}

/**
 * Converts multiple tools to OpenAI functions format
 * 
 * @param tools - Record of tools to convert
 * @returns Array of OpenAI function specifications
 */
export function toolsToOpenAIFunctions(tools: Record<string, Tool>): any[] {
  return Object.values(tools).map(toolToOpenAIFunction);
}

/**
 * Executes a tool with proper error handling and validation
 * 
 * @param tool - The tool to execute
 * @param input - Input parameters for the tool
 * @param agent - Optional agent instance for context
 * @returns Tool execution result
 */
export async function executeTool<TInput, TOutput>(
  tool: Tool<TInput, TOutput>,
  input: unknown,
  agent?: any
): Promise<{ success: boolean; result?: TOutput; error?: string }> {
  try {
    // Validate input
    const validatedInput = tool.validateInput(input);
    
    // Execute tool
    const result = await tool.execute({ context: validatedInput, agent });
    
    // Validate output
    const validatedResult = tool.validateOutput(result);
    
    return { success: true, result: validatedResult };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Converts a Zod schema to JSON Schema format
 * This is a simplified version - in production you might want to use a library like zod-to-json-schema
 * 
 * @param schema - Zod schema to convert
 * @returns JSON Schema object
 */
function zodSchemaToJsonSchema(schema: z.ZodType): any {
  // This is a basic implementation - you might want to use a proper converter
  // like zod-to-json-schema for production use
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const properties: Record<string, any> = {};
    const required: string[] = [];
    
    for (const [key, value] of Object.entries(shape)) {
      properties[key] = zodTypeToJsonSchema(value as z.ZodType);
      
      // Check if field is required (not optional)
      if (!(value instanceof z.ZodOptional)) {
        required.push(key);
      }
    }
    
    return {
      type: 'object',
      properties,
      required: required.length > 0 ? required : undefined,
      additionalProperties: false
    };
  }
  
  return zodTypeToJsonSchema(schema);
}

/**
 * Converts individual Zod types to JSON Schema
 * 
 * @param schema - Zod type to convert
 * @returns JSON Schema type definition
 */
function zodTypeToJsonSchema(schema: z.ZodType): any {
  if (schema instanceof z.ZodString) {
    const result: any = { type: 'string' };
    if (schema.description) {
      result.description = schema.description;
    }
    return result;
  }
  
  if (schema instanceof z.ZodNumber) {
    const result: any = { type: 'number' };
    if (schema.description) {
      result.description = schema.description;
    }
    return result;
  }
  
  if (schema instanceof z.ZodBoolean) {
    const result: any = { type: 'boolean' };
    if (schema.description) {
      result.description = schema.description;
    }
    return result;
  }
  
  if (schema instanceof z.ZodArray) {
    return {
      type: 'array',
      items: zodTypeToJsonSchema(schema.element)
    };
  }
  
  if (schema instanceof z.ZodOptional) {
    return zodTypeToJsonSchema(schema.unwrap());
  }
  
  if (schema instanceof z.ZodEnum) {
    return {
      type: 'string',
      enum: schema.options
    };
  }
  
  // Fallback for unsupported types
  return { type: 'string' };
}

/**
 * Built-in tool for task completion
 */
export const attemptCompletionTool = createTool({
  id: 'attempt_completion',
  description: 'Indicates that the task has been completed successfully',
  inputSchema: z.object({
    result: z.string().describe('Summary of what was accomplished')
  }),
  outputSchema: z.object({
    completed: z.boolean(),
    message: z.string()
  }),
  execute: async ({ context }) => {
    return {
      completed: true,
      message: context.result
    };
  }
});

/**
 * Built-in tool for asking follow-up questions
 */
export const askFollowUpTool = createTool({
  id: 'ask_followup_question',
  description: 'Ask the user a follow-up question when more information is needed',
  inputSchema: z.object({
    question: z.string().describe('The question to ask the user')
  }),
  outputSchema: z.object({
    question: z.string(),
    waiting_for_response: z.boolean()
  }),
  execute: async ({ context }) => {
    return {
      question: context.question,
      waiting_for_response: true
    };
  }
});

/**
 * Creates default tools that are automatically available to all agents
 * 
 * @returns Record of default tools
 */
export function createDefaultTools(): Record<string, Tool> {
  return {
    attempt_completion: attemptCompletionTool,
    ask_followup_question: askFollowUpTool
  };
}
