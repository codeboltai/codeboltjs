/**
 * KG Instance Delete Tool - Deletes a knowledge graph instance
 * Wraps the SDK's knowledgeGraph.deleteInstance() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import knowledgeGraph from '../../modules/knowledgeGraph';

/**
 * Parameters for the KGInstanceDelete tool
 */
export interface KGInstanceDeleteToolParams {
    /**
     * The ID of the instance to delete
     */
    instance_id: string;
}

class KGInstanceDeleteToolInvocation extends BaseToolInvocation<
    KGInstanceDeleteToolParams,
    ToolResult
> {
    constructor(params: KGInstanceDeleteToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await knowledgeGraph.deleteInstance(this.params.instance_id);

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error deleting instance: ${errorMsg}`,
                    returnDisplay: `Error deleting instance: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully deleted instance with ID: ${this.params.instance_id}`,
                returnDisplay: `Deleted instance: ${this.params.instance_id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error deleting instance: ${errorMessage}`,
                returnDisplay: `Error deleting instance: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the KGInstanceDelete tool logic
 */
export class KGInstanceDeleteTool extends BaseDeclarativeTool<
    KGInstanceDeleteToolParams,
    ToolResult
> {
    static readonly Name: string = 'kg_instance_delete';

    constructor() {
        super(
            KGInstanceDeleteTool.Name,
            'KGInstanceDelete',
            `Deletes a knowledge graph instance by its ID. This will permanently remove the instance and all its records and edges. Use with caution.`,
            Kind.Delete,
            {
                properties: {
                    instance_id: {
                        description: 'The ID of the instance to delete',
                        type: 'string',
                    },
                },
                required: ['instance_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: KGInstanceDeleteToolParams,
    ): string | null {
        if (!params.instance_id || params.instance_id.trim() === '') {
            return "The 'instance_id' parameter must be non-empty.";
        }

        return null;
    }

    protected createInvocation(
        params: KGInstanceDeleteToolParams,
    ): ToolInvocation<KGInstanceDeleteToolParams, ToolResult> {
        return new KGInstanceDeleteToolInvocation(params);
    }
}
