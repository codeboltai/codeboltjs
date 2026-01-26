/**
 * KG Template List Tool - Lists all knowledge graph instance templates
 * Wraps the SDK's knowledgeGraph.listInstanceTemplates() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import knowledgeGraph from '../../modules/knowledgeGraph';

/**
 * Parameters for the KGTemplateList tool
 */
export interface KGTemplateListToolParams {
    // No parameters needed - lists all templates
}

class KGTemplateListToolInvocation extends BaseToolInvocation<
    KGTemplateListToolParams,
    ToolResult
> {
    constructor(params: KGTemplateListToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await knowledgeGraph.listInstanceTemplates();

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error listing instance templates: ${errorMsg}`,
                    returnDisplay: `Error listing instance templates: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const templates = response.data || [];
            const templateList = templates.map(t => `- ${t.name} (ID: ${t.id})`).join('\n');

            return {
                llmContent: templates.length > 0
                    ? `Found ${templates.length} instance template(s):\n${templateList}\n\nFull data: ${JSON.stringify(templates, null, 2)}`
                    : 'No instance templates found.',
                returnDisplay: `Listed ${templates.length} instance template(s)`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error listing instance templates: ${errorMessage}`,
                returnDisplay: `Error listing instance templates: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the KGTemplateList tool logic
 */
export class KGTemplateListTool extends BaseDeclarativeTool<
    KGTemplateListToolParams,
    ToolResult
> {
    static readonly Name: string = 'kg_template_list';

    constructor() {
        super(
            KGTemplateListTool.Name,
            'KGTemplateList',
            `Lists all knowledge graph instance templates. Returns information about all available templates including their names, IDs, and schemas.`,
            Kind.Read,
            {
                properties: {},
                required: [],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: KGTemplateListToolParams,
    ): ToolInvocation<KGTemplateListToolParams, ToolResult> {
        return new KGTemplateListToolInvocation(params);
    }
}
