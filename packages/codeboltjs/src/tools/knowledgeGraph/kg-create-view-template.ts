import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import knowledgeGraph from '../../modules/knowledgeGraph';
import type { CreateKGViewTemplateParams } from '../../types/knowledgeGraph';

export interface KGCreateViewTemplateParams {
    config: CreateKGViewTemplateParams;
}

class KGCreateViewTemplateInvocation extends BaseToolInvocation<KGCreateViewTemplateParams, ToolResult> {
    constructor(params: KGCreateViewTemplateParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await knowledgeGraph.createViewTemplate(this.params.config);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `View template created: ${JSON.stringify(response.data)}`,
                returnDisplay: `Created view template: ${response.data?.id || 'unknown'}`,
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

export class KGCreateViewTemplateTool extends BaseDeclarativeTool<KGCreateViewTemplateParams, ToolResult> {
    constructor() {
        super('kg_create_view_template', 'Create KG View Template', 'Create a knowledge graph view template', Kind.Other, {
            type: 'object',
            properties: {
                config: { 
                    type: 'object',
                    description: 'View template configuration',
                },
            },
            required: ['config'],
        });
    }

    protected override createInvocation(params: KGCreateViewTemplateParams): ToolInvocation<KGCreateViewTemplateParams, ToolResult> {
        return new KGCreateViewTemplateInvocation(params);
    }
}
