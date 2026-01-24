/**
 * KG Instance Get Tool - Gets a knowledge graph instance by ID
 * Wraps the SDK's knowledgeGraph.getInstance() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import knowledgeGraph from '../../modules/knowledgeGraph';

/**
 * Parameters for the KGInstanceGet tool
 */
export interface KGInstanceGetToolParams {
    /**
     * The ID of the instance to retrieve
     */
    instance_id: string;
}

class KGInstanceGetToolInvocation extends BaseToolInvocation<
    KGInstanceGetToolParams,
    ToolResult
> {
    constructor(params: KGInstanceGetToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await knowledgeGraph.getInstance(this.params.instance_id);

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error getting instance: ${errorMsg}`,
                    returnDisplay: `Error getting instance: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const instance = response.data;
            if (!instance) {
                return {
                    llmContent: `Instance with ID "${this.params.instance_id}" not found.`,
                    returnDisplay: `Instance not found: ${this.params.instance_id}`,
                    error: {
                        message: 'Instance not found',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Instance "${instance.name}" (ID: ${instance.id}):\n${JSON.stringify(instance, null, 2)}`,
                returnDisplay: `Retrieved instance: ${instance.name}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting instance: ${errorMessage}`,
                returnDisplay: `Error getting instance: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the KGInstanceGet tool logic
 */
export class KGInstanceGetTool extends BaseDeclarativeTool<
    KGInstanceGetToolParams,
    ToolResult
> {
    static readonly Name: string = 'kg_instance_get';

    constructor() {
        super(
            KGInstanceGetTool.Name,
            'KGInstanceGet',
            `Gets a knowledge graph instance by its ID. Returns the full instance details including name, description, and template reference.`,
            Kind.Read,
            {
                properties: {
                    instance_id: {
                        description: 'The ID of the instance to retrieve',
                        type: 'string',
                    },
                },
                required: ['instance_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: KGInstanceGetToolParams,
    ): string | null {
        if (!params.instance_id || params.instance_id.trim() === '') {
            return "The 'instance_id' parameter must be non-empty.";
        }

        return null;
    }

    protected createInvocation(
        params: KGInstanceGetToolParams,
    ): ToolInvocation<KGInstanceGetToolParams, ToolResult> {
        return new KGInstanceGetToolInvocation(params);
    }
}
