/**
 * Persistent Memory Retrieve Tool - Executes retrieval query on persistent memory
 * Wraps the SDK's persistentMemory.executeRetrieval() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import persistentMemory from '../../modules/persistentMemory';

/**
 * Parameters for the PersistentMemoryRetrieve tool
 */
export interface PersistentMemoryRetrieveToolParams {
    /**
     * The ID of the persistent memory to query
     */
    memory_id: string;

    /**
     * Optional keywords for the retrieval query
     */
    keywords?: string[];

    /**
     * Optional action context for the query
     */
    action?: string;

    /**
     * Optional additional context for the query
     */
    context?: Record<string, any>;

    /**
     * Optional query string
     */
    query?: string;
}

class PersistentMemoryRetrieveToolInvocation extends BaseToolInvocation<
    PersistentMemoryRetrieveToolParams,
    ToolResult
> {
    constructor(params: PersistentMemoryRetrieveToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const intent: any = {};

            if (this.params.keywords !== undefined) intent.keywords = this.params.keywords;
            if (this.params.action !== undefined) intent.action = this.params.action;
            if (this.params.context !== undefined) intent.context = this.params.context;
            if (this.params.query !== undefined) intent.query = this.params.query;

            const response = await persistentMemory.executeRetrieval(this.params.memory_id, intent);

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Failed to execute retrieval';
                return {
                    llmContent: `Error executing retrieval: ${errorMsg}`,
                    returnDisplay: `Error executing retrieval: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const result = response.data?.result;
            if (!result) {
                return {
                    llmContent: 'Retrieval executed but no results returned.',
                    returnDisplay: 'Retrieval executed with no results',
                };
            }

            const executionTime = result.executionTime
                ? ` (${result.executionTime}ms)`
                : '';

            return {
                llmContent: JSON.stringify(result.data, null, 2),
                returnDisplay: `Successfully executed retrieval on memory '${this.params.memory_id}'${executionTime}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error executing retrieval: ${errorMessage}`,
                returnDisplay: `Error executing retrieval: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the PersistentMemoryRetrieve tool logic
 */
export class PersistentMemoryRetrieveTool extends BaseDeclarativeTool<
    PersistentMemoryRetrieveToolParams,
    ToolResult
> {
    static readonly Name: string = 'persistent_memory_retrieve';

    constructor() {
        super(
            PersistentMemoryRetrieveTool.Name,
            'PersistentMemoryRetrieve',
            `Executes a retrieval query on a persistent memory. This allows you to fetch relevant information from the configured data source using keywords, action context, additional context, or a direct query string.`,
            Kind.Read,
            {
                properties: {
                    memory_id: {
                        description: 'The unique identifier of the persistent memory to query.',
                        type: 'string',
                    },
                    keywords: {
                        description: 'Optional array of keywords to use in the retrieval query.',
                        type: 'array',
                        items: { type: 'string' },
                    },
                    action: {
                        description: 'Optional action context that helps focus the retrieval (e.g., "find", "summarize", "compare").',
                        type: 'string',
                    },
                    context: {
                        description: 'Optional additional context as key-value pairs to guide the retrieval.',
                        type: 'object',
                    },
                    query: {
                        description: 'Optional direct query string for the retrieval.',
                        type: 'string',
                    },
                },
                required: ['memory_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: PersistentMemoryRetrieveToolParams,
    ): string | null {
        if (!params.memory_id || params.memory_id.trim() === '') {
            return "The 'memory_id' parameter must be a non-empty string.";
        }

        // Validate keywords array if provided
        if (params.keywords !== undefined) {
            if (!Array.isArray(params.keywords)) {
                return "The 'keywords' parameter must be an array of strings.";
            }
        }

        return null;
    }

    protected createInvocation(
        params: PersistentMemoryRetrieveToolParams,
    ): ToolInvocation<PersistentMemoryRetrieveToolParams, ToolResult> {
        return new PersistentMemoryRetrieveToolInvocation(params);
    }
}
