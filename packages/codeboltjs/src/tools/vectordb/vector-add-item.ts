/**
 * Vector Add Item Tool - Adds an item to the vector database
 * Wraps the SDK's VectorDB.addVectorItem() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import VectorDB from '../../modules/vectordb';

/**
 * Parameters for the VectorAddItem tool
 */
export interface VectorAddItemToolParams {
    /**
     * The item to add to the vector database
     */
    item: any;
}

class VectorAddItemToolInvocation extends BaseToolInvocation<
    VectorAddItemToolParams,
    ToolResult
> {
    constructor(params: VectorAddItemToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await VectorDB.addVectorItem(this.params.item);

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error adding item to vector database: ${errorMsg}`,
                    returnDisplay: `Error adding item to vector database: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully added item to vector database.\n\n${JSON.stringify(response, null, 2)}`,
                returnDisplay: `Successfully added item to vector database`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error adding item to vector database: ${errorMessage}`,
                returnDisplay: `Error adding item to vector database: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the VectorAddItem tool logic
 */
export class VectorAddItemTool extends BaseDeclarativeTool<
    VectorAddItemToolParams,
    ToolResult
> {
    static readonly Name: string = 'vector_add_item';

    constructor() {
        super(
            VectorAddItemTool.Name,
            'VectorAddItem',
            'Adds a new item to the vector database.',
            Kind.Edit,
            {
                properties: {
                    item: {
                        description: 'The item to add to the vector database. Can be any valid value.',
                    },
                },
                required: ['item'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: VectorAddItemToolParams,
    ): string | null {
        if (params.item === undefined) {
            return "The 'item' parameter is required.";
        }

        return null;
    }

    protected createInvocation(
        params: VectorAddItemToolParams,
    ): ToolInvocation<VectorAddItemToolParams, ToolResult> {
        return new VectorAddItemToolInvocation(params);
    }
}
