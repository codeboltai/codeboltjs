import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import knowledgeGraph from '../../modules/knowledgeGraph';

export interface KGDeleteViewTemplateParams {
    templateId: string;
}

class KGDeleteViewTemplateInvocation extends BaseToolInvocation<KGDeleteViewTemplateParams, ToolResult> {
    constructor(params: KGDeleteViewTemplateParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await knowledgeGraph.deleteViewTemplate(this.params.templateId);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `View template deleted: ${this.params.templateId}`,
                returnDisplay: `Deleted view template: ${this.params.templateId}`,
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

export class KGDeleteViewTemplateTool extends BaseDeclarativeTool<KGDeleteViewTemplateParams, ToolResult> {
    constructor() {
        super('kg_delete_view_template', 'Delete KG View Template', 'Delete a view template', Kind.Other, {
            type: 'object',
            properties: {
                templateId: { type: 'string', description: 'Template ID' },
            },
            required: ['templateId'],
        });
    }

    protected override createInvocation(params: KGDeleteViewTemplateParams): ToolInvocation<KGDeleteViewTemplateParams, ToolResult> {
        return new KGDeleteViewTemplateInvocation(params);
    }
}
