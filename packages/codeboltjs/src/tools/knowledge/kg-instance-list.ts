/**
 * KG Instance List Tool - Lists knowledge graph instances
 * Wraps the SDK's knowledgeGraph.listInstances() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import knowledgeGraph from '../../modules/knowledgeGraph';

/**
 * Parameters for the KGInstanceList tool
 */
export interface KGInstanceListToolParams {
    /**
     * Optional template ID to filter instances by
     */
    template_id?: string;
}

class KGInstanceListToolInvocation extends BaseToolInvocation<
    KGInstanceListToolParams,
    ToolResult
> {
    constructor(params: KGInstanceListToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await knowledgeGraph.listInstances(this.params.template_id);

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error listing instances: ${errorMsg}`,
                    returnDisplay: `Error listing instances: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const instances = response.data || [];
            const instanceList = instances.map(i => `- ${i.name} (ID: ${i.id}, Template: ${i.templateId})`).join('\n');

            const filterInfo = this.params.template_id
                ? ` (filtered by template: ${this.params.template_id})`
                : '';

            return {
                llmContent: instances.length > 0
                    ? `Found ${instances.length} instance(s)${filterInfo}:\n${instanceList}\n\nFull data: ${JSON.stringify(instances, null, 2)}`
                    : `No instances found${filterInfo}.`,
                returnDisplay: `Listed ${instances.length} instance(s)`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error listing instances: ${errorMessage}`,
                returnDisplay: `Error listing instances: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the KGInstanceList tool logic
 */
export class KGInstanceListTool extends BaseDeclarativeTool<
    KGInstanceListToolParams,
    ToolResult
> {
    static readonly Name: string = 'kg_instance_list';

    constructor() {
        super(
            KGInstanceListTool.Name,
            'KGInstanceList',
            `Lists knowledge graph instances, optionally filtered by template ID. Returns information about all matching instances.`,
            Kind.Read,
            {
                properties: {
                    template_id: {
                        description: 'Optional template ID to filter instances by',
                        type: 'string',
                    },
                },
                required: [],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: KGInstanceListToolParams,
    ): ToolInvocation<KGInstanceListToolParams, ToolResult> {
        return new KGInstanceListToolInvocation(params);
    }
}
