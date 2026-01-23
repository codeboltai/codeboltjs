/**
 * Git Checkout Tool - Checks out a branch
 * Wraps the SDK's gitService.checkout() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import gitService from '../../modules/git';
import cbchat from '../../modules/chat';

export interface GitCheckoutParams {
    /** One sentence explanation of why this tool is being used */
    explanation?: string;
    /** The branch name to checkout */
    branch: string;
}

class GitCheckoutInvocation extends BaseToolInvocation<GitCheckoutParams, ToolResult> {
    constructor(params: GitCheckoutParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            if (this.params.explanation) {
                cbchat.sendMessage(this.params.explanation);
            }
            const response = await gitService.checkout(this.params.branch);

            if (!response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Git checkout failed';
                return {
                    llmContent: `Git checkout failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.GIT_EXECUTION_ERROR,
                    },
                };
            }

            let output = `Checked out branch: ${this.params.branch}`;
            if (response.message) {
                output += '\n\n' + response.message;
            }

            return {
                llmContent: output,
                returnDisplay: `Checked out branch: ${this.params.branch}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error checking out branch: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class GitCheckoutTool extends BaseDeclarativeTool<GitCheckoutParams, ToolResult> {
    static readonly Name: string = 'git_checkout';

    constructor() {
        super(
            GitCheckoutTool.Name,
            'GitCheckout',
            'Checks out a branch in the Git repository.',
            Kind.Execute,
            {
                properties: {
                    explanation: {
                        description: "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                        type: 'string',
                    },
                    branch: {
                        description: 'The name of the branch to checkout.',
                        type: 'string',
                    },
                },
                required: ['branch'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: GitCheckoutParams): string | null {
        if (!params.branch || params.branch.trim() === '') {
            return "'branch' is required for git checkout";
        }
        return null;
    }

    protected createInvocation(params: GitCheckoutParams): ToolInvocation<GitCheckoutParams, ToolResult> {
        return new GitCheckoutInvocation(params);
    }
}
