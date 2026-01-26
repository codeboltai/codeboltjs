/**
 * Git Pull Tool - Pulls changes from remote
 * Wraps the SDK's gitService.pull() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import gitService from '../../modules/git';
import cbchat from '../../modules/chat';

export interface GitPullParams {
    /** One sentence explanation of why this tool is being used */
    explanation?: string;
    // No required parameters
}

class GitPullInvocation extends BaseToolInvocation<GitPullParams, ToolResult> {
    constructor(params: GitPullParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            if (this.params.explanation) {
                cbchat.sendMessage(this.params.explanation);
            }
            const response = await gitService.pull();

            if (!response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Git pull failed';
                return {
                    llmContent: `Git pull failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.GIT_EXECUTION_ERROR,
                    },
                };
            }

            let output = 'Pulled changes from remote';
            if (response.message) {
                output += '\n\n' + response.message;
            }

            return {
                llmContent: output,
                returnDisplay: 'Pulled changes from remote',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error pulling: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class GitPullTool extends BaseDeclarativeTool<GitPullParams, ToolResult> {
    static readonly Name: string = 'git_pull';

    constructor() {
        super(
            GitPullTool.Name,
            'GitPull',
            'Pulls changes from the remote repository.',
            Kind.Execute,
            {
                properties: {
                    explanation: {
                        description: "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                        type: 'string',
                    },
                },
                required: [],
                type: 'object',
            },
        );
    }

    protected createInvocation(params: GitPullParams): ToolInvocation<GitPullParams, ToolResult> {
        return new GitPullInvocation(params);
    }
}
