/**
 * Attempt Completion Tool - Attempts to complete a task
 */
import { attemptCompletion } from '../../cliLib/mcpService.cli';

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import { Kind } from '../types';
import type { ConfigManager } from '../config';

/**
 * Parameters for the AttemptCompletion tool
 */
export interface AttemptCompletionToolParams {
    /**
     * The CLI command to execute to show a live demo of the result
     */
    command?: string;

    /**
     * The result of the task
     */
    result: string;
}

class AttemptCompletionToolInvocation extends BaseToolInvocation<
    AttemptCompletionToolParams,
    ToolResult
> {
    constructor(
        private readonly config: ConfigManager,
        params: AttemptCompletionToolParams,
    ) {
        super(params);
    }

    getDescription(): string {
        const result = this.params.result || 'task';
        return `Attempting completion: ${result}`;
    }

    async execute(
        signal: AbortSignal,
        updateOutput?: (output: string) => void,
        finalMessage?: any
    ): Promise<ToolResult> {
        try {
            // Import attemptCompletion to use existing logic

            // Create finalMessage object similar to mcpService.cli.ts
            // const finalMessage = {
            //     threadId: 'codebolt-tools',
            //     agentInstanceId: 'codebolt-tools',
            //     agentId: 'codebolt-tools',
            //     parentAgentInstanceId: 'codebolt-tools',
            //     parentId: 'codebolt-tools'
            // };

            // Use the exact same logic as mcpService.cli.ts
            const result = await attemptCompletion(this.params, finalMessage);

            if (result && Array.isArray(result) && result[0] === false) {
                // Success case - attemptCompletion returns [false, ""]
                return {
                    llmContent: typeof result[1] === 'string' ? result[1] || 'Task completion attempted successfully' : 'Task completion attempted successfully',
                    returnDisplay: typeof result[1] === 'string' ? result[1] || 'Task completion attempted successfully' : 'Task completion attempted successfully'
                };
            } else {
                // Error case
                return {
                    llmContent: '',
                    returnDisplay: '',
                    error: {
                        type: ToolErrorType.EXECUTION_FAILED,
                        message: (Array.isArray(result) && typeof result[1] === 'string') ? result[1] : 'Failed to attempt completion'
                    }
                };
            }
        } catch (error) {
            return {
                llmContent: '',
                returnDisplay: '',
                error: {
                    type: ToolErrorType.EXECUTION_FAILED,
                    message: `Failed to attempt completion: ${error.message || error}`
                }
            };
        }
    }
}

export class AttemptCompletionTool extends BaseDeclarativeTool<
    AttemptCompletionToolParams,
    ToolResult
> {
    static readonly Name: string = 'attempt_completion';

    constructor(private readonly config: ConfigManager) {
        super(
            AttemptCompletionTool.Name,
            'Attempt Completion',
            'Once you\'ve completed the task, use this tool to present the result to the user. They may respond with feedback if they are not satisfied with the result, which you can use to make improvements and try again.',
            Kind.Think,
            {
                type: 'object',
                properties: {
                    command: {
                        type: 'string',
                        description: 'The CLI command to execute to show a live demo of the result to the user. For example, use \'open index.html\' to display a created website. This should be valid for the current operating system. Ensure the command is properly formatted and does not contain any harmful instructions.'
                    },
                    result: {
                        type: 'string',
                        description: 'The result of the task. Formulate this result in a way that is final and does not require further input from the user. Don\'t end your result with questions or offers for further assistance.'
                    }
                },
                required: ['result']
            }
        );
    }

    protected override validateToolParamValues(
        params: AttemptCompletionToolParams,
    ): string | null {
        if (!params.result || params.result.trim() === '') {
            return 'Parameter "result" must be a non-empty string.';
        }
        return null;
    }

    protected createInvocation(params: AttemptCompletionToolParams) {
        return new AttemptCompletionToolInvocation(this.config, params);
    }
}
