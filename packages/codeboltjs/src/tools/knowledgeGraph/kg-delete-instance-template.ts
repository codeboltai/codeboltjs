import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import knowledgeGraph from '../../modules/knowledgeGraph';

export interface KGDeleteInstanceTemplateParams {
    templateId: string;
}

class KGDeleteInstanceTemplateInvocation extends BaseToolInvocation<KGDeleteInstanceTemplateParams, ToolResult> {
    constructor(params: KGDeleteInstanceTemplateParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await knowledgeGraph.deleteInstanceTemplate(this.params.templateId);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `Instance template deleted: ${this.params.templateId}`,
                returnDisplay: `Deleted instance template: ${this.params.templateId}`,
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

export class KGDeleteInstanceTemplateTool extends BaseDeclarativeTool<KGDeleteInstanceTemplateParams, ToolResult> {
    constructor() {
        super('kg_delete_instance_template', 'Delete KG Instance Template', 'Delete a knowledge graph instance template', Kind.Other, {
            type: 'object',
            properties: {
                templateId: { type: 'string', description: 'Template ID' },
            },
            required: ['templateId'],
        });
    }

    protected override createInvocation(params: KGDeleteInstanceTemplateParams): ToolInvocation<KGDeleteInstanceTemplateParams, ToolResult> {
        return new KGDeleteInstanceTemplateInvocation(params);
    }
}
