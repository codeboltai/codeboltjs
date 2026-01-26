/**
 * Persistent Memory Update Tool - Updates a persistent memory
 * Wraps the SDK's persistentMemory.update() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import persistentMemory from '../../modules/persistentMemory';

/**
 * Retrieval configuration for persistent memory updates
 */
export interface RetrievalConfigUpdateParams {
    source_type?: 'vectordb' | 'kv' | 'eventlog' | 'kg';
    source_id?: string;
    query_template?: string;
    limit?: number;
    filters?: Record<string, any>;
}

/**
 * Contribution configuration for persistent memory updates
 */
export interface ContributionConfigUpdateParams {
    format?: 'text' | 'json' | 'markdown';
    template?: string;
    max_tokens?: number;
}

/**
 * Parameters for the PersistentMemoryUpdate tool
 */
export interface PersistentMemoryUpdateToolParams {
    /**
     * The ID of the persistent memory to update
     */
    memory_id: string;

    /**
     * New label for the memory
     */
    label?: string;

    /**
     * New description for the memory
     */
    description?: string;

    /**
     * New status for the memory
     */
    status?: 'active' | 'disabled' | 'draft';

    /**
     * Updated input scopes
     */
    inputs_scope?: string[];

    /**
     * Updated additional variables
     */
    additional_variables?: Record<string, any>;

    /**
     * Updated retrieval configuration
     */
    retrieval?: RetrievalConfigUpdateParams;

    /**
     * Updated contribution configuration
     */
    contribution?: ContributionConfigUpdateParams;
}

class PersistentMemoryUpdateToolInvocation extends BaseToolInvocation<
    PersistentMemoryUpdateToolParams,
    ToolResult
> {
    constructor(params: PersistentMemoryUpdateToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const updates: any = {};

            if (this.params.label !== undefined) updates.label = this.params.label;
            if (this.params.description !== undefined) updates.description = this.params.description;
            if (this.params.status !== undefined) updates.status = this.params.status;
            if (this.params.inputs_scope !== undefined) updates.inputs_scope = this.params.inputs_scope;
            if (this.params.additional_variables !== undefined) updates.additional_variables = this.params.additional_variables;
            if (this.params.retrieval !== undefined) updates.retrieval = this.params.retrieval;
            if (this.params.contribution !== undefined) updates.contribution = this.params.contribution;

            const response = await persistentMemory.update(this.params.memory_id, updates);

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Failed to update persistent memory';
                return {
                    llmContent: `Error updating persistent memory: ${errorMsg}`,
                    returnDisplay: `Error updating persistent memory: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const memory = response.data?.memory;
            const memoryInfo = memory
                ? `ID: ${memory.id}, Label: ${memory.label}, Status: ${memory.status}`
                : 'Memory updated successfully';

            return {
                llmContent: JSON.stringify(response.data, null, 2),
                returnDisplay: `Successfully updated persistent memory: ${memoryInfo}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error updating persistent memory: ${errorMessage}`,
                returnDisplay: `Error updating persistent memory: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the PersistentMemoryUpdate tool logic
 */
export class PersistentMemoryUpdateTool extends BaseDeclarativeTool<
    PersistentMemoryUpdateToolParams,
    ToolResult
> {
    static readonly Name: string = 'persistent_memory_update';

    constructor() {
        super(
            PersistentMemoryUpdateTool.Name,
            'PersistentMemoryUpdate',
            `Updates an existing persistent memory configuration. You can update any combination of label, description, status, input scopes, additional variables, retrieval settings, or contribution settings.`,
            Kind.Edit,
            {
                properties: {
                    memory_id: {
                        description: 'The unique identifier of the persistent memory to update.',
                        type: 'string',
                    },
                    label: {
                        description: 'New label/name for the memory.',
                        type: 'string',
                    },
                    description: {
                        description: 'New description for the memory.',
                        type: 'string',
                    },
                    status: {
                        description: "New status for the memory: 'active', 'disabled', or 'draft'.",
                        type: 'string',
                        enum: ['active', 'disabled', 'draft'],
                    },
                    inputs_scope: {
                        description: 'Updated array of input scopes.',
                        type: 'array',
                        items: { type: 'string' },
                    },
                    additional_variables: {
                        description: 'Updated additional variables as key-value pairs.',
                        type: 'object',
                    },
                    retrieval: {
                        description: 'Updated retrieval configuration.',
                        type: 'object',
                        properties: {
                            source_type: {
                                description: "Type of data source: 'vectordb', 'kv', 'eventlog', or 'kg'.",
                                type: 'string',
                                enum: ['vectordb', 'kv', 'eventlog', 'kg'],
                            },
                            source_id: {
                                description: 'Identifier of the data source.',
                                type: 'string',
                            },
                            query_template: {
                                description: 'Template for constructing queries.',
                                type: 'string',
                            },
                            limit: {
                                description: 'Maximum number of results to retrieve.',
                                type: 'number',
                            },
                            filters: {
                                description: 'Filters to apply during retrieval.',
                                type: 'object',
                            },
                        },
                    },
                    contribution: {
                        description: 'Updated contribution configuration.',
                        type: 'object',
                        properties: {
                            format: {
                                description: "Output format: 'text', 'json', or 'markdown'.",
                                type: 'string',
                                enum: ['text', 'json', 'markdown'],
                            },
                            template: {
                                description: 'Template for formatting the output.',
                                type: 'string',
                            },
                            max_tokens: {
                                description: 'Maximum number of tokens for the output.',
                                type: 'number',
                            },
                        },
                    },
                },
                required: ['memory_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: PersistentMemoryUpdateToolParams,
    ): string | null {
        if (!params.memory_id || params.memory_id.trim() === '') {
            return "The 'memory_id' parameter must be a non-empty string.";
        }

        // Validate status if provided
        if (params.status !== undefined) {
            const validStatuses = ['active', 'disabled', 'draft'];
            if (!validStatuses.includes(params.status)) {
                return `Invalid status: ${params.status}. Must be one of: ${validStatuses.join(', ')}`;
            }
        }

        // Validate retrieval source_type if provided
        if (params.retrieval?.source_type !== undefined) {
            const validSourceTypes = ['vectordb', 'kv', 'eventlog', 'kg'];
            if (!validSourceTypes.includes(params.retrieval.source_type)) {
                return `Invalid retrieval.source_type: ${params.retrieval.source_type}. Must be one of: ${validSourceTypes.join(', ')}`;
            }
        }

        // Validate contribution format if provided
        if (params.contribution?.format !== undefined) {
            const validFormats = ['text', 'json', 'markdown'];
            if (!validFormats.includes(params.contribution.format)) {
                return `Invalid contribution.format: ${params.contribution.format}. Must be one of: ${validFormats.join(', ')}`;
            }
        }

        return null;
    }

    protected createInvocation(
        params: PersistentMemoryUpdateToolParams,
    ): ToolInvocation<PersistentMemoryUpdateToolParams, ToolResult> {
        return new PersistentMemoryUpdateToolInvocation(params);
    }
}
