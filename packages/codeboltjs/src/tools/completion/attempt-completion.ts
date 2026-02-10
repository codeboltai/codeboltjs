/**
 * Attempt Completion Tool - Signals the completion of a task
 */

import {
    BaseDeclarativeTool,
    BaseToolInvocation,
    Kind,
    ToolInvocation,
    ToolResult,
} from '../base-tool';

/**
 * Parameters for the AttemptCompletion tool
 */
export interface AttemptCompletionToolParams {
    /**
     * The final result of the task
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result: Record<string, any>;

    /**
     * Optional explanation of the completion
     */
    explanation?: string;
}

class AttemptCompletionToolInvocation extends BaseToolInvocation<
    AttemptCompletionToolParams,
    ToolResult
> {
    constructor(params: AttemptCompletionToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        return {
            llmContent: JSON.stringify(this.params.result, null, 2),
            returnDisplay: `Task Completed.\n\nResult:\n\`\`\`json\n${JSON.stringify(this.params.result, null, 2)}\n\`\`\``,
        };
    }
}

/**
 * Implementation of the AttemptCompletion tool
 */
export class AttemptCompletionTool extends BaseDeclarativeTool<
    AttemptCompletionToolParams,
    ToolResult
> {
    static readonly Name: string = 'attempt_completion';

    constructor() {
        super(
            AttemptCompletionTool.Name,
            'AttemptCompletion',
            'Signals the completion of the task and returns the final result.',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    result: {
                        type: 'object',
                        description: 'The final result of the task. The structure of this object should match the format specified in the system prompt.',
                        additionalProperties: true,
                    },
                    explanation: {
                        type: 'string',
                        description: 'Optional explanation of why the task is receiving this result.',
                    },
                },
                required: ['result'],
            },
        );
    }

    protected createInvocation(
        params: AttemptCompletionToolParams,
    ): ToolInvocation<AttemptCompletionToolParams, ToolResult> {
        return new AttemptCompletionToolInvocation(params);
    }
}
