import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import knowledgeGraph from '../../modules/knowledgeGraph';
import type { CreateKGEdgeParams } from '../../types/knowledgeGraph';

export interface KGAddEdgeParams {
    instanceId: string;
    edge: CreateKGEdgeParams;
}

class KGAddEdgeInvocation extends BaseToolInvocation<KGAddEdgeParams, ToolResult> {
    constructor(params: KGAddEdgeParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await knowledgeGraph.addEdge(this.params.instanceId, this.params.edge);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `Edge added: ${JSON.stringify(response.data)}`,
                returnDisplay: `Added edge to instance: ${this.params.instanceId}`,
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

export class KGAddEdgeTool extends BaseDeclarativeTool<KGAddEdgeParams, ToolResult> {
    constructor() {
        super('kg_add_edge', 'Add KG Edge', 'Add an edge to a knowledge graph instance', Kind.Other, {
            type: 'object',
            properties: {
                instanceId: { type: 'string', description: 'Instance ID' },
                edge: { 
                    type: 'object',
                    description: 'Edge data',
                },
            },
            required: ['instanceId', 'edge'],
        });
    }

    protected override createInvocation(params: KGAddEdgeParams): ToolInvocation<KGAddEdgeParams, ToolResult> {
        return new KGAddEdgeInvocation(params);
    }
}
