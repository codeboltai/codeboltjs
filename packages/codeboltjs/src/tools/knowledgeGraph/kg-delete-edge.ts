import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import knowledgeGraph from '../../modules/knowledgeGraph';

export interface KGDeleteEdgeParams {
    instanceId: string;
    edgeId: string;
}

class KGDeleteEdgeInvocation extends BaseToolInvocation<KGDeleteEdgeParams, ToolResult> {
    constructor(params: KGDeleteEdgeParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await knowledgeGraph.deleteEdge(this.params.instanceId, this.params.edgeId);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `Edge deleted: ${this.params.edgeId}`,
                returnDisplay: `Deleted edge: ${this.params.edgeId}`,
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

export class KGDeleteEdgeTool extends BaseDeclarativeTool<KGDeleteEdgeParams, ToolResult> {
    constructor() {
        super('kg_delete_edge', 'Delete KG Edge', 'Delete an edge from a knowledge graph instance', Kind.Other, {
            type: 'object',
            properties: {
                instanceId: { type: 'string', description: 'Instance ID' },
                edgeId: { type: 'string', description: 'Edge ID' },
            },
            required: ['instanceId', 'edgeId'],
        });
    }

    protected override createInvocation(params: KGDeleteEdgeParams): ToolInvocation<KGDeleteEdgeParams, ToolResult> {
        return new KGDeleteEdgeInvocation(params);
    }
}
