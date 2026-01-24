/**
 * Context Get Required Variables Tool
 * 
 * Gets required variables for specific memory types.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbcontextAssembly from '../../modules/contextAssembly';

/**
 * Parameters for getting required variables
 */
export interface ContextGetRequiredVariablesParams {
    /** Array of memory type names */
    memoryNames: string[];
}

class ContextGetRequiredVariablesInvocation extends BaseToolInvocation<ContextGetRequiredVariablesParams, ToolResult> {
    constructor(params: ContextGetRequiredVariablesParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbcontextAssembly.getRequiredVariables(this.params.memoryNames);

            const variables = response.payload?.variables;

            if (!variables) {
                return {
                    llmContent: 'Error: Failed to get required variables - no variables returned',
                    returnDisplay: 'Error: Failed to get required variables',
                    error: {
                        message: 'No variables returned',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Required variables for ${this.params.memoryNames.join(', ')}: ${Object.keys(variables).length} variable(s)`,
                returnDisplay: `${Object.keys(variables).length} required variable(s)`,
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
 * Tool for getting required variables
 */
export class ContextGetRequiredVariablesTool extends BaseDeclarativeTool<ContextGetRequiredVariablesParams, ToolResult> {
    constructor() {
        super(
            'context_get_required_variables',
            'Get Required Variables',
            'Gets required variables for specific memory types.',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    memoryNames: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Array of memory type names',
                    },
                },
                required: ['memoryNames'],
            }
        );
    }

    protected override createInvocation(params: ContextGetRequiredVariablesParams): ToolInvocation<ContextGetRequiredVariablesParams, ToolResult> {
        return new ContextGetRequiredVariablesInvocation(params);
    }
}
