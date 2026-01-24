import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import knowledgeGraph from '../../modules/knowledgeGraph';

export interface KGGetViewTemplateParams {
    templateId: string;
}

class KGGetViewTemplateInvocation extends BaseToolInvocation<KGGetViewTemplateParams, ToolResult> {
    constructor(params: KGGetViewTemplateParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await knowledgeGraph.getViewTemplate(this.params.templateId);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `View template retrieved: ${JSON.stringify(response.data)}`,
                returnDisplay: `Retrieved view template: ${this.params.templateId}`,
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

export class KGGetViewTemplateTool extends BaseDeclarativeTool<KGGetViewTemplateParams, ToolResult> {
    constructor() {
        super('kg_get_view_template', 'Get KG View Template', 'Get a view template by ID', Kind.Other, {
            type: 'object',
            properties: {
                templateId: { type: 'string', description: 'Template ID' },
            },
            required: ['templateId'],
        });
    }

    protected override createInvocation(params: KGGetViewTemplateParams): ToolInvocation<KGGetViewTemplateParams, ToolResult> {
        return new KGGetViewTemplateInvocation(params);
    }
}
