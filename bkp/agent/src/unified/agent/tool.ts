/**
 * Tool creation utilities for the Unified Agent Framework
 */

import { z } from 'zod';
import type { OpenAITool } from '../types/libTypes';
import type { Tool, ToolConfig } from './agent';

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
 * const calculatorTool = createTool({
 *   id: 'calculator',
 *   name: 'Calculator',
 *   description: 'Performs basic mathematical calculations',
 *   inputSchema: z.object({
 *     expression: z.string().describe('Mathematical expression to evaluate'),
 *   }),
 *   outputSchema: z.object({
 *     result: z.number(),
 *     expression: z.string(),
 *   }),
 *   execute: async ({ input }) => {
 *     const result = eval(input.expression); // Note: eval is dangerous, use a proper parser
 *     return { result, expression: input.expression };
 *   },
 * });
 * ```
 */
export function createTool<TInput = any, TOutput = any>(
    config: ToolConfig<TInput, TOutput>
): Tool<TInput, TOutput> {
    const tool: Tool<TInput, TOutput> = {
        ...config,
        
        /**
         * Validates input against the tool's input schema
         * @param input - Raw input to validate
         * @returns Validated and typed input
         * @throws {Error} If validation fails
         */
        validateInput(input: unknown): TInput {
            try {
                return config.inputSchema.parse(input);
            } catch (error) {
                if (error instanceof z.ZodError) {
                    const errorMessages = error.issues
                        .map((issue: any) => `${issue.path.join('.')}: ${issue.message}`)
                        .join(', ');
                    throw new Error(
                        `Tool "${config.id}" input validation failed: ${errorMessages}`
                    );
                }
                throw error;
            }
        },

        /**
         * Validates output against the tool's output schema (if provided)
         * @param output - Raw output to validate
         * @returns Validated and typed output
         * @throws {Error} If validation fails
         */
        validateOutput(output: unknown): TOutput {
            if (!config.outputSchema) {
                return output as TOutput;
            }

            try {
                return config.outputSchema.parse(output);
            } catch (error) {
                if (error instanceof z.ZodError) {
                    const errorMessages = error.issues
                        .map((issue: any) => `${issue.path.join('.')}: ${issue.message}`)
                        .join(', ');
                    throw new Error(
                        `Tool "${config.id}" output validation failed: ${errorMessages}`
                    );
                }
                throw error;
            }
        },

        /**
         * Converts the tool to OpenAI function format
         * @returns OpenAI function specification
         */
        toOpenAITool(): OpenAITool {
            return {
                type: 'function',
                function: {
                    name: config.id,
                    description: config.description,
                    parameters: zodSchemaToJsonSchema(config.inputSchema)
                }
            };
        }
    };

    return tool;
}

/**
 * Converts a Zod schema to JSON Schema format for OpenAI functions
 */
function zodSchemaToJsonSchema(schema: z.ZodType): any {
    // This is a simplified conversion - in a real implementation,
    // you might want to use a library like zod-to-json-schema
    
    if (schema instanceof z.ZodObject) {
        const shape = schema.shape;
        const properties: Record<string, any> = {};
        const required: string[] = [];

        for (const [key, value] of Object.entries(shape)) {
            properties[key] = zodTypeToJsonSchema(value as z.ZodType);
            
            // Check if field is required (not optional)
            if (!(value as any).isOptional()) {
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
 */
function zodTypeToJsonSchema(zodType: z.ZodType): any {
    if (zodType instanceof z.ZodString) {
        const result: any = { type: 'string' };
        
        // Add description if available
        if ((zodType as any)._def.description) {
            result.description = (zodType as any)._def.description;
        }
        
        // Add constraints
        const checks = (zodType as any)._def.checks || [];
        for (const check of checks) {
            switch (check.kind) {
                case 'min':
                    result.minLength = check.value;
                    break;
                case 'max':
                    result.maxLength = check.value;
                    break;
                case 'email':
                    result.format = 'email';
                    break;
                case 'url':
                    result.format = 'uri';
                    break;
                case 'regex':
                    result.pattern = check.regex.source;
                    break;
            }
        }
        
        return result;
    }

    if (zodType instanceof z.ZodNumber) {
        const result: any = { type: 'number' };
        
        if ((zodType as any)._def.description) {
            result.description = (zodType as any)._def.description;
        }
        
        const checks = (zodType as any)._def.checks || [];
        for (const check of checks) {
            switch (check.kind) {
                case 'min':
                    result.minimum = check.value;
                    break;
                case 'max':
                    result.maximum = check.value;
                    break;
                case 'int':
                    result.type = 'integer';
                    break;
            }
        }
        
        return result;
    }

    if (zodType instanceof z.ZodBoolean) {
        const result: any = { type: 'boolean' };
        
        if ((zodType as any)._def.description) {
            result.description = (zodType as any)._def.description;
        }
        
        return result;
    }

    if (zodType instanceof z.ZodArray) {
        const result: any = {
            type: 'array',
            items: zodTypeToJsonSchema((zodType as any)._def.type)
        };
        
        if ((zodType as any)._def.description) {
            result.description = (zodType as any)._def.description;
        }
        
        const checks = (zodType as any)._def.checks || [];
        for (const check of checks) {
            switch (check.kind) {
                case 'min':
                    result.minItems = check.value;
                    break;
                case 'max':
                    result.maxItems = check.value;
                    break;
            }
        }
        
        return result;
    }

    if (zodType instanceof z.ZodEnum) {
        const result: any = {
            type: 'string',
            enum: (zodType as any)._def.values
        };
        
        if ((zodType as any)._def.description) {
            result.description = (zodType as any)._def.description;
        }
        
        return result;
    }

    if (zodType instanceof z.ZodLiteral) {
        const result: any = {
            type: typeof (zodType as any)._def.value,
            enum: [(zodType as any)._def.value]
        };
        
        if ((zodType as any)._def.description) {
            result.description = (zodType as any)._def.description;
        }
        
        return result;
    }

    if (zodType instanceof z.ZodUnion) {
        const options = (zodType as any)._def.options;
        const anyOf = options.map((option: z.ZodType) => zodTypeToJsonSchema(option));
        
        const result: any = { anyOf };
        
        if ((zodType as any)._def.description) {
            result.description = (zodType as any)._def.description;
        }
        
        return result;
    }

    if (zodType instanceof z.ZodOptional) {
        return zodTypeToJsonSchema((zodType as any)._def.innerType);
    }

    if (zodType instanceof z.ZodNullable) {
        const innerSchema = zodTypeToJsonSchema((zodType as any)._def.innerType);
        return {
            anyOf: [
                innerSchema,
                { type: 'null' }
            ]
        };
    }

    if (zodType instanceof z.ZodObject) {
        return zodSchemaToJsonSchema(zodType);
    }

    // Fallback for unknown types
    return { type: 'string', description: 'Unknown type' };
}

/**
 * Creates a simple text-based tool
 */
export function createTextTool(config: {
    id: string;
    name: string;
    description: string;
    execute: (text: string, context?: Record<string, any>) => Promise<string> | string;
    timeout?: number;
}): Tool<{ text: string }, string> {
    return createTool({
        id: config.id,
        name: config.name,
        description: config.description,
        inputSchema: z.object({
            text: z.string().describe('Input text to process')
        }),
        outputSchema: z.string(),
        execute: async ({ input, context }) => {
            return await config.execute(input.text, context);
        },
        timeout: config.timeout
    });
}

/**
 * Creates a file operation tool
 */
export function createFileTool(config: {
    id: string;
    name: string;
    description: string;
    operation: 'read' | 'write' | 'delete' | 'list';
    execute: (params: any, context?: Record<string, any>) => Promise<any> | any;
}): Tool {
    let inputSchema: z.ZodType;
    
    switch (config.operation) {
        case 'read':
            inputSchema = z.object({
                filePath: z.string().describe('Path to the file to read'),
                encoding: z.string().optional().describe('File encoding (default: utf-8)')
            });
            break;
        case 'write':
            inputSchema = z.object({
                filePath: z.string().describe('Path to the file to write'),
                content: z.string().describe('Content to write to the file'),
                encoding: z.string().optional().describe('File encoding (default: utf-8)')
            });
            break;
        case 'delete':
            inputSchema = z.object({
                filePath: z.string().describe('Path to the file to delete')
            });
            break;
        case 'list':
            inputSchema = z.object({
                directoryPath: z.string().describe('Path to the directory to list'),
                recursive: z.boolean().optional().describe('Whether to list recursively')
            });
            break;
        default:
            throw new Error(`Unknown file operation: ${config.operation}`);
    }

    return createTool({
        id: config.id,
        name: config.name,
        description: config.description,
        inputSchema,
        execute: config.execute
    });
}

/**
 * Creates an HTTP request tool
 */
export function createHttpTool(config: {
    id: string;
    name: string;
    description: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    baseUrl?: string;
    defaultHeaders?: Record<string, string>;
    execute?: (params: any, context?: Record<string, any>) => Promise<any> | any;
}): Tool {
    const inputSchema = z.object({
        url: z.string().describe('URL to make the request to'),
        method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).optional().describe('HTTP method'),
        headers: z.record(z.string()).optional().describe('Request headers'),
        body: z.any().optional().describe('Request body'),
        timeout: z.number().optional().describe('Request timeout in milliseconds')
    });

    const defaultExecute = async ({ input }: { input: any }) => {
        const url = config.baseUrl ? `${config.baseUrl}${input.url}` : input.url;
        const method = input.method || config.method || 'GET';
        const headers = { ...config.defaultHeaders, ...input.headers };
        
        // This would use fetch or similar HTTP client
        return {
            url,
            method,
            headers,
            status: 200,
            data: 'HTTP request executed successfully'
        };
    };

    return createTool({
        id: config.id,
        name: config.name,
        description: config.description,
        inputSchema,
        execute: config.execute || defaultExecute
    });
}

/**
 * Creates a validation tool
 */
export function createValidationTool<T>(config: {
    id: string;
    name: string;
    description: string;
    schema: z.ZodType<T>;
    onValid?: (data: T) => Promise<any> | any;
    onInvalid?: (errors: string[]) => Promise<any> | any;
}): Tool {
    return createTool({
        id: config.id,
        name: config.name,
        description: config.description,
        inputSchema: z.object({
            data: z.any().describe('Data to validate')
        }),
        execute: async ({ input }) => {
            try {
                const validatedData = config.schema.parse(input.data);
                const result = config.onValid ? await config.onValid(validatedData) : validatedData;
                
                return {
                    valid: true,
                    data: result,
                    errors: []
                };
            } catch (error) {
                if (error instanceof z.ZodError) {
                    const errors = error.issues.map(issue => 
                        `${issue.path.join('.')}: ${issue.message}`
                    );
                    
                    const result = config.onInvalid ? await config.onInvalid(errors) : null;
                    
                    return {
                        valid: false,
                        data: result,
                        errors
                    };
                }
                
                throw error;
            }
        }
    });
}

/**
 * Creates a transformation tool
 */
export function createTransformTool<TInput, TOutput>(config: {
    id: string;
    name: string;
    description: string;
    inputSchema: z.ZodType<TInput>;
    outputSchema?: z.ZodType<TOutput>;
    transform: (input: TInput, context?: Record<string, any>) => Promise<TOutput> | TOutput;
}): Tool<TInput, TOutput> {
    return createTool({
        id: config.id,
        name: config.name,
        description: config.description,
        inputSchema: config.inputSchema,
        outputSchema: config.outputSchema,
        execute: async ({ input, context }) => {
            return await config.transform(input, context);
        }
    });
}

/**
 * Utility to convert multiple tools to OpenAI format
 */
export function toolsToOpenAIFormat(tools: Tool[]): OpenAITool[] {
    return tools.map(tool => tool.toOpenAITool());
}

/**
 * Utility to execute a tool with validation
 */
export async function executeTool<TInput, TOutput>(
    tool: Tool<TInput, TOutput>,
    input: unknown,
    context?: Record<string, any>,
    agent?: any
): Promise<TOutput> {
    // Validate input
    const validatedInput = tool.validateInput(input);
    
    // Execute with timeout if specified
    let result: TOutput;
    
    if (tool.timeout) {
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error(`Tool execution timeout: ${tool.id}`)), tool.timeout);
        });
        
        const executionPromise = Promise.resolve(tool.execute({
            input: validatedInput,
            context,
            agent
        }));
        
        result = await Promise.race([executionPromise, timeoutPromise]);
    } else {
        result = await tool.execute({
            input: validatedInput,
            context,
            agent
        });
    }
    
    // Validate output if schema is provided
    if (tool.validateOutput) {
        return tool.validateOutput(result);
    }
    
    return result;
}
