import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import knowledgeGraph from '../../modules/knowledgeGraph';
import type { CreateKGEdgeParams } from '../../types/knowledgeGraph';

export interface KGAddEdgesParams {
    instanceId: string;
    edges: CreateKGEdgeParams[];
}

class KGAddEdgesInvocation extends BaseToolInvocation<KGAddEdgesParams, ToolResult> {
    constructor(params: KGAddEdgesParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await knowledgeGraph.addEdges(this.params.instanceId, this.params.edges);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const edges = response.data || [];
            return {
                llmContent: `Added ${edges.length} edges: ${JSON.stringify(edges)}`,
                returnDisplay: `Added ${edges.length} edges to instance: ${this.params.instanceId}`,
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

export class KGAddEdgesTool extends BaseDeclarativeTool<KGAddEdgesParams, ToolResult> {
    constructor() {
        super('kg_add_edges', 'Add KG Edges', 'Add multiple edges to a knowledge graph instance', Kind.Other, {
            type: 'object',
            properties: {
                instanceId: { type: 'string', description: 'Instance ID' },
                edges: { 
                    type: 'array',
                    description: 'Array of edge data',
                    items: { type: 'object' },
                },
            },
            required: ['instanceId', 'edges'],
        });
    }

    protected override createInvocation(params: KGAddEdgesParams): ToolInvocation<KGAddEdgesParams, ToolResult> {
        return new KGAddEdgesInvocation(params);
    }
}
