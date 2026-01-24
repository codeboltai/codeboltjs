import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import knowledgeGraph from '../../modules/knowledgeGraph';

export interface KGListInstanceTemplatesParams {
    // No parameters needed
}

class KGListInstanceTemplatesInvocation extends BaseToolInvocation<KGListInstanceTemplatesParams, ToolResult> {
    constructor(params: KGListInstanceTemplatesParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await knowledgeGraph.listInstanceTemplates();
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const templates = response.data || [];
            return {
                llmContent: `Found ${templates.length} instance templates: ${JSON.stringify(templates)}`,
                returnDisplay: `Listed ${templates.length} instance templates`,
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

export class KGListInstanceTemplatesTool extends BaseDeclarativeTool<KGListInstanceTemplatesParams, ToolResult> {
    constructor() {
        super('kg_list_instance_templates', 'List KG Instance Templates', 'List all knowledge graph instance templates', Kind.Other, {
            type: 'object',
            properties: {},
            required: [],
        });
    }

    protected override createInvocation(params: KGListInstanceTemplatesParams): ToolInvocation<KGListInstanceTemplatesParams, ToolResult> {
        return new KGListInstanceTemplatesInvocation(params);
    }
}
