/**
 * KG Template Get Tool - Gets a knowledge graph instance template by ID
 * Wraps the SDK's knowledgeGraph.getInstanceTemplate() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import knowledgeGraph from '../../modules/knowledgeGraph';

/**
 * Parameters for the KGTemplateGet tool
 */
export interface KGTemplateGetToolParams {
    /**
     * The ID of the template to retrieve
     */
    template_id: string;
}

class KGTemplateGetToolInvocation extends BaseToolInvocation<
    KGTemplateGetToolParams,
    ToolResult
> {
    constructor(params: KGTemplateGetToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await knowledgeGraph.getInstanceTemplate(this.params.template_id);

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error getting instance template: ${errorMsg}`,
                    returnDisplay: `Error getting instance template: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const template = response.data;
            if (!template) {
                return {
                    llmContent: `Instance template with ID "${this.params.template_id}" not found.`,
                    returnDisplay: `Template not found: ${this.params.template_id}`,
                    error: {
                        message: 'Template not found',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Instance template "${template.name}" (ID: ${template.id}):\n${JSON.stringify(template, null, 2)}`,
                returnDisplay: `Retrieved instance template: ${template.name}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting instance template: ${errorMessage}`,
                returnDisplay: `Error getting instance template: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the KGTemplateGet tool logic
 */
export class KGTemplateGetTool extends BaseDeclarativeTool<
    KGTemplateGetToolParams,
    ToolResult
> {
    static readonly Name: string = 'kg_template_get';

    constructor() {
        super(
            KGTemplateGetTool.Name,
            'KGTemplateGet',
            `Gets a knowledge graph instance template by its ID. Returns the full template definition including record kinds and edge types.`,
            Kind.Read,
            {
                properties: {
                    template_id: {
                        description: 'The ID of the template to retrieve',
                        type: 'string',
                    },
                },
                required: ['template_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: KGTemplateGetToolParams,
    ): string | null {
        if (!params.template_id || params.template_id.trim() === '') {
            return "The 'template_id' parameter must be non-empty.";
        }

        return null;
    }

    protected createInvocation(
        params: KGTemplateGetToolParams,
    ): ToolInvocation<KGTemplateGetToolParams, ToolResult> {
        return new KGTemplateGetToolInvocation(params);
    }
}
