/**
 * Git Clone Tool - Clones a repository
 * Wraps the SDK's gitService.clone() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import gitService from '../../modules/git';

export interface GitCloneParams {
    /** The URL of the repository to clone */
    url: string;
    /** Optional path where to clone the repository */
    path?: string;
}

class GitCloneInvocation extends BaseToolInvocation<GitCloneParams, ToolResult> {
    constructor(params: GitCloneParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await gitService.clone(this.params.url, this.params.path);

            if (!response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Git clone failed';
                return {
                    llmContent: `Git clone failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.GIT_EXECUTION_ERROR,
                    },
                };
            }

            let output = `Cloned repository from ${this.params.url}`;
            if (this.params.path) {
                output += ` to ${this.params.path}`;
            }
            if (response.message) {
                output += '\n\n' + response.message;
            }

            return {
                llmContent: output,
                returnDisplay: `Cloned repository from ${this.params.url}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error cloning repository: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class GitCloneTool extends BaseDeclarativeTool<GitCloneParams, ToolResult> {
    static readonly Name: string = 'git_clone';

    constructor() {
        super(
            GitCloneTool.Name,
            'GitClone',
            'Clones a remote Git repository.',
            Kind.Execute,
            {
                properties: {
                    url: {
                        description: 'The URL of the remote repository to clone.',
                        type: 'string',
                    },
                    path: {
                        description: 'Optional path where the repository should be cloned.',
                        type: 'string',
                    },
                },
                required: ['url'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: GitCloneParams): string | null {
        if (!params.url || params.url.trim() === '') {
            return "'url' is required for git clone";
        }
        return null;
    }

    protected createInvocation(params: GitCloneParams): ToolInvocation<GitCloneParams, ToolResult> {
        return new GitCloneInvocation(params);
    }
}
