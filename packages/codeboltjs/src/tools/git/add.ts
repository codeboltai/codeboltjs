/**
 * Git Add Tool - Adds all changes to staging
 * Wraps the SDK's gitService.addAll() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import gitService from '../../modules/git';

export interface GitAddParams {
    // No required parameters - adds all changes
}

class GitAddInvocation extends BaseToolInvocation<GitAddParams, ToolResult> {
    constructor(params: GitAddParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await gitService.addAll();

            if (!response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Git add failed';
                return {
                    llmContent: `Git add failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.GIT_EXECUTION_ERROR,
                    },
                };
            }

            let output = 'Added all changes to staging';
            if (response.message) {
                output += '\n\n' + response.message;
            }

            return {
                llmContent: output,
                returnDisplay: 'Added all changes to staging',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error adding changes: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class GitAddTool extends BaseDeclarativeTool<GitAddParams, ToolResult> {
    static readonly Name: string = 'git_add';

    constructor() {
        super(
            GitAddTool.Name,
            'GitAdd',
            'Adds all changes to the Git staging area.',
            Kind.Execute,
            {
                properties: {},
                required: [],
                type: 'object',
            },
        );
    }

    protected createInvocation(params: GitAddParams): ToolInvocation<GitAddParams, ToolResult> {
        return new GitAddInvocation(params);
    }
}
