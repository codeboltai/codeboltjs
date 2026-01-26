/**
 * Vector Query Tool - Queries a single vector item from the vector database
 * Wraps the SDK's VectorDB.queryVectorItem() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import VectorDB from '../../modules/vectordb';

/**
 * Parameters for the VectorQuery tool
 */
export interface VectorQueryToolParams {
    /**
     * The key to query the vector item from
     */
    key: string;
}

class VectorQueryToolInvocation extends BaseToolInvocation<
    VectorQueryToolParams,
    ToolResult
> {
    constructor(params: VectorQueryToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await VectorDB.queryVectorItem(this.params.key);

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error querying vector item: ${errorMsg}`,
                    returnDisplay: `Error querying vector item: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully queried vector item for key "${this.params.key}".\n\n${JSON.stringify(response, null, 2)}`,
                returnDisplay: `Successfully queried vector item for key "${this.params.key}"`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error querying vector item: ${errorMessage}`,
                returnDisplay: `Error querying vector item: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the VectorQuery tool logic
 */
export class VectorQueryTool extends BaseDeclarativeTool<
    VectorQueryToolParams,
    ToolResult
> {
    static readonly Name: string = 'vector_query';

    constructor() {
        super(
            VectorQueryTool.Name,
            'VectorQuery',
            'Queries a vector item from the vector database based on the provided key.',
            Kind.Read,
            {
                properties: {
                    key: {
                        description: 'The key to query the vector item from the vector database.',
                        type: 'string',
                    },
                },
                required: ['key'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: VectorQueryToolParams,
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
        params: VectorQueryToolParams,
    ): ToolInvocation<VectorQueryToolParams, ToolResult> {
        return new VectorQueryToolInvocation(params);
    }
}
