import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import knowledgeGraph from '../../modules/knowledgeGraph';
import type { CreateKGInstanceTemplateParams } from '../../types/knowledgeGraph';

export interface KGCreateInstanceTemplateParams {
    config: CreateKGInstanceTemplateParams;
}

class KGCreateInstanceTemplateInvocation extends BaseToolInvocation<KGCreateInstanceTemplateParams, ToolResult> {
    constructor(params: KGCreateInstanceTemplateParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await knowledgeGraph.createInstanceTemplate(this.params.config);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `Instance template created: ${JSON.stringify(response.data)}`,
                returnDisplay: `Created instance template: ${response.data?.id || 'unknown'}`,
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

export class KGCreateInstanceTemplateTool extends BaseDeclarativeTool<KGCreateInstanceTemplateParams, ToolResult> {
    constructor() {
        super('kg_create_instance_template', 'Create KG Instance Template', 'Create a new knowledge graph instance template', Kind.Other, {
            type: 'object',
            properties: {
                config: { 
                    type: 'object',
                    description: 'Template configuration',
                },
            },
            required: ['config'],
        });
    }

    protected override createInvocation(params: KGCreateInstanceTemplateParams): ToolInvocation<KGCreateInstanceTemplateParams, ToolResult> {
        return new KGCreateInstanceTemplateInvocation(params);
    }
}
