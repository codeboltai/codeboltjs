import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import knowledgeGraph from '../../modules/knowledgeGraph';

export interface KGExecuteViewParams {
    viewId: string;
}

class KGExecuteViewInvocation extends BaseToolInvocation<KGExecuteViewParams, ToolResult> {
    constructor(params: KGExecuteViewParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await knowledgeGraph.executeView(this.params.viewId);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `View executed: ${JSON.stringify(response.data)}`,
                returnDisplay: `Executed view: ${this.params.viewId}`,
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

export class KGExecuteViewTool extends BaseDeclarativeTool<KGExecuteViewParams, ToolResult> {
    constructor() {
        super('kg_execute_view', 'Execute KG View', 'Execute a knowledge graph view query', Kind.Other, {
            type: 'object',
            properties: {
                viewId: { type: 'string', description: 'View ID' },
            },
            required: ['viewId'],
        });
    }

    protected override createInvocation(params: KGExecuteViewParams): ToolInvocation<KGExecuteViewParams, ToolResult> {
        return new KGExecuteViewInvocation(params);
    }
}
