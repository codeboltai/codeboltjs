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
}

export class GitActionToolInvocation extends BaseToolInvocation<
    GitActionToolParams,
    ToolResult
> {
    constructor(params: GitActionToolParams) {
        super(GitActionTool.Name, params);
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

    async validate(): Promise<string[]> {
        const errors: string[] = [];

        // Validate required action parameter
        if (!this.params.action) {
            errors.push('Action is required');
            return errors;
        }

        // Validate action-specific required parameters
        switch (this.params.action) {
            case 'commit':
                if (!this.params.message) {
                    errors.push('Commit message is required for commit action');
                }
                break;
            case 'checkout':
            case 'branch':
                if (!this.params.branch) {
                    errors.push(`Branch name is required for ${this.params.action} action`);
                }
                break;
            case 'clone':
                if (!this.params.url) {
                    errors.push('Repository URL is required for clone action');
                }
                break;
        }

        return errors;
    }

    async execute(): Promise<ToolResult> {
        try {
            // Import gitServiceCli for execution
            const { gitServiceCli } = await import('../../cliLib/gitService.cli');

            // Map action to tool name expected by gitServiceCli
            const toolName = `git_${this.params.action}`;

            // Prepare parameters for the git service
            const gitParams: any = {};
            if (this.params.message) gitParams.message = this.params.message;
            if (this.params.branch) gitParams.branch = this.params.branch;
            if (this.params.url) gitParams.url = this.params.url;
            if (this.params.commitHash) gitParams.commitHash = this.params.commitHash;

            // Create a finalMessage object for the git service
            const finalMessage = {
                messageId: `git_${Date.now()}`,
                threadId: 'git_thread',
                agentInstanceId: 'git_agent',
                agentId: 'git',
                parentAgentInstanceId: null,
                parentId: null
            };

            // Execute the git tool using gitServiceCli
            const result = await gitServiceCli.executeTool(toolName, gitParams, finalMessage);

            if (result && result.success !== false) {
                const message = result.message || `Git ${this.params.action} completed successfully`;
                const data = result.data;

                let llmContent = message;
                if (data) {
                    if (typeof data === 'string') {
                        llmContent += `\n\n${data}`;
                    } else {
                        llmContent += `\n\n${JSON.stringify(data, null, 2)}`;
                    }
                }

                return {
                    llmContent,
                    returnDisplay: llmContent
                };
            } else {
                // Handle error case
                const errorMessage = result?.error || `Failed to execute git ${this.params.action}`;
                return {
                    llmContent: '',
                    returnDisplay: '',
                    error: {
                        type: ToolErrorType.EXECUTION_FAILED,
                        message: errorMessage
                    }
                };
            }
        } catch (error) {
            return {
                llmContent: '',
                returnDisplay: '',
                error: {
                    type: ToolErrorType.EXECUTION_FAILED,
                    message: error instanceof Error ? error.message : 'Unknown error occurred during git operation'
                }
            };
        }
    }
}
