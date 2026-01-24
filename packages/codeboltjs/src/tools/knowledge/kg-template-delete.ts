/**
 * KG Template Delete Tool - Deletes a knowledge graph instance template
 * Wraps the SDK's knowledgeGraph.deleteInstanceTemplate() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import knowledgeGraph from '../../modules/knowledgeGraph';

/**
 * Parameters for the KGTemplateDelete tool
 */
export interface KGTemplateDeleteToolParams {
    /**
     * The ID of the template to delete
     */
    template_id: string;
}

class KGTemplateDeleteToolInvocation extends BaseToolInvocation<
    KGTemplateDeleteToolParams,
    ToolResult
> {
    constructor(params: KGTemplateDeleteToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await knowledgeGraph.deleteInstanceTemplate(this.params.template_id);

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error deleting instance template: ${errorMsg}`,
                    returnDisplay: `Error deleting instance template: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully deleted instance template with ID: ${this.params.template_id}`,
                returnDisplay: `Deleted instance template: ${this.params.template_id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error deleting instance template: ${errorMessage}`,
                returnDisplay: `Error deleting instance template: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the KGTemplateDelete tool logic
 */
export class KGTemplateDeleteTool extends BaseDeclarativeTool<
    KGTemplateDeleteToolParams,
    ToolResult
> {
    static readonly Name: string = 'kg_template_delete';

    constructor() {
        super(
            KGTemplateDeleteTool.Name,
            'KGTemplateDelete',
            `Deletes a knowledge graph instance template by its ID. This will permanently remove the template. Use with caution.`,
            Kind.Delete,
            {
                properties: {
                    template_id: {
                        description: 'The ID of the template to delete',
                        type: 'string',
                    },
                },
                required: ['template_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: KGTemplateDeleteToolParams,
    ): string | null {
        if (!params.template_id || params.template_id.trim() === '') {
            return "The 'template_id' parameter must be non-empty.";
        }

        return null;
    }

    protected createInvocation(
        params: KGTemplateDeleteToolParams,
    ): ToolInvocation<KGTemplateDeleteToolParams, ToolResult> {
        return new KGTemplateDeleteToolInvocation(params);
    }
}
