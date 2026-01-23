/**
 * Git Status Tool - Gets the status of the Git repository
 * Wraps the SDK's gitService.status() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import gitService from '../../modules/git';
import cbchat from '../../modules/chat';

export interface GitStatusParams {
    /** One sentence explanation of why this tool is being used */
    explanation?: string;
    // No required parameters
}

class GitStatusInvocation extends BaseToolInvocation<GitStatusParams, ToolResult> {
    constructor(params: GitStatusParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            if (this.params.explanation) {
                cbchat.sendMessage(this.params.explanation);
            }
            const response = await gitService.status();

            if (!response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Git status failed';
                return {
                    llmContent: `Git status failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.GIT_EXECUTION_ERROR,
                    },
                };
            }

            let output = 'Git status retrieved';
            const resp = response as any;
            if (resp.status) {
                output += '\n\n' + this.formatStatus(resp.status);
            } else if (resp.result) {
                output += '\n\n' + (typeof resp.result === 'string' ? resp.result : JSON.stringify(resp.result, null, 2));
            }

            return {
                llmContent: output,
                returnDisplay: 'Git status retrieved',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting Git status: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
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
}

export class GitStatusTool extends BaseDeclarativeTool<GitStatusParams, ToolResult> {
    static readonly Name: string = 'git_status';

    constructor() {
        super(
            GitStatusTool.Name,
            'GitStatus',
            'Retrieves the status of the Git repository.',
            Kind.Read,
            {
                properties: {
                    explanation: {
                        description: "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                        type: 'string',
                    },
                },
                required: [],
                type: 'object',
            },
        );
    }

    protected createInvocation(params: GitStatusParams): ToolInvocation<GitStatusParams, ToolResult> {
        return new GitStatusInvocation(params);
    }
}
