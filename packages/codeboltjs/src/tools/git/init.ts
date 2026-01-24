/**
 * Git Init Tool - Initializes a new Git repository
 * Wraps the SDK's gitService.init() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import gitService from '../../modules/git';
import cbchat from '../../modules/chat';

export interface GitInitParams {
    /** One sentence explanation of why this tool is being used */
    explanation?: string;
    /** Path where to initialize the Git repository */
    path: string;
}

class GitInitInvocation extends BaseToolInvocation<GitInitParams, ToolResult> {
    constructor(params: GitInitParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            if (this.params.explanation) {
                cbchat.sendMessage(this.params.explanation);
            }
            const response = await gitService.init(this.params.path);

            if (!response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Git init failed';
                return {
                    llmContent: `Git init failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.GIT_EXECUTION_ERROR,
                    },
                };
            }

            let output = `Initialized Git repository at ${this.params.path}`;
            if (response.message) {
                output += '\n\n' + response.message;
            }

            return {
                llmContent: output,
                returnDisplay: `Initialized Git repository at ${this.params.path}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error initializing Git repository: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class GitInitTool extends BaseDeclarativeTool<GitInitParams, ToolResult> {
    static readonly Name: string = 'git_init';

    constructor() {
        super(
            GitInitTool.Name,
            'GitInit',
            'Initializes a new Git repository at the specified path.',
            Kind.Execute,
            {
                properties: {
                    explanation: {
                        description: "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                        type: 'string',
                    },
                    path: {
                        description: 'The file system path where the Git repository should be initialized.',
                        type: 'string',
                    },
                },
                required: ['path'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: GitInitParams): string | null {
        if (!params.path || params.path.trim() === '') {
            return "'path' is required for git init";
        }
        return null;
    }

    protected createInvocation(params: GitInitParams): ToolInvocation<GitInitParams, ToolResult> {
        return new GitInitInvocation(params);
    }
}
