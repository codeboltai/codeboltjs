import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import knowledgeGraph from '../../modules/knowledgeGraph';

export interface KGListViewsParams {
    instanceId: string;
}

class KGListViewsInvocation extends BaseToolInvocation<KGListViewsParams, ToolResult> {
    constructor(params: KGListViewsParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await knowledgeGraph.listViews(this.params.instanceId);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const views = response.data || [];
            return {
                llmContent: `Found ${views.length} views: ${JSON.stringify(views)}`,
                returnDisplay: `Listed ${views.length} views`,
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

export class KGListViewsTool extends BaseDeclarativeTool<KGListViewsParams, ToolResult> {
    constructor() {
        super('kg_list_views', 'List KG Views', 'List views for a knowledge graph instance', Kind.Other, {
            type: 'object',
            properties: {
                instanceId: { type: 'string', description: 'Instance ID' },
            },
            required: ['instanceId'],
        });
    }

    protected override createInvocation(params: KGListViewsParams): ToolInvocation<KGListViewsParams, ToolResult> {
        return new KGListViewsInvocation(params);
    }
}
