import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import knowledgeGraph from '../../modules/knowledgeGraph';
import type { CreateKGViewTemplateParams } from '../../types/knowledgeGraph';

export interface KGUpdateViewTemplateParams {
    templateId: string;
    updates: Partial<CreateKGViewTemplateParams>;
}

class KGUpdateViewTemplateInvocation extends BaseToolInvocation<KGUpdateViewTemplateParams, ToolResult> {
    constructor(params: KGUpdateViewTemplateParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await knowledgeGraph.updateViewTemplate(this.params.templateId, this.params.updates);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `View template updated: ${JSON.stringify(response.data)}`,
                returnDisplay: `Updated view template: ${this.params.templateId}`,
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

export class KGUpdateViewTemplateTool extends BaseDeclarativeTool<KGUpdateViewTemplateParams, ToolResult> {
    constructor() {
        super('kg_update_view_template', 'Update KG View Template', 'Update a view template', Kind.Other, {
            type: 'object',
            properties: {
                templateId: { type: 'string', description: 'Template ID' },
                updates: { type: 'object', description: 'Update parameters' },
            },
            required: ['templateId', 'updates'],
        });
    }

    protected override createInvocation(params: KGUpdateViewTemplateParams): ToolInvocation<KGUpdateViewTemplateParams, ToolResult> {
        return new KGUpdateViewTemplateInvocation(params);
    }
}
