/**
 * Persistent Memory Create Tool - Creates a new persistent memory configuration
 * Wraps the SDK's persistentMemory.create() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import persistentMemory from '../../modules/persistentMemory';

/**
 * Retrieval configuration for persistent memory
 */
export interface RetrievalConfigParams {
    source_type: 'vectordb' | 'kv' | 'eventlog' | 'kg';
    source_id: string;
    query_template?: string;
    limit?: number;
    filters?: Record<string, any>;
}

/**
 * Contribution configuration for persistent memory
 */
export interface ContributionConfigParams {
    format: 'text' | 'json' | 'markdown';
    template?: string;
    max_tokens?: number;
}

/**
 * Parameters for the PersistentMemoryCreate tool
 */
export interface PersistentMemoryCreateToolParams {
    /**
     * Optional ID for the memory (auto-generated if not provided)
     */
    id?: string;

    /**
     * Label/name for the persistent memory
     */
    label: string;

    /**
     * Optional description of the memory's purpose
     */
    description?: string;

    /**
     * Input scopes for when this memory should be activated
     */
    inputs_scope?: string[];

    /**
     * Additional variables for memory configuration
     */
    additional_variables?: Record<string, any>;

    /**
     * Retrieval configuration
     */
    retrieval: RetrievalConfigParams;

    /**
     * Contribution configuration
     */
    contribution: ContributionConfigParams;
}

class PersistentMemoryCreateToolInvocation extends BaseToolInvocation<
    PersistentMemoryCreateToolParams,
    ToolResult
> {
    constructor(params: PersistentMemoryCreateToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await persistentMemory.create({
                id: this.params.id,
                label: this.params.label,
                description: this.params.description,
                inputs_scope: this.params.inputs_scope,
                additional_variables: this.params.additional_variables,
                retrieval: this.params.retrieval,
                contribution: this.params.contribution,
            });

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Failed to create persistent memory';
                return {
                    llmContent: `Error creating persistent memory: ${errorMsg}`,
                    returnDisplay: `Error creating persistent memory: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const memory = response.data?.memory;
            const memoryInfo = memory
                ? `ID: ${memory.id}, Label: ${memory.label}, Status: ${memory.status}`
                : 'Memory created successfully';

            return {
                llmContent: JSON.stringify(response.data, null, 2),
                returnDisplay: `Successfully created persistent memory: ${memoryInfo}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error creating persistent memory: ${errorMessage}`,
                returnDisplay: `Error creating persistent memory: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the PersistentMemoryCreate tool logic
 */
export class PersistentMemoryCreateTool extends BaseDeclarativeTool<
    PersistentMemoryCreateToolParams,
    ToolResult
> {
    static readonly Name: string = 'persistent_memory_create';

    constructor() {
        super(
            PersistentMemoryCreateTool.Name,
            'PersistentMemoryCreate',
            `Creates a new persistent memory configuration. Persistent memories allow agents to store and retrieve information across sessions using various data sources like vector databases, key-value stores, event logs, or knowledge graphs.`,
            Kind.Edit,
            {
                properties: {
                    id: {
                        description: 'Optional unique identifier for the memory. If not provided, one will be auto-generated.',
                        type: 'string',
                    },
                    label: {
                        description: 'A human-readable label/name for the persistent memory.',
                        type: 'string',
                    },
                    description: {
                        description: 'Optional description explaining the purpose of this memory.',
                        type: 'string',
                    },
                    inputs_scope: {
                        description: 'Array of input scopes that determine when this memory should be activated.',
                        type: 'array',
                        items: { type: 'string' },
                    },
                    additional_variables: {
                        description: 'Additional variables for memory configuration as key-value pairs.',
                        type: 'object',
                    },
                    retrieval: {
                        description: 'Retrieval configuration specifying how to fetch data from the memory source.',
                        type: 'object',
                        properties: {
                            source_type: {
                                description: "Type of data source: 'vectordb', 'kv', 'eventlog', or 'kg'.",
                                type: 'string',
                                enum: ['vectordb', 'kv', 'eventlog', 'kg'],
                            },
                            source_id: {
                                description: 'Identifier of the data source to retrieve from.',
                                type: 'string',
                            },
                            query_template: {
                                description: 'Optional template for constructing queries.',
                                type: 'string',
                            },
                            limit: {
                                description: 'Maximum number of results to retrieve.',
                                type: 'number',
                            },
                            filters: {
                                description: 'Optional filters to apply during retrieval.',
                                type: 'object',
                            },
                        },
                        required: ['source_type', 'source_id'],
                    },
                    contribution: {
                        description: 'Contribution configuration specifying how retrieved data should be formatted.',
                        type: 'object',
                        properties: {
                            format: {
                                description: "Output format: 'text', 'json', or 'markdown'.",
                                type: 'string',
                                enum: ['text', 'json', 'markdown'],
                            },
                            template: {
                                description: 'Optional template for formatting the output.',
                                type: 'string',
                            },
                            max_tokens: {
                                description: 'Maximum number of tokens for the output.',
                                type: 'number',
                            },
                        },
                        required: ['format'],
                    },
                },
                required: ['label', 'retrieval', 'contribution'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: PersistentMemoryCreateToolParams,
    ): string | null {
        if (!params.label || params.label.trim() === '') {
            return "The 'label' parameter must be a non-empty string.";
        }

        if (!params.retrieval) {
            return "The 'retrieval' parameter is required.";
        }

        if (!params.retrieval.source_type) {
            return "The 'retrieval.source_type' parameter is required.";
        }

        const validSourceTypes = ['vectordb', 'kv', 'eventlog', 'kg'];
        if (!validSourceTypes.includes(params.retrieval.source_type)) {
            return `Invalid source_type: ${params.retrieval.source_type}. Must be one of: ${validSourceTypes.join(', ')}`;
        }

        if (!params.retrieval.source_id || params.retrieval.source_id.trim() === '') {
            return "The 'retrieval.source_id' parameter must be a non-empty string.";
        }

        if (!params.contribution) {
            return "The 'contribution' parameter is required.";
        }

        if (!params.contribution.format) {
            return "The 'contribution.format' parameter is required.";
        }

        const validFormats = ['text', 'json', 'markdown'];
        if (!validFormats.includes(params.contribution.format)) {
            return `Invalid format: ${params.contribution.format}. Must be one of: ${validFormats.join(', ')}`;
        }

        return null;
    }

    protected createInvocation(
        params: PersistentMemoryCreateToolParams,
    ): ToolInvocation<PersistentMemoryCreateToolParams, ToolResult> {
        return new PersistentMemoryCreateToolInvocation(params);
    }
}
