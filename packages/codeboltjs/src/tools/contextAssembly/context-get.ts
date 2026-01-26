/**
 * Context Get Tool
 * 
 * Assembles context from various memory sources.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbcontextAssembly from '../../modules/contextAssembly';
import type { ContextAssemblyRequest } from '../../types/contextAssembly';

/**
 * Parameters for getting context
 */
export interface ContextGetParams {
    /** Context assembly request */
    request: ContextAssemblyRequest;
}

class ContextGetInvocation extends BaseToolInvocation<ContextGetParams, ToolResult> {
    constructor(params: ContextGetParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbcontextAssembly.getContext(this.params.request);

            const context = response.data?.context;

            if (!context) {
                return {
                    llmContent: 'Error: Failed to get context - no context returned',
                    returnDisplay: 'Error: Failed to get context',
                    error: {
                        message: 'No context returned from get operation',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully assembled context`,
                returnDisplay: `Context assembled`,
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
 * Tool for getting context
 */
export class ContextGetTool extends BaseDeclarativeTool<ContextGetParams, ToolResult> {
    constructor() {
        super(
            'context_get',
            'Get Context',
            'Assembles context from various memory sources based on the provided request.',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    request: {
                        type: 'object',
                        description: 'Context assembly request',
                    },
                },
                required: ['request'],
            }
        );
    }

    protected override createInvocation(params: ContextGetParams): ToolInvocation<ContextGetParams, ToolResult> {
        return new ContextGetInvocation(params);
    }
}
