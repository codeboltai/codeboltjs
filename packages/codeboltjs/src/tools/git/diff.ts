/**
 * Git Diff Tool - Gets diff for a commit
 * Wraps the SDK's gitService.diff() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import gitService from '../../modules/git';

export interface GitDiffParams {
    /** The commit hash to get diff for */
    commit_hash: string;
}

class GitDiffInvocation extends BaseToolInvocation<GitDiffParams, ToolResult> {
    constructor(params: GitDiffParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await gitService.diff(this.params.commit_hash);

            if (!response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Git diff failed';
                return {
                    llmContent: `Git diff failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.GIT_EXECUTION_ERROR,
                    },
                };
            }

            let output = `Diff for commit: ${this.params.commit_hash}`;
            const resp = response as any;
            if (resp.diff) {
                output += '\n\n' + resp.diff;
            } else if (resp.result) {
                output += '\n\n' + (typeof resp.result === 'string' ? resp.result : JSON.stringify(resp.result, null, 2));
            }

            return {
                llmContent: output,
                returnDisplay: `Diff for commit: ${this.params.commit_hash}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting Git diff: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class GitDiffTool extends BaseDeclarativeTool<GitDiffParams, ToolResult> {
    static readonly Name: string = 'git_diff';

    constructor() {
        super(
            GitDiffTool.Name,
            'GitDiff',
            'Retrieves the diff for a specific commit.',
            Kind.Read,
            {
                properties: {
                    commit_hash: {
                        description: 'The hash of the commit to get the diff for.',
                        type: 'string',
                    },
                },
                required: ['commit_hash'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: GitDiffParams): string | null {
        if (!params.commit_hash || params.commit_hash.trim() === '') {
            return "'commit_hash' is required for git diff";
        }
        return null;
    }

    protected createInvocation(params: GitDiffParams): ToolInvocation<GitDiffParams, ToolResult> {
        return new GitDiffInvocation(params);
    }
}
