/**
 * KG Template Create Tool - Creates a new knowledge graph instance template
 * Wraps the SDK's knowledgeGraph.createInstanceTemplate() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import knowledgeGraph from '../../modules/knowledgeGraph';
import type { CreateKGInstanceTemplateParams, KGRecordKind, KGEdgeType } from '../../types/knowledgeGraph';

/**
 * Parameters for the KGTemplateCreate tool
 */
export interface KGTemplateCreateToolParams {
    /**
     * The name of the template
     */
    name: string;

    /**
     * Optional description of the template
     */
    description?: string;

    /**
     * Array of record kinds defining the node types in the graph
     */
    record_kinds: KGRecordKind[];

    /**
     * Array of edge types defining the relationships in the graph
     */
    edge_types: KGEdgeType[];
}

class KGTemplateCreateToolInvocation extends BaseToolInvocation<
    KGTemplateCreateToolParams,
    ToolResult
> {
    constructor(params: KGTemplateCreateToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const config: CreateKGInstanceTemplateParams = {
                name: this.params.name,
                description: this.params.description,
                record_kinds: this.params.record_kinds,
                edge_types: this.params.edge_types,
            };

            const response = await knowledgeGraph.createInstanceTemplate(config);

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error creating instance template: ${errorMsg}`,
                    returnDisplay: `Error creating instance template: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const template = response.data;
            return {
                llmContent: `Successfully created instance template "${this.params.name}" with ID: ${template?.id}`,
                returnDisplay: `Created instance template: ${this.params.name}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error creating instance template: ${errorMessage}`,
                returnDisplay: `Error creating instance template: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the KGTemplateCreate tool logic
 */
export class KGTemplateCreateTool extends BaseDeclarativeTool<
    KGTemplateCreateToolParams,
    ToolResult
> {
    static readonly Name: string = 'kg_template_create';

    constructor() {
        super(
            KGTemplateCreateTool.Name,
            'KGTemplateCreate',
            `Creates a new knowledge graph instance template. Templates define the schema for knowledge graph instances including the types of records (nodes) and edges (relationships) that can be stored.`,
            Kind.Edit,
            {
                properties: {
                    name: {
                        description: 'The name of the template',
                        type: 'string',
                    },
                    description: {
                        description: 'Optional description of the template',
                        type: 'string',
                    },
                    record_kinds: {
                        description: 'Array of record kinds defining the node types in the graph',
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                name: { type: 'string' },
                                label: { type: 'string' },
                                description: { type: 'string' },
                                attributes: { type: 'object' },
                            },
                            required: ['name', 'label', 'attributes'],
                        },
                    },
                    edge_types: {
                        description: 'Array of edge types defining the relationships in the graph',
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                name: { type: 'string' },
                                label: { type: 'string' },
                                description: { type: 'string' },
                                from_kinds: { type: 'array', items: { type: 'string' } },
                                to_kinds: { type: 'array', items: { type: 'string' } },
                                attributes: { type: 'object' },
                            },
                            required: ['name', 'label', 'from_kinds', 'to_kinds'],
                        },
                    },
                },
                required: ['name', 'record_kinds', 'edge_types'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: KGTemplateCreateToolParams,
    ): string | null {
        if (!params.name || params.name.trim() === '') {
            return "The 'name' parameter must be non-empty.";
        }

        if (!params.record_kinds || params.record_kinds.length === 0) {
            return "The 'record_kinds' parameter must contain at least one record kind.";
        }

        if (!params.edge_types || params.edge_types.length === 0) {
            return "The 'edge_types' parameter must contain at least one edge type.";
        }

        return null;
    }

    protected createInvocation(
        params: KGTemplateCreateToolParams,
    ): ToolInvocation<KGTemplateCreateToolParams, ToolResult> {
        return new KGTemplateCreateToolInvocation(params);
    }
}
