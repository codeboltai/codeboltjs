/**
 * LLM Get Config Tool - Returns model configuration
 * Wraps the SDK's cbllm.getModelConfig() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbllm from '../../modules/llm';

/**
 * Parameters for the LLM Get Config tool
 */
export interface LLMGetConfigToolParams {
    /**
     * Optional model identifier. If not provided, returns default model config.
     */
    modelId?: string;
}

class LLMGetConfigToolInvocation extends BaseToolInvocation<
    LLMGetConfigToolParams,
    ToolResult
> {
    constructor(params: LLMGetConfigToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            // Call the SDK's llm module
            const response = await cbllm.getModelConfig(this.params.modelId);

            if (!response.success) {
                const errorMsg = response.error || 'Failed to get model configuration';
                return {
                    llmContent: `Error getting model config: ${errorMsg}`,
                    returnDisplay: `Error getting model config: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const configContent = JSON.stringify(response.config, null, 2);

            return {
                llmContent: configContent,
                returnDisplay: this.params.modelId
                    ? `Successfully retrieved config for model: ${this.params.modelId}`
                    : 'Successfully retrieved default model configuration',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting model config: ${errorMessage}`,
                returnDisplay: `Error getting model config: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the LLM Get Config tool logic
 */
export class LLMGetConfigTool extends BaseDeclarativeTool<
    LLMGetConfigToolParams,
    ToolResult
> {
    static readonly Name: string = 'llm_get_config';

    constructor() {
        super(
            LLMGetConfigTool.Name,
            'LLMGetConfig',
            `Gets the model configuration for a specific model or the default application model. If modelId is provided, returns configuration for that specific model. If modelId is not provided, returns the default application LLM configuration.`,
            Kind.Read,
            {
                properties: {
                    modelId: {
                        description:
                            'Optional model identifier. If not provided, returns the default application model configuration.',
                        type: 'string',
                    },
                },
                required: [],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: LLMGetConfigToolParams,
    ): string | null {
        if (params.modelId !== undefined && typeof params.modelId !== 'string') {
            return "The 'modelId' parameter must be a string.";
        }

        if (params.modelId !== undefined && params.modelId.trim() === '') {
            return "The 'modelId' parameter must be non-empty if provided.";
        }

        return null;
    }

    protected createInvocation(
        params: LLMGetConfigToolParams,
    ): ToolInvocation<LLMGetConfigToolParams, ToolResult> {
        return new LLMGetConfigToolInvocation(params);
    }
}
