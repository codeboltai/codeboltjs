/**
 * KG Instance Create Tool - Creates a new knowledge graph instance
 * Wraps the SDK's knowledgeGraph.createInstance() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import knowledgeGraph from '../../modules/knowledgeGraph';
import type { CreateKGInstanceParams } from '../../types/knowledgeGraph';

/**
 * Parameters for the KGInstanceCreate tool
 */
export interface KGInstanceCreateToolParams {
    /**
     * The ID of the template to use for this instance
     */
    template_id: string;

    /**
     * The name of the instance
     */
    name: string;

    /**
     * Optional description of the instance
     */
    description?: string;
}

class KGInstanceCreateToolInvocation extends BaseToolInvocation<
    KGInstanceCreateToolParams,
    ToolResult
> {
    constructor(params: KGInstanceCreateToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const config: CreateKGInstanceParams = {
                templateId: this.params.template_id,
                name: this.params.name,
                description: this.params.description,
            };

            const response = await knowledgeGraph.createInstance(config);

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error creating instance: ${errorMsg}`,
                    returnDisplay: `Error creating instance: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const instance = response.data;
            return {
                llmContent: `Successfully created knowledge graph instance "${this.params.name}" with ID: ${instance?.id}`,
                returnDisplay: `Created instance: ${this.params.name}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error creating instance: ${errorMessage}`,
                returnDisplay: `Error creating instance: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the KGInstanceCreate tool logic
 */
export class KGInstanceCreateTool extends BaseDeclarativeTool<
    KGInstanceCreateToolParams,
    ToolResult
> {
    static readonly Name: string = 'kg_instance_create';

    constructor() {
        super(
            KGInstanceCreateTool.Name,
            'KGInstanceCreate',
            `Creates a new knowledge graph instance based on a template. Instances are the actual storage containers for knowledge graph data (records and edges).`,
            Kind.Edit,
            {
                properties: {
                    template_id: {
                        description: 'The ID of the template to use for this instance',
                        type: 'string',
                    },
                    name: {
                        description: 'The name of the instance',
                        type: 'string',
                    },
                    description: {
                        description: 'Optional description of the instance',
                        type: 'string',
                    },
                },
                required: ['template_id', 'name'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: KGInstanceCreateToolParams,
    ): string | null {
        if (!params.template_id || params.template_id.trim() === '') {
            return "The 'template_id' parameter must be non-empty.";
        }

        if (!params.name || params.name.trim() === '') {
            return "The 'name' parameter must be non-empty.";
        }

        return null;
    }

    protected createInvocation(
        params: KGInstanceCreateToolParams,
    ): ToolInvocation<KGInstanceCreateToolParams, ToolResult> {
        return new KGInstanceCreateToolInvocation(params);
    }
}
