import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import knowledgeGraph from '../../modules/knowledgeGraph';
import type { ListKGEdgesParams } from '../../types/knowledgeGraph';

export interface KGListEdgesParams {
    instanceId: string;
    filters?: ListKGEdgesParams;
}

class KGListEdgesInvocation extends BaseToolInvocation<KGListEdgesParams, ToolResult> {
    constructor(params: KGListEdgesParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await knowledgeGraph.listEdges(this.params.instanceId, this.params.filters);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const edges = response.data || [];
            return {
                llmContent: `Found ${edges.length} edges: ${JSON.stringify(edges)}`,
                returnDisplay: `Listed ${edges.length} edges`,
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

export class KGListEdgesTool extends BaseDeclarativeTool<KGListEdgesParams, ToolResult> {
    constructor() {
        super('kg_list_edges', 'List KG Edges', 'List edges in a knowledge graph instance', Kind.Other, {
            type: 'object',
            properties: {
                instanceId: { type: 'string', description: 'Instance ID' },
                filters: { 
                    type: 'object',
                    description: 'Optional filters',
                },
            },
            required: ['instanceId'],
        });
    }

    protected override createInvocation(params: KGListEdgesParams): ToolInvocation<KGListEdgesParams, ToolResult> {
        return new KGListEdgesInvocation(params);
    }
}
