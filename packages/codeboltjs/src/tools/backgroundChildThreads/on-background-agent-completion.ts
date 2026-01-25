/**
 * Background Child Threads - On Background Agent Completion Tool
 * 
 * Waits for background agent completion.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import backgroundChildThreads from '../../modules/backgroundChildThreads';

/**
 * Parameters for waiting for completion (none required)
 */
export interface OnBackgroundAgentCompletionParams {
}

class OnBackgroundAgentCompletionInvocation extends BaseToolInvocation<OnBackgroundAgentCompletionParams, ToolResult> {
    constructor(params: OnBackgroundAgentCompletionParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const completion = await backgroundChildThreads.onBackgroundAgentCompletion();

            return {
                llmContent: `Background agent completed: ${JSON.stringify(completion)}`,
                returnDisplay: 'Completion received',
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
 * Tool for waiting for background agent completion
 */
export class OnBackgroundAgentCompletionTool extends BaseDeclarativeTool<OnBackgroundAgentCompletionParams, ToolResult> {
    constructor() {
        super(
            'background_threads_on_completion',
            'Wait for Background Agent Completion',
            'Waits for a background agent to complete. This is a blocking call.',
            Kind.Other,
            {
                type: 'object',
                properties: {},
                required: [],
            }
        );
    }

    protected override createInvocation(params: OnBackgroundAgentCompletionParams): ToolInvocation<OnBackgroundAgentCompletionParams, ToolResult> {
        return new OnBackgroundAgentCompletionInvocation(params);
    }
}
