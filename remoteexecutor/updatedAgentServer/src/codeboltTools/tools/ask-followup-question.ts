/**
 * Ask Followup Question Tool - Asks followup questions to the user
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import { Kind } from '../types';
import type { ConfigManager } from '../config';

/**
 * Parameters for the AskFollowupQuestion tool
 */
export interface AskFollowupQuestionToolParams {
    /**
     * The question to ask the user
     */
    question: string;
}

class AskFollowupQuestionToolInvocation extends BaseToolInvocation<
    AskFollowupQuestionToolParams,
    ToolResult
> {
    constructor(
        private readonly config: ConfigManager,
        params: AskFollowupQuestionToolParams,
    ) {
        super(params);
    }

    getDescription(): string {
        return `Asking followup question: ${this.params.question}`;
    }

    async execute(
        signal: AbortSignal,
        updateOutput?: (output: string) => void,
    ): Promise<ToolResult> {
        try {
            // Import askFollowupQuestion to use existing logic
            const { askFollowupQuestion } = await import('../../cliLib/mcpService.cli');

            // Create finalMessage object similar to mcpService.cli.ts
            const finalMessage = {
                threadId: 'codebolt-tools',
                agentInstanceId: 'codebolt-tools',
                agentId: 'codebolt-tools',
                parentAgentInstanceId: 'codebolt-tools',
                parentId: 'codebolt-tools'
            };

            // Use the exact same logic as mcpService.cli.ts
            const result = await askFollowupQuestion(this.params.question, finalMessage);

            if (result && result[0] === false) {
                // Success case
                return {
                    llmContent: result[1] || 'Question asked successfully',
                    returnDisplay: result[1] || 'Question asked successfully'
                };
            } else {
                // Error case
                return {
                    llmContent: '',
                    returnDisplay: '',
                    error: {
                        type: ToolErrorType.EXECUTION_FAILED,
                        message: result[1] || 'Failed to ask followup question'
                    }
                };
            }
        } catch (error) {
            return {
                llmContent: '',
                returnDisplay: '',
                error: {
                    type: ToolErrorType.EXECUTION_FAILED,
                    message: `Failed to ask followup question: ${error.message || error}`
                }
            };
        }
    }
}

export class AskFollowupQuestionTool extends BaseDeclarativeTool<
    AskFollowupQuestionToolParams,
    ToolResult
> {
    static readonly Name: string = 'ask_followup_question';

    constructor(private readonly config: ConfigManager) {
        super(
            AskFollowupQuestionTool.Name,
            'Ask Followup Question',
            'Ask the user a question to gather additional information needed to complete the task. This tool should be used when you encounter ambiguities, need clarification, or require more details to proceed effectively. It allows for interactive problem-solving by enabling direct communication with the user. Use this tool judiciously to maintain a balance between gathering necessary information and avoiding excessive back-and-forth.',
            Kind.Think,
            {
                type: 'object',
                properties: {
                    question: {
                        type: 'string',
                        description: 'The question to ask the user. This should be a clear, specific question that addresses the information you need.'
                    }
                },
                required: ['question']
            }
        );
    }

    protected override validateToolParamValues(
        params: AskFollowupQuestionToolParams,
    ): string | null {
        if (!params.question || params.question.trim() === '') {
            return 'Parameter "question" must be a non-empty string.';
        }
        return null;
    }

    protected createInvocation(params: AskFollowupQuestionToolParams) {
        return new AskFollowupQuestionToolInvocation(this.config, params);
    }
}
