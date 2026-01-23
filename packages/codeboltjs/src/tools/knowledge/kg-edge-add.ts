/**
 * KG Edge Add Tool - Adds an edge to a knowledge graph instance
 * Wraps the SDK's knowledgeGraph.addEdge() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import knowledgeGraph from '../../modules/knowledgeGraph';
import type { CreateKGEdgeParams } from '../../types/knowledgeGraph';

/**
 * Parameters for the KGEdgeAdd tool
 */
export interface KGEdgeAddToolParams {
    /**
     * The ID of the instance to add the edge to
     */
    instance_id: string;

    /**
     * The kind/type of the edge (must match an edge_type in the template)
     */
    kind: string;

    /**
     * The ID of the source node (record)
     */
    from_node_id: string;

    /**
     * The ID of the target node (record)
     */
    to_node_id: string;

    /**
     * Optional: Additional attributes for the edge
     */
    attributes?: Record<string, any>;
}

class KGEdgeAddToolInvocation extends BaseToolInvocation<
    KGEdgeAddToolParams,
    ToolResult
> {
    constructor(params: KGEdgeAddToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const edge: CreateKGEdgeParams = {
                kind: this.params.kind,
                from_node_id: this.params.from_node_id,
                to_node_id: this.params.to_node_id,
                attributes: this.params.attributes,
            };

            const response = await knowledgeGraph.addEdge(this.params.instance_id, edge);

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error adding edge: ${errorMsg}`,
                    returnDisplay: `Error adding edge: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const addedEdge = response.data;
            return {
                llmContent: `Successfully added edge of kind "${this.params.kind}" with ID: ${addedEdge?.id}\nFrom: ${this.params.from_node_id} -> To: ${this.params.to_node_id}\n\nEdge data: ${JSON.stringify(addedEdge, null, 2)}`,
                returnDisplay: `Added edge: ${addedEdge?.id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error adding edge: ${errorMessage}`,
                returnDisplay: `Error adding edge: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the KGEdgeAdd tool logic
 */
export class KGEdgeAddTool extends BaseDeclarativeTool<
    KGEdgeAddToolParams,
    ToolResult
> {
    static readonly Name: string = 'kg_edge_add';

    constructor() {
        super(
            KGEdgeAddTool.Name,
            'KGEdgeAdd',
            `Adds an edge (relationship) between two records in a knowledge graph instance. Edges connect nodes and represent relationships defined by the template's edge types.`,
            Kind.Edit,
            {
                properties: {
                    instance_id: {
                        description: 'The ID of the instance to add the edge to',
                        type: 'string',
                    },
                    kind: {
                        description: 'The kind/type of the edge (must match an edge_type in the template)',
                        type: 'string',
                    },
                    from_node_id: {
                        description: 'The ID of the source node (record)',
                        type: 'string',
                    },
                    to_node_id: {
                        description: 'The ID of the target node (record)',
                        type: 'string',
                    },
                    attributes: {
                        description: 'Optional: Additional attributes for the edge as a JSON object',
                        type: 'object',
                    },
                },
                required: ['instance_id', 'kind', 'from_node_id', 'to_node_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: KGEdgeAddToolParams,
    ): string | null {
        if (!params.instance_id || params.instance_id.trim() === '') {
            return "The 'instance_id' parameter must be non-empty.";
        }

        if (!params.kind || params.kind.trim() === '') {
            return "The 'kind' parameter must be non-empty.";
        }

        if (!params.from_node_id || params.from_node_id.trim() === '') {
            return "The 'from_node_id' parameter must be non-empty.";
        }

        if (!params.to_node_id || params.to_node_id.trim() === '') {
            return "The 'to_node_id' parameter must be non-empty.";
        }

        return null;
    }

    protected createInvocation(
        params: KGEdgeAddToolParams,
    ): ToolInvocation<KGEdgeAddToolParams, ToolResult> {
        return new KGEdgeAddToolInvocation(params);
    }
}
