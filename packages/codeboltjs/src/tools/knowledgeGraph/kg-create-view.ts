import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import knowledgeGraph from '../../modules/knowledgeGraph';
import type { CreateKGViewParams } from '../../types/knowledgeGraph';

export interface KGCreateViewParams {
    config: CreateKGViewParams;
}

class KGCreateViewInvocation extends BaseToolInvocation<KGCreateViewParams, ToolResult> {
    constructor(params: KGCreateViewParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await knowledgeGraph.createView(this.params.config);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `View created: ${JSON.stringify(response.data)}`,
                returnDisplay: `Created view: ${response.data?.id || 'unknown'}`,
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

export class KGCreateViewTool extends BaseDeclarativeTool<KGCreateViewParams, ToolResult> {
    constructor() {
        super('kg_create_view', 'Create KG View', 'Create a knowledge graph view', Kind.Other, {
            type: 'object',
            properties: {
                config: { type: 'object', description: 'View configuration' },
            },
            required: ['config'],
        });
    }

    protected override createInvocation(params: KGCreateViewParams): ToolInvocation<KGCreateViewParams, ToolResult> {
        return new KGCreateViewInvocation(params);
    }
}
