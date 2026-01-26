/**
 * Background Child Threads - Check Background Agent Completion Tool
 * 
 * Checks if any background agent has completed.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import backgroundChildThreads from '../../modules/backgroundChildThreads';

/**
 * Parameters for checking completion (none required)
 */
export interface CheckBackgroundAgentCompletionParams {
}

class CheckBackgroundAgentCompletionInvocation extends BaseToolInvocation<CheckBackgroundAgentCompletionParams, ToolResult> {
    constructor(params: CheckBackgroundAgentCompletionParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const completion = backgroundChildThreads.checkForBackgroundAgentCompletion();

            if (completion) {
                return {
                    llmContent: `Background agent completion found: ${JSON.stringify(completion)}`,
                    returnDisplay: 'Completion found',
                };
            } else {
                return {
                    llmContent: 'No background agent completions available',
                    returnDisplay: 'No completions',
                };
            }
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
 * Tool for checking background agent completion
 */
export class CheckBackgroundAgentCompletionTool extends BaseDeclarativeTool<CheckBackgroundAgentCompletionParams, ToolResult> {
    constructor() {
        super(
            'background_threads_check_completion',
            'Check Background Agent Completion',
            'Checks if any background agent has completed. Returns completion data or null.',
            Kind.Other,
            {
                type: 'object',
                properties: {},
                required: [],
            }
        );
    }

    protected override createInvocation(params: CheckBackgroundAgentCompletionParams): ToolInvocation<CheckBackgroundAgentCompletionParams, ToolResult> {
        return new CheckBackgroundAgentCompletionInvocation(params);
    }
}
