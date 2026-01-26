/**
 * Git Branch Tool - Creates a new branch
 * Wraps the SDK's gitService.branch() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import gitService from '../../modules/git';
import cbchat from '../../modules/chat';

export interface GitBranchParams {
    /** One sentence explanation of why this tool is being used */
    explanation?: string;
    /** The name of the new branch to create */
    branch: string;
}

class GitBranchInvocation extends BaseToolInvocation<GitBranchParams, ToolResult> {
    constructor(params: GitBranchParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            if (this.params.explanation) {
                cbchat.sendMessage(this.params.explanation);
            }
            const response = await gitService.branch(this.params.branch);

            if (!response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Git branch failed';
                return {
                    llmContent: `Git branch failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.GIT_EXECUTION_ERROR,
                    },
                };
            }

            let output = `Created branch: ${this.params.branch}`;
            if (response.message) {
                output += '\n\n' + response.message;
            }

            return {
                llmContent: output,
                returnDisplay: `Created branch: ${this.params.branch}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error creating branch: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class GitBranchTool extends BaseDeclarativeTool<GitBranchParams, ToolResult> {
    static readonly Name: string = 'git_branch';

    constructor() {
        super(
            GitBranchTool.Name,
            'GitBranch',
            'Creates a new branch in the Git repository.',
            Kind.Execute,
            {
                properties: {
                    explanation: {
                        description: "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                        type: 'string',
                    },
                    branch: {
                        description: 'The name of the new branch to create.',
                        type: 'string',
                    },
                },
                required: ['branch'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: GitBranchParams): string | null {
        if (!params.branch || params.branch.trim() === '') {
            return "'branch' is required for git branch";
        }
        return null;
    }

    protected createInvocation(params: GitBranchParams): ToolInvocation<GitBranchParams, ToolResult> {
        return new GitBranchInvocation(params);
    }
}
