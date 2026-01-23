/**
 * Git Logs Tool - Gets commit logs
 * Wraps the SDK's gitService.logs() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import gitService from '../../modules/git';

export interface GitLogsParams {
    /** Path to get logs for */
    path: string;
}

class GitLogsInvocation extends BaseToolInvocation<GitLogsParams, ToolResult> {
    constructor(params: GitLogsParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await gitService.logs(this.params.path);

            if (!response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Git logs failed';
                return {
                    llmContent: `Git logs failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.GIT_EXECUTION_ERROR,
                    },
                };
            }

            let output = 'Git logs retrieved';
            const resp = response as any;
            if (resp.logs) {
                output += '\n\n' + this.formatLogs(resp.logs);
            } else if (resp.result) {
                output += '\n\n' + (typeof resp.result === 'string' ? resp.result : JSON.stringify(resp.result, null, 2));
            }

            return {
                llmContent: output,
                returnDisplay: 'Git logs retrieved',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting Git logs: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
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

export class GitLogsTool extends BaseDeclarativeTool<GitLogsParams, ToolResult> {
    static readonly Name: string = 'git_logs';

    constructor() {
        super(
            GitLogsTool.Name,
            'GitLogs',
            'Retrieves the commit logs for the Git repository.',
            Kind.Read,
            {
                properties: {
                    path: {
                        description: 'The file system path to get logs for.',
                        type: 'string',
                    },
                },
                required: ['path'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: GitLogsParams): string | null {
        if (!params.path || params.path.trim() === '') {
            return "'path' is required for git logs";
        }
        return null;
    }

    protected createInvocation(params: GitLogsParams): ToolInvocation<GitLogsParams, ToolResult> {
        return new GitLogsInvocation(params);
    }
}
