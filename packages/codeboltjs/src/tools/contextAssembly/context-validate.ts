/**
 * Context Validate Tool
 * 
 * Validates a context assembly request.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbcontextAssembly from '../../modules/contextAssembly';
import type { ContextAssemblyRequest } from '../../types/contextAssembly';

/**
 * Parameters for validating context
 */
export interface ContextValidateParams {
    /** Request to validate */
    request: ContextAssemblyRequest;
}

class ContextValidateInvocation extends BaseToolInvocation<ContextValidateParams, ToolResult> {
    constructor(params: ContextValidateParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbcontextAssembly.validate(this.params.request);

            const isValid = response.payload?.isValid;

            if (isValid === undefined) {
                return {
                    llmContent: 'Error: Failed to validate context - no validation result returned',
                    returnDisplay: 'Error: Failed to validate context',
                    error: {
                        message: 'No validation result returned',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const errors = response.payload?.errors || [];
            const errorInfo = errors.length > 0 ? `\nErrors: ${errors.join(', ')}` : '';

            return {
                llmContent: `Context validation: ${isValid ? 'Valid' : 'Invalid'}${errorInfo}`,
                returnDisplay: `Validation: ${isValid ? 'Valid' : 'Invalid'}`,
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
 * Tool for validating context
 */
export class ContextValidateTool extends BaseDeclarativeTool<ContextValidateParams, ToolResult> {
    constructor() {
        super(
            'context_validate',
            'Validate Context',
            'Validates a context assembly request and returns validation errors if any.',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    request: {
                        type: 'object',
                        description: 'Request to validate',
                    },
                },
                required: ['request'],
            }
        );
    }

    protected override createInvocation(params: ContextValidateParams): ToolInvocation<ContextValidateParams, ToolResult> {
        return new ContextValidateInvocation(params);
    }
}
