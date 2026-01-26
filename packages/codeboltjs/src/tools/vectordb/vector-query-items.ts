/**
 * Vector Query Items Tool - Queries multiple vector items from the vector database
 * Wraps the SDK's VectorDB.queryVectorItems() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import VectorDB from '../../modules/vectordb';

/**
 * Parameters for the VectorQueryItems tool
 */
export interface VectorQueryItemsToolParams {
    /**
     * The array of items to query
     */
    items: any[];
    /**
     * The path to the vector database
     */
    db_path: string;
}

class VectorQueryItemsToolInvocation extends BaseToolInvocation<
    VectorQueryItemsToolParams,
    ToolResult
> {
    constructor(params: VectorQueryItemsToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await VectorDB.queryVectorItems(
                this.params.items as [],
                this.params.db_path
            );

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error querying vector items: ${errorMsg}`,
                    returnDisplay: `Error querying vector items: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully queried ${this.params.items.length} vector items from "${this.params.db_path}".\n\n${JSON.stringify(response, null, 2)}`,
                returnDisplay: `Successfully queried ${this.params.items.length} vector items`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error querying vector items: ${errorMessage}`,
                returnDisplay: `Error querying vector items: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the VectorQueryItems tool logic
 */
export class VectorQueryItemsTool extends BaseDeclarativeTool<
    VectorQueryItemsToolParams,
    ToolResult
> {
    static readonly Name: string = 'vector_query_items';

    constructor() {
        super(
            VectorQueryItemsTool.Name,
            'VectorQueryItems',
            'Queries multiple vector items from the vector database at the specified path.',
            Kind.Read,
            {
                properties: {
                    items: {
                        description: 'The array of items to query from the vector database.',
                        type: 'array',
                    },
                    db_path: {
                        description: 'The path to the vector database.',
                        type: 'string',
                    },
                },
                required: ['items', 'db_path'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: VectorQueryItemsToolParams,
    ): string | null {
        if (!params.items || !Array.isArray(params.items)) {
            return "The 'items' parameter must be an array.";
        }

        if (!params.db_path || typeof params.db_path !== 'string') {
            return "The 'db_path' parameter must be a non-empty string.";
        }

        if (params.db_path.trim().length === 0) {
            return "The 'db_path' parameter cannot be an empty string.";
        }

        return null;
    }

    protected createInvocation(
        params: VectorQueryItemsToolParams,
    ): ToolInvocation<VectorQueryItemsToolParams, ToolResult> {
        return new VectorQueryItemsToolInvocation(params);
    }
}
