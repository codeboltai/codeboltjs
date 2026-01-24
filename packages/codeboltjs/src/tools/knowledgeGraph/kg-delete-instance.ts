import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import knowledgeGraph from '../../modules/knowledgeGraph';

export interface KGDeleteInstanceParams {
    instanceId: string;
}

class KGDeleteInstanceInvocation extends BaseToolInvocation<KGDeleteInstanceParams, ToolResult> {
    constructor(params: KGDeleteInstanceParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await knowledgeGraph.deleteInstance(this.params.instanceId);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `Knowledge graph instance deleted: ${this.params.instanceId}`,
                returnDisplay: `Deleted KG instance: ${this.params.instanceId}`,
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

export class KGDeleteInstanceTool extends BaseDeclarativeTool<KGDeleteInstanceParams, ToolResult> {
    constructor() {
        super('kg_delete_instance', 'Delete KG Instance', 'Delete a knowledge graph instance', Kind.Other, {
            type: 'object',
            properties: {
                instanceId: { type: 'string', description: 'Instance ID' },
            },
            required: ['instanceId'],
        });
    }

    protected override createInvocation(params: KGDeleteInstanceParams): ToolInvocation<KGDeleteInstanceParams, ToolResult> {
        return new KGDeleteInstanceInvocation(params);
    }
}
