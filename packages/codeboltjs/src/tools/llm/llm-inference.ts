/**
 * LLM Inference Tool - Sends inference request to LLM
 * Wraps the SDK's cbllm.inference() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbllm from '../../modules/llm';

/**
 * Message object for LLM inference
 */
export interface LLMMessage {
    role: string;
    content: string;
}

/**
 * Tool definition for LLM
 */
export interface LLMTool {
    type: string;
    function: {
        name: string;
        description: string;
        parameters: Record<string, any>;
    };
}

/**
 * Parameters for the LLM Inference tool
 */
export interface LLMInferenceToolParams {
    /**
     * Array of conversation messages with role and content
     */
    messages: LLMMessage[];

    /**
     * Available tools for the model (optional)
     */
    tools?: LLMTool[];

    /**
     * How model should use tools (optional)
     */
    tool_choice?: string;

    /**
     * Maximum tokens to generate (optional)
     */
    max_tokens?: number;

    /**
     * Temperature for generation (optional)
     */
    temperature?: number;

    /**
     * Whether to stream response (optional)
     */
    stream?: boolean;

    /**
     * Role of the LLM (optional)
     */
    llmrole?: string;
}

class LLMInferenceToolInvocation extends BaseToolInvocation<
    LLMInferenceToolParams,
    ToolResult
> {
    constructor(params: LLMInferenceToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            // Call the SDK's llm module
            const response = await cbllm.inference(this.params as any);

            if (!response || !response.completion) {
                return {
                    llmContent: 'Error: No completion received from LLM',
                    returnDisplay: 'Error: No completion received from LLM',
                    error: {
                        message: 'No completion received from LLM',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const completionContent = JSON.stringify(response.completion, null, 2);

            return {
                llmContent: completionContent,
                returnDisplay: 'Successfully received LLM inference response',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error during LLM inference: ${errorMessage}`,
                returnDisplay: `Error during LLM inference: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the LLM Inference tool logic
 */
export class LLMInferenceTool extends BaseDeclarativeTool<
    LLMInferenceToolParams,
    ToolResult
> {
    static readonly Name: string = 'llm_inference';

    constructor() {
        super(
            LLMInferenceTool.Name,
            'LLMInference',
            `Sends an inference request to the LLM using OpenAI message format with tools support. The model is selected based on the provided llmrole. Returns the LLM's completion response.`,
            Kind.Execute,
            {
                properties: {
                    messages: {
                        description:
                            'Array of conversation messages. Each message should have a "role" (e.g., "user", "assistant", "system") and "content" (the message text).',
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                role: {
                                    type: 'string',
                                    description: 'The role of the message sender (e.g., "user", "assistant", "system")',
                                },
                                content: {
                                    type: 'string',
                                    description: 'The content of the message',
                                },
                            },
                            required: ['role', 'content'],
                        },
                    },
                    tools: {
                        description:
                            'Optional array of tools available for the model to use.',
                        type: 'array',
                        items: {
                            type: 'object',
                        },
                    },
                    tool_choice: {
                        description:
                            'Optional: How the model should use tools (e.g., "auto", "none", or a specific tool name).',
                        type: 'string',
                    },
                    max_tokens: {
                        description:
                            'Optional: Maximum number of tokens to generate in the response.',
                        type: 'number',
                    },
                    temperature: {
                        description:
                            'Optional: Temperature for response generation (0-2). Higher values make output more random.',
                        type: 'number',
                    },
                    stream: {
                        description:
                            'Optional: Whether to stream the response.',
                        type: 'boolean',
                    },
                    llmrole: {
                        description:
                            'Optional: Role of the LLM to determine which model to use.',
                        type: 'string',
                    },
                },
                required: ['messages'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: LLMInferenceToolParams,
    ): string | null {
        if (!params.messages || !Array.isArray(params.messages)) {
            return "The 'messages' parameter must be a non-empty array.";
        }

        if (params.messages.length === 0) {
            return "The 'messages' parameter must contain at least one message.";
        }

        for (let i = 0; i < params.messages.length; i++) {
            const msg = params.messages[i];
            if (!msg.role || typeof msg.role !== 'string') {
                return `Message at index ${i} must have a valid 'role' string.`;
            }
            if (msg.content === undefined || msg.content === null) {
                return `Message at index ${i} must have a 'content' property.`;
            }
        }

        if (params.max_tokens !== undefined && params.max_tokens <= 0) {
            return 'max_tokens must be a positive number';
        }

        if (params.temperature !== undefined && (params.temperature < 0 || params.temperature > 2)) {
            return 'temperature must be between 0 and 2';
        }

        return null;
    }

    protected createInvocation(
        params: LLMInferenceToolParams,
    ): ToolInvocation<LLMInferenceToolParams, ToolResult> {
        return new LLMInferenceToolInvocation(params);
    }
}
