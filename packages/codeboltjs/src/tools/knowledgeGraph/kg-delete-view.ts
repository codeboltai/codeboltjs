import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import knowledgeGraph from '../../modules/knowledgeGraph';

export interface KGDeleteViewParams {
    viewId: string;
}

class KGDeleteViewInvocation extends BaseToolInvocation<KGDeleteViewParams, ToolResult> {
    constructor(params: KGDeleteViewParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await knowledgeGraph.deleteView(this.params.viewId);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `View deleted: ${this.params.viewId}`,
                returnDisplay: `Deleted view: ${this.params.viewId}`,
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

export class KGDeleteViewTool extends BaseDeclarativeTool<KGDeleteViewParams, ToolResult> {
    constructor() {
        super('kg_delete_view', 'Delete KG View', 'Delete a knowledge graph view', Kind.Other, {
            type: 'object',
            properties: {
                viewId: { type: 'string', description: 'View ID' },
            },
            required: ['viewId'],
        });
    }

    protected override createInvocation(params: KGDeleteViewParams): ToolInvocation<KGDeleteViewParams, ToolResult> {
        return new KGDeleteViewInvocation(params);
    }
}
