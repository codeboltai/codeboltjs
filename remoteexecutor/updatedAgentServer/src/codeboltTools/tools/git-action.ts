/**
 * Git Action Tool - Performs Git operations with confirmation
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import { Kind } from '../types';
import type { ConfigManager } from '../config';
import { executeGitAction, type GitActionParams } from '../../utils/terminal/GitAction';

/**
 * Parameters for the GitAction tool
 */
export interface GitActionToolParams {
    /**
     * The git action to perform (init, add, commit, push, pull, checkout, branch, logs, diff, status, clone)
     */
    action: string;

    /**
     * Commit message (required for commit action)
     */
    message?: string;

    /**
     * Branch name (required for checkout and branch actions)
     */
    branch?: string;

    /**
     * Repository URL (required for clone action)
     */
    url?: string;

    /**
     * Commit hash (optional for diff action)
     */
    commitHash?: string;
}

class GitActionToolInvocation extends BaseToolInvocation<
    GitActionToolParams,
    ToolResult
> {
    constructor(
        private readonly config: ConfigManager,
        params: GitActionToolParams,
    ) {
        super(params);
    }

    getDescription(): string {
        const action = this.params.action;
        const details = [];

        if (this.params.message) details.push(`message: "${this.params.message}"`);
        if (this.params.branch) details.push(`branch: "${this.params.branch}"`);
        if (this.params.url) details.push(`url: "${this.params.url}"`);
        if (this.params.commitHash) details.push(`commit: "${this.params.commitHash}"`);

        const detailsStr = details.length > 0 ? ` (${details.join(', ')})` : '';
        return `Executing git ${action}${detailsStr}`;
    }

    async execute(
        signal: AbortSignal,
        updateOutput?: (output: string) => void,
    ): Promise<ToolResult> {
        try {
            // Convert tool params to utility params
            const utilParams: GitActionParams = {
                action: this.params.action,
                message: this.params.message,
                branch: this.params.branch,
                url: this.params.url,
                commitHash: this.params.commitHash
            };

            // Use the utility function
            const result = await executeGitAction(utilParams);

            // Handle errors from utility
            if (result.error) {
                return {
                    llmContent: '',
                    returnDisplay: '',
                    error: {
                        type: result.error.type as ToolErrorType,
                        message: result.error.message
                    }
                };
            }

            // Return successful result from utility
            return {
                llmContent: result.llmContent,
                returnDisplay: result.returnDisplay
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred during git operation';
            return {
                llmContent: '',
                returnDisplay: '',
                error: {
                    type: ToolErrorType.EXECUTION_FAILED,
                    message: errorMessage
                }
            };
        }
    }
}

export class GitActionTool extends BaseDeclarativeTool<
    GitActionToolParams,
    ToolResult
> {
    static readonly Name: string = 'git_action';

    constructor(private readonly config: ConfigManager) {
        super(
            GitActionTool.Name,
            'Git Action',
            'Perform Git operations such as init, add, commit, push, pull, checkout, branch creation, viewing logs, diff, status, and clone. Each operation requires user confirmation before execution for security.',
            Kind.Execute,
            {
                type: 'object',
                properties: {
                    action: {
                        type: 'string',
                        description: 'The git action to perform',
                        enum: ['init', 'add', 'commit', 'push', 'pull', 'checkout', 'branch', 'logs', 'diff', 'status', 'clone']
                    },
                    message: {
                        type: 'string',
                        description: 'Commit message (required for commit action)'
                    },
                    branch: {
                        type: 'string',
                        description: 'Branch name (required for checkout and branch actions)'
                    },
                    url: {
                        type: 'string',
                        description: 'Repository URL (required for clone action)'
                    },
                    commitHash: {
                        type: 'string',
                        description: 'Commit hash (optional for diff action)'
                    }
                },
                required: ['action']
            }
        );
    }

    protected override validateToolParamValues(
        params: GitActionToolParams,
    ): string | null {
        // Validate required action parameter
        if (!params.action) {
            return 'Action is required';
        }

        // Validate action-specific required parameters
        switch (params.action) {
            case 'commit':
                if (!params.message) {
                    return 'Commit message is required for commit action';
                }
                break;
            case 'checkout':
            case 'branch':
                if (!params.branch) {
                    return `Branch name is required for ${params.action} action`;
                }
                break;
            case 'clone':
                if (!params.url) {
                    return 'Repository URL is required for clone action';
                }
                break;
        }

        return null;
    }

    protected createInvocation(
        params: GitActionToolParams,
    ): ToolInvocation<GitActionToolParams, ToolResult> {
        return new GitActionToolInvocation(this.config, params);
    }
}