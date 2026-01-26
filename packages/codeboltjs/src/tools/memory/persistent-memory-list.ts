/**
 * Persistent Memory List Tool - Lists all persistent memories
 * Wraps the SDK's persistentMemory.list() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import persistentMemory from '../../modules/persistentMemory';

/**
 * Parameters for the PersistentMemoryList tool
 */
export interface PersistentMemoryListToolParams {
    /**
     * Optional input scope to filter memories by
     */
    input_scope?: string;

    /**
     * If true, only return active memories
     */
    active_only?: boolean;
}

class PersistentMemoryListToolInvocation extends BaseToolInvocation<
    PersistentMemoryListToolParams,
    ToolResult
> {
    constructor(params: PersistentMemoryListToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await persistentMemory.list({
                inputScope: this.params.input_scope,
                activeOnly: this.params.active_only,
            });

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Failed to list persistent memories';
                return {
                    llmContent: `Error listing persistent memories: ${errorMsg}`,
                    returnDisplay: `Error listing persistent memories: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const memories = response.data?.memories || [];
            const count = memories.length;

            if (count === 0) {
                return {
                    llmContent: 'No persistent memories found.',
                    returnDisplay: 'No persistent memories found',
                };
            }

            // Create a summary of memories
            const memorySummaries = memories.map((m: any) => ({
                id: m.id,
                label: m.label,
                status: m.status,
                source_type: m.retrieval?.source_type,
                format: m.contribution?.format,
            }));

            return {
                llmContent: JSON.stringify(memorySummaries, null, 2),
                returnDisplay: `Found ${count} persistent ${count === 1 ? 'memory' : 'memories'}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error listing persistent memories: ${errorMessage}`,
                returnDisplay: `Error listing persistent memories: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the PersistentMemoryList tool logic
 */
export class PersistentMemoryListTool extends BaseDeclarativeTool<
    PersistentMemoryListToolParams,
    ToolResult
> {
    static readonly Name: string = 'persistent_memory_list';

    constructor() {
        super(
            PersistentMemoryListTool.Name,
            'PersistentMemoryList',
            `Lists all persistent memory configurations. Can optionally filter by input scope or to only show active memories. Returns a summary of each memory including ID, label, status, source type, and format.`,
            Kind.Read,
            {
                properties: {
                    input_scope: {
                        description: 'Optional input scope to filter memories by. Only memories with this scope will be returned.',
                        type: 'string',
                    },
                    active_only: {
                        description: "If true, only return memories with status 'active'. Defaults to false.",
                        type: 'boolean',
                    },
                },
                required: [],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: PersistentMemoryListToolParams,
    ): string | null {
        // All parameters are optional, no validation needed
        return null;
    }

    protected createInvocation(
        params: PersistentMemoryListToolParams,
    ): ToolInvocation<PersistentMemoryListToolParams, ToolResult> {
        return new PersistentMemoryListToolInvocation(params);
    }
}
