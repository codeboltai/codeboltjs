/**
 * Git Push Tool - Pushes changes to remote
 * Wraps the SDK's gitService.push() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import gitService from '../../modules/git';

export interface GitPushParams {
    // No required parameters
}

class GitPushInvocation extends BaseToolInvocation<GitPushParams, ToolResult> {
    constructor(params: GitPushParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await gitService.push();

            if (!response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Git push failed';
                return {
                    llmContent: `Git push failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.GIT_EXECUTION_ERROR,
                    },
                };
            }

            let output = 'Pushed changes to remote';
            if (response.message) {
                output += '\n\n' + response.message;
            }

            return {
                llmContent: output,
                returnDisplay: 'Pushed changes to remote',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error pushing: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class GitPushTool extends BaseDeclarativeTool<GitPushParams, ToolResult> {
    static readonly Name: string = 'git_push';

    constructor() {
        super(
            GitPushTool.Name,
            'GitPush',
            'Pushes local commits to the remote repository.',
            Kind.Execute,
            {
                properties: {},
                required: [],
                type: 'object',
            },
        );
    }

    protected createInvocation(params: GitPushParams): ToolInvocation<GitPushParams, ToolResult> {
        return new GitPushInvocation(params);
    }
}
