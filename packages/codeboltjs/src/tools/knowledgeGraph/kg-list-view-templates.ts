import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import knowledgeGraph from '../../modules/knowledgeGraph';

export interface KGListViewTemplatesParams {
    applicableTemplateId?: string;
}

class KGListViewTemplatesInvocation extends BaseToolInvocation<KGListViewTemplatesParams, ToolResult> {
    constructor(params: KGListViewTemplatesParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await knowledgeGraph.listViewTemplates(this.params.applicableTemplateId);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const templates = response.data || [];
            return {
                llmContent: `Found ${templates.length} view templates: ${JSON.stringify(templates)}`,
                returnDisplay: `Listed ${templates.length} view templates`,
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

export class KGListViewTemplatesTool extends BaseDeclarativeTool<KGListViewTemplatesParams, ToolResult> {
    constructor() {
        super('kg_list_view_templates', 'List KG View Templates', 'List view templates', Kind.Other, {
            type: 'object',
            properties: {
                applicableTemplateId: { type: 'string', description: 'Optional filter by applicable template' },
            },
            required: [],
        });
    }

    protected override createInvocation(params: KGListViewTemplatesParams): ToolInvocation<KGListViewTemplatesParams, ToolResult> {
        return new KGListViewTemplatesInvocation(params);
    }
}
