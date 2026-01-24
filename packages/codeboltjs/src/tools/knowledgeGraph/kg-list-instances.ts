import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import knowledgeGraph from '../../modules/knowledgeGraph';

export interface KGListInstancesParams {
    templateId?: string;
}

class KGListInstancesInvocation extends BaseToolInvocation<KGListInstancesParams, ToolResult> {
    constructor(params: KGListInstancesParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await knowledgeGraph.listInstances(this.params.templateId);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const instances = response.data || [];
            return {
                llmContent: `Found ${instances.length} KG instances: ${JSON.stringify(instances)}`,
                returnDisplay: `Listed ${instances.length} KG instances`,
            };
        } catch (error) {
            return {
                llmContent: `Error: ${error}`,
                returnDisplay: `Error: ${error}`,
                error: { message: String(error), type: ToolErrorType.EXECUTION_FAILED },
            };
        }
    }
}

export class KGListInstancesTool extends BaseDeclarativeTool<KGListInstancesParams, ToolResult> {
    constructor() {
        super('kg_list_instances', 'List KG Instances', 'List knowledge graph instances, optionally filtered by template', Kind.Other, {
            type: 'object',
            properties: {
                templateId: { type: 'string', description: 'Optional template ID filter' },
            },
            required: [],
        });
    }

    protected override createInvocation(params: KGListInstancesParams): ToolInvocation<KGListInstancesParams, ToolResult> {
        return new KGListInstancesInvocation(params);
    }
}
