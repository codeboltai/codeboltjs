/**
 * Memory JSON List Tool - Lists JSON data from memory storage
 * Wraps the SDK's cbmemory.json.list() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbmemory from '../../modules/memory';

/**
 * Parameters for the MemoryJsonList tool
 */
export interface MemoryJsonListToolParams {
    /**
     * Optional filters to apply when listing JSON entries
     */
    filters?: object;
}

class MemoryJsonListToolInvocation extends BaseToolInvocation<
    MemoryJsonListToolParams,
    ToolResult
> {
    constructor(params: MemoryJsonListToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const filters = this.params.filters || {};
            const response = await cbmemory.json.list(filters as Record<string, unknown>);

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error listing JSON from memory: ${errorMsg}`,
                    returnDisplay: `Error listing JSON from memory: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.MEMORY_TOOL_EXECUTION_ERROR,
                    },
                };
            }

            const items = response.items || [];
            const itemCount = items.length;

            return {
                llmContent: `Found ${itemCount} JSON entries in memory.\n\n${JSON.stringify(items, null, 2)}`,
                returnDisplay: `Successfully listed ${itemCount} JSON entries from memory`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error listing JSON from memory: ${errorMessage}`,
                returnDisplay: `Error listing JSON from memory: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the MemoryJsonList tool logic
 */
export class MemoryJsonListTool extends BaseDeclarativeTool<
    MemoryJsonListToolParams,
    ToolResult
> {
    static readonly Name: string = 'memory_json_list';

    constructor() {
        super(
            MemoryJsonListTool.Name,
            'MemoryJsonList',
            'Lists JSON objects from memory storage. Optionally accepts filters to narrow down the results.',
            Kind.Read,
            {
                properties: {
                    filters: {
                        description: 'Optional filters to apply when listing JSON entries. The structure depends on the memory storage implementation.',
                        type: 'object',
                    },
                },
                required: [],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: MemoryJsonListToolParams,
    ): string | null {
        if (params.filters !== undefined && params.filters !== null) {
            if (typeof params.filters !== 'object' || Array.isArray(params.filters)) {
                return "The 'filters' parameter must be a JSON object.";
            }
        }

        return null;
    }

    protected createInvocation(
        params: MemoryJsonListToolParams,
    ): ToolInvocation<MemoryJsonListToolParams, ToolResult> {
        return new MemoryJsonListToolInvocation(params);
    }
}
