/**
 * Vector Get Tool - Retrieves a vector by key from the vector database
 * Wraps the SDK's VectorDB.getVector() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import VectorDB from '../../modules/vectordb';

/**
 * Parameters for the VectorGet tool
 */
export interface VectorGetToolParams {
    /**
     * The key of the vector to retrieve
     */
    key: string;
}

class VectorGetToolInvocation extends BaseToolInvocation<
    VectorGetToolParams,
    ToolResult
> {
    constructor(params: VectorGetToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await VectorDB.getVector(this.params.key);

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error retrieving vector: ${errorMsg}`,
                    returnDisplay: `Error retrieving vector: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully retrieved vector for key "${this.params.key}".\n\n${JSON.stringify(response, null, 2)}`,
                returnDisplay: `Successfully retrieved vector for key "${this.params.key}"`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error retrieving vector: ${errorMessage}`,
                returnDisplay: `Error retrieving vector: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the VectorGet tool logic
 */
export class VectorGetTool extends BaseDeclarativeTool<
    VectorGetToolParams,
    ToolResult
> {
    static readonly Name: string = 'vector_get';

    constructor() {
        super(
            VectorGetTool.Name,
            'VectorGet',
            'Retrieves a vector from the vector database based on the provided key.',
            Kind.Read,
            {
                properties: {
                    key: {
                        description: 'The key of the vector to retrieve from the vector database.',
                        type: 'string',
                    },
                },
                required: ['key'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: VectorGetToolParams,
    ): string | null {
        if (!params.key || typeof params.key !== 'string') {
            return "The 'key' parameter must be a non-empty string.";
        }

        if (params.key.trim().length === 0) {
            return "The 'key' parameter cannot be an empty string.";
        }

        return null;
    }

    protected createInvocation(
        params: VectorGetToolParams,
    ): ToolInvocation<VectorGetToolParams, ToolResult> {
        return new VectorGetToolInvocation(params);
    }
}
