/**
 * Git Commit Tool - Commits staged changes
 * Wraps the SDK's gitService.commit() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import gitService from '../../modules/git';
import cbchat from '../../modules/chat';

export interface GitCommitParams {
    /** One sentence explanation of why this tool is being used */
    explanation?: string;
    /** The commit message */
    message: string;
}

class GitCommitInvocation extends BaseToolInvocation<GitCommitParams, ToolResult> {
    constructor(params: GitCommitParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            if (this.params.explanation) {
                cbchat.sendMessage(this.params.explanation);
            }
            const response = await gitService.commit(this.params.message);

            if (!response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Git commit failed';
                return {
                    llmContent: `Git commit failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.GIT_EXECUTION_ERROR,
                    },
                };
            }

            let output = `Committed with message: "${this.params.message}"`;
            if (response.message) {
                output += '\n\n' + response.message;
            }

            return {
                llmContent: output,
                returnDisplay: `Committed with message: "${this.params.message}"`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error committing: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class GitCommitTool extends BaseDeclarativeTool<GitCommitParams, ToolResult> {
    static readonly Name: string = 'git_commit';

    constructor() {
        super(
            GitCommitTool.Name,
            'GitCommit',
            'Commits staged changes with a message.',
            Kind.Execute,
            {
                properties: {
                    explanation: {
                        description: "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                        type: 'string',
                    },
                    message: {
                        description: 'The commit message.',
                        type: 'string',
                    },
                },
                required: ['message'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: GitCommitParams): string | null {
        if (!params.message || params.message.trim() === '') {
            return "'message' is required for git commit";
        }
        return null;
    }

    protected createInvocation(params: GitCommitParams): ToolInvocation<GitCommitParams, ToolResult> {
        return new GitCommitInvocation(params);
    }
}
