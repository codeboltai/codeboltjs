/**
 * Context List Memory Types Tool
 * 
 * Lists available memory types.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbcontextAssembly from '../../modules/contextAssembly';

/**
 * Parameters for listing memory types (none required)
 */
export interface ContextListMemoryTypesParams {
}

class ContextListMemoryTypesInvocation extends BaseToolInvocation<ContextListMemoryTypesParams, ToolResult> {
    constructor(params: ContextListMemoryTypesParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbcontextAssembly.listMemoryTypes();

            const memoryTypes = response.data?.memoryTypes;

            if (!memoryTypes) {
                return {
                    llmContent: 'Error: Failed to list memory types - no memory types returned',
                    returnDisplay: 'Error: Failed to list memory types',
                    error: {
                        message: 'No memory types returned',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Available memory types: ${memoryTypes.join(', ')}`,
                returnDisplay: `${memoryTypes.length} memory types available`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                llmContent: `Error: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Tool for listing memory types
 */
export class ContextListMemoryTypesTool extends BaseDeclarativeTool<ContextListMemoryTypesParams, ToolResult> {
    constructor() {
        super(
            'context_list_memory_types',
            'List Memory Types',
            'Lists all available memory types that can be used in context assembly.',
            Kind.Other,
            {
                type: 'object',
                properties: {},
                required: [],
            }
        );
    }

    protected override createInvocation(params: ContextListMemoryTypesParams): ToolInvocation<ContextListMemoryTypesParams, ToolResult> {
        return new ContextListMemoryTypesInvocation(params);
    }
}
