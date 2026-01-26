import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import knowledgeGraph from '../../modules/knowledgeGraph';
import type { CreateKGInstanceTemplateParams } from '../../types/knowledgeGraph';

export interface KGUpdateInstanceTemplateParams {
    templateId: string;
    updates: Partial<CreateKGInstanceTemplateParams>;
}

class KGUpdateInstanceTemplateInvocation extends BaseToolInvocation<KGUpdateInstanceTemplateParams, ToolResult> {
    constructor(params: KGUpdateInstanceTemplateParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await knowledgeGraph.updateInstanceTemplate(this.params.templateId, this.params.updates);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `Instance template updated: ${JSON.stringify(response.data)}`,
                returnDisplay: `Updated instance template: ${this.params.templateId}`,
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

export class KGUpdateInstanceTemplateTool extends BaseDeclarativeTool<KGUpdateInstanceTemplateParams, ToolResult> {
    constructor() {
        super('kg_update_instance_template', 'Update KG Instance Template', 'Update a knowledge graph instance template', Kind.Other, {
            type: 'object',
            properties: {
                templateId: { type: 'string', description: 'Template ID' },
                updates: { 
                    type: 'object',
                    description: 'Update parameters',
                },
            },
            required: ['templateId', 'updates'],
        });
    }

    protected override createInvocation(params: KGUpdateInstanceTemplateParams): ToolInvocation<KGUpdateInstanceTemplateParams, ToolResult> {
        return new KGUpdateInstanceTemplateInvocation(params);
    }
}
