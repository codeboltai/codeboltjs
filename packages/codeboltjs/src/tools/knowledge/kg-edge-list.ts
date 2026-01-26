/**
 * KG Edge List Tool - Lists edges in a knowledge graph instance
 * Wraps the SDK's knowledgeGraph.listEdges() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import knowledgeGraph from '../../modules/knowledgeGraph';
import type { ListKGEdgesParams } from '../../types/knowledgeGraph';

/**
 * Parameters for the KGEdgeList tool
 */
export interface KGEdgeListToolParams {
    /**
     * The ID of the instance to list edges from
     */
    instance_id: string;

    /**
     * Optional: Filter by edge kind
     */
    kind?: string;

    /**
     * Optional: Filter by source node ID
     */
    from_node_id?: string;

    /**
     * Optional: Filter by target node ID
     */
    to_node_id?: string;
}

class KGEdgeListToolInvocation extends BaseToolInvocation<
    KGEdgeListToolParams,
    ToolResult
> {
    constructor(params: KGEdgeListToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const filters: ListKGEdgesParams = {};
            if (this.params.kind) filters.kind = this.params.kind;
            if (this.params.from_node_id) filters.from_node_id = this.params.from_node_id;
            if (this.params.to_node_id) filters.to_node_id = this.params.to_node_id;

            const response = await knowledgeGraph.listEdges(this.params.instance_id, filters);

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error listing edges: ${errorMsg}`,
                    returnDisplay: `Error listing edges: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const edges = response.data || [];
            const edgeList = edges.map(e => `- ${e.kind}: ${e.from_node_id} -> ${e.to_node_id} (ID: ${e.id})`).join('\n');

            const filterInfo: string[] = [];
            if (this.params.kind) filterInfo.push(`kind: ${this.params.kind}`);
            if (this.params.from_node_id) filterInfo.push(`from: ${this.params.from_node_id}`);
            if (this.params.to_node_id) filterInfo.push(`to: ${this.params.to_node_id}`);
            const filterStr = filterInfo.length > 0 ? ` (${filterInfo.join(', ')})` : '';

            return {
                llmContent: edges.length > 0
                    ? `Found ${edges.length} edge(s) in instance ${this.params.instance_id}${filterStr}:\n${edgeList}\n\nFull data: ${JSON.stringify(edges, null, 2)}`
                    : `No edges found in instance ${this.params.instance_id}${filterStr}.`,
                returnDisplay: `Listed ${edges.length} edge(s)`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error listing edges: ${errorMessage}`,
                returnDisplay: `Error listing edges: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the KGEdgeList tool logic
 */
export class KGEdgeListTool extends BaseDeclarativeTool<
    KGEdgeListToolParams,
    ToolResult
> {
    static readonly Name: string = 'kg_edge_list';

    constructor() {
        super(
            KGEdgeListTool.Name,
            'KGEdgeList',
            `Lists edges (relationships) in a knowledge graph instance. Can filter by edge kind, source node, or target node.`,
            Kind.Read,
            {
                properties: {
                    instance_id: {
                        description: 'The ID of the instance to list edges from',
                        type: 'string',
                    },
                    kind: {
                        description: 'Optional: Filter by edge kind',
                        type: 'string',
                    },
                    from_node_id: {
                        description: 'Optional: Filter by source node ID',
                        type: 'string',
                    },
                    to_node_id: {
                        description: 'Optional: Filter by target node ID',
                        type: 'string',
                    },
                },
                required: ['instance_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: KGEdgeListToolParams,
    ): string | null {
        if (!params.instance_id || params.instance_id.trim() === '') {
            return "The 'instance_id' parameter must be non-empty.";
        }

        return null;
    }

    protected createInvocation(
        params: KGEdgeListToolParams,
    ): ToolInvocation<KGEdgeListToolParams, ToolResult> {
        return new KGEdgeListToolInvocation(params);
    }
}
