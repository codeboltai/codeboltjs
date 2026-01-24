import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import knowledgeGraph from '../../modules/knowledgeGraph';
import type { CreateKGInstanceParams } from '../../types/knowledgeGraph';

export interface KGCreateInstanceParams {
    config: CreateKGInstanceParams;
}

class KGCreateInstanceInvocation extends BaseToolInvocation<KGCreateInstanceParams, ToolResult> {
    constructor(params: KGCreateInstanceParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await knowledgeGraph.createInstance(this.params.config);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `Knowledge graph instance created: ${JSON.stringify(response.data)}`,
                returnDisplay: `Created KG instance: ${response.data?.id || 'unknown'}`,
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

export class KGCreateInstanceTool extends BaseDeclarativeTool<KGCreateInstanceParams, ToolResult> {
    constructor() {
        super('kg_create_instance', 'Create KG Instance', 'Create a new knowledge graph instance', Kind.Other, {
            type: 'object',
            properties: {
                config: { 
                    type: 'object',
                    description: 'Instance configuration',
                },
            },
            required: ['config'],
        });
    }

    protected override createInvocation(params: KGCreateInstanceParams): ToolInvocation<KGCreateInstanceParams, ToolResult> {
        return new KGCreateInstanceInvocation(params);
    }
}
