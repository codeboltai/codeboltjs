/**
 * Git Action Tool - Performs various Git operations
 * Wraps the SDK's gitService methods
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import gitService from '../../modules/git';

/**
 * Supported Git actions
 */
export type GitActionType =
    | 'init'
    | 'status'
    | 'add'
    | 'commit'
    | 'push'
    | 'pull'
    | 'checkout'
    | 'branch'
    | 'logs'
    | 'diff'
    | 'clone';

/**
 * Parameters for the GitAction tool
 */
export interface GitActionToolParams {
    /**
     * The Git action to perform
     */
    action: GitActionType;

    /**
     * Path for init/logs/clone operations
     */
    path?: string;

    /**
     * Commit message for commit operation
     */
    message?: string;

    /**
     * Branch name for checkout/branch operations
     */
    branch?: string;

    /**
     * Commit hash for diff operation
     */
    commit_hash?: string;

    /**
     * Repository URL for clone operation
     */
    url?: string;
}

class GitActionToolInvocation extends BaseToolInvocation<
    GitActionToolParams,
    ToolResult
> {
    constructor(params: GitActionToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const action = this.params.action;
            let response: any;
            let successMessage: string;

            switch (action) {
                case 'init':
                    if (!this.params.path) {
                        return this.createError("'path' is required for init action");
                    }
                    response = await gitService.init(this.params.path);
                    successMessage = `Initialized Git repository at ${this.params.path}`;
                    break;

                case 'status':
                    response = await gitService.status();
                    successMessage = 'Git status retrieved';
                    break;

                case 'add':
                    response = await gitService.addAll();
                    successMessage = 'Added all changes to staging';
                    break;

                case 'commit':
                    if (!this.params.message) {
                        return this.createError("'message' is required for commit action");
                    }
                    response = await gitService.commit(this.params.message);
                    successMessage = `Committed with message: "${this.params.message}"`;
                    break;

                case 'push':
                    response = await gitService.push();
                    successMessage = 'Pushed changes to remote';
                    break;

                case 'pull':
                    response = await gitService.pull();
                    successMessage = 'Pulled changes from remote';
                    break;

                case 'checkout':
                    if (!this.params.branch) {
                        return this.createError("'branch' is required for checkout action");
                    }
                    response = await gitService.checkout(this.params.branch);
                    successMessage = `Checked out branch: ${this.params.branch}`;
                    break;

                case 'branch':
                    if (!this.params.branch) {
                        return this.createError("'branch' is required for branch action");
                    }
                    response = await gitService.branch(this.params.branch);
                    successMessage = `Created branch: ${this.params.branch}`;
                    break;

                case 'logs':
                    if (!this.params.path) {
                        return this.createError("'path' is required for logs action");
                    }
                    response = await gitService.logs(this.params.path);
                    successMessage = 'Git logs retrieved';
                    break;

                case 'diff':
                    if (!this.params.commit_hash) {
                        return this.createError("'commit_hash' is required for diff action");
                    }
                    response = await gitService.diff(this.params.commit_hash);
                    successMessage = `Diff for commit: ${this.params.commit_hash}`;
                    break;

                case 'clone':
                    if (!this.params.url) {
                        return this.createError("'url' is required for clone action");
                    }
                    response = await gitService.clone(this.params.url, this.params.path);
                    successMessage = `Cloned repository from ${this.params.url}`;
                    break;

                default:
                    return this.createError(`Unknown action: ${action}`);
            }

            // Check for errors
            if (!response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Git operation failed';
                return {
                    llmContent: `Git ${action} failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.GIT_EXECUTION_ERROR,
                    },
                };
            }

            // Format output based on action
            let output = successMessage;

            if (action === 'status' && response.status) {
                output += '\n\n' + this.formatStatus(response.status);
            } else if (action === 'logs' && response.logs) {
                output += '\n\n' + this.formatLogs(response.logs);
            } else if (action === 'diff' && response.diff) {
                output += '\n\n' + response.diff;
            } else if (response.message) {
                output += '\n\n' + response.message;
            } else if (response.result) {
                output += '\n\n' + (typeof response.result === 'string' ? response.result : JSON.stringify(response.result, null, 2));
            }

            return {
                llmContent: output,
                returnDisplay: successMessage,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error executing git ${this.params.action}: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }

    private createError(message: string): ToolResult {
        return {
            llmContent: `Error: ${message}`,
            returnDisplay: `Error: ${message}`,
            error: {
                message,
                type: ToolErrorType.INVALID_TOOL_PARAMS,
            },
        };
    }

    private formatStatus(status: any): string {
        if (typeof status === 'string') return status;

        let output = '';
        if (status.current) output += `Current branch: ${status.current}\n`;
        if (status.tracking) output += `Tracking: ${status.tracking}\n`;

        if (status.files && status.files.length > 0) {
            output += '\nChanges:\n';
            for (const file of status.files) {
                const path = file.path || file;
                const index = file.index || '?';
                const working_dir = file.working_dir || '?';
                output += `  ${index}${working_dir} ${path}\n`;
            }
        } else if (status.modified || status.created || status.deleted) {
            if (status.modified?.length) {
                output += '\nModified:\n';
                status.modified.forEach((f: string) => output += `  M ${f}\n`);
            }
            if (status.created?.length) {
                output += '\nNew files:\n';
                status.created.forEach((f: string) => output += `  A ${f}\n`);
            }
            if (status.deleted?.length) {
                output += '\nDeleted:\n';
                status.deleted.forEach((f: string) => output += `  D ${f}\n`);
            }
        } else {
            output += '\nNo changes detected.';
        }

        return output;
    }

    private formatLogs(logs: any[]): string {
        if (!Array.isArray(logs)) return String(logs);

        return logs.slice(0, 10).map(log => {
            const hash = (log.hash || log.commit || '').substring(0, 7);
            const message = log.message || log.subject || '';
            const author = log.author_name || log.author || '';
            const date = log.date || '';
            return `${hash} - ${message} (${author}, ${date})`;
        }).join('\n');
    }
}

/**
 * Implementation of the GitAction tool logic
 */
export class GitActionTool extends BaseDeclarativeTool<
    GitActionToolParams,
    ToolResult
> {
    static readonly Name: string = 'git_action';

    constructor() {
        super(
            GitActionTool.Name,
            'GitAction',
            `Performs Git operations like init, status, add, commit, push, pull, checkout, branch, logs, diff, and clone. Use this for version control operations.`,
            Kind.Execute,
            {
                properties: {
                    action: {
                        description:
                            "The Git action to perform: 'init', 'status', 'add', 'commit', 'push', 'pull', 'checkout', 'branch', 'logs', 'diff', or 'clone'.",
                        type: 'string',
                        enum: ['init', 'status', 'add', 'commit', 'push', 'pull', 'checkout', 'branch', 'logs', 'diff', 'clone'],
                    },
                    path: {
                        description:
                            "Path for init/logs/clone operations.",
                        type: 'string',
                    },
                    message: {
                        description:
                            "Commit message (required for 'commit' action).",
                        type: 'string',
                    },
                    branch: {
                        description:
                            "Branch name (required for 'checkout' and 'branch' actions).",
                        type: 'string',
                    },
                    commit_hash: {
                        description:
                            "Commit hash (required for 'diff' action).",
                        type: 'string',
                    },
                    url: {
                        description:
                            "Repository URL (required for 'clone' action).",
                        type: 'string',
                    },
                },
                required: ['action'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: GitActionToolParams,
    ): string | null {
        const validActions = ['init', 'status', 'add', 'commit', 'push', 'pull', 'checkout', 'branch', 'logs', 'diff', 'clone'];
        if (!validActions.includes(params.action)) {
            return `Invalid action: ${params.action}. Must be one of: ${validActions.join(', ')}`;
        }

        // Action-specific validation
        switch (params.action) {
            case 'init':
            case 'logs':
                if (!params.path) {
                    return `'path' is required for ${params.action} action`;
                }
                break;
            case 'commit':
                if (!params.message) {
                    return "'message' is required for commit action";
                }
                break;
            case 'checkout':
            case 'branch':
                if (!params.branch) {
                    return `'branch' is required for ${params.action} action`;
                }
                break;
            case 'diff':
                if (!params.commit_hash) {
                    return "'commit_hash' is required for diff action";
                }
                break;
            case 'clone':
                if (!params.url) {
                    return "'url' is required for clone action";
                }
                break;
        }

        return null;
    }

    protected createInvocation(
        params: GitActionToolParams,
    ): ToolInvocation<GitActionToolParams, ToolResult> {
        return new GitActionToolInvocation(params);
    }
}
