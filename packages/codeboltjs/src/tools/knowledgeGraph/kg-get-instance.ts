import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import knowledgeGraph from '../../modules/knowledgeGraph';

export interface KGGetInstanceParams {
    instanceId: string;
}

class KGGetInstanceInvocation extends BaseToolInvocation<KGGetInstanceParams, ToolResult> {
    constructor(params: KGGetInstanceParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await knowledgeGraph.getInstance(this.params.instanceId);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `Knowledge graph instance retrieved: ${JSON.stringify(response.data)}`,
                returnDisplay: `Retrieved KG instance: ${this.params.instanceId}`,
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

export class KGGetInstanceTool extends BaseDeclarativeTool<KGGetInstanceParams, ToolResult> {
    constructor() {
        super('kg_get_instance', 'Get KG Instance', 'Get a knowledge graph instance by ID', Kind.Other, {
            type: 'object',
            properties: {
                instanceId: { type: 'string', description: 'Instance ID' },
            },
            required: ['instanceId'],
        });
    }

    protected override createInvocation(params: KGGetInstanceParams): ToolInvocation<KGGetInstanceParams, ToolResult> {
        return new KGGetInstanceInvocation(params);
    }
}
