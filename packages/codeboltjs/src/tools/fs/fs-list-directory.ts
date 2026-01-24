import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import fs from '../../modules/fs';
import type { ListDirectoryResponse } from '@codebolt/types/sdk';

export interface FsListDirectoryParams {
    path: string;
    ignore?: string[];
    show_hidden?: boolean;
    detailed?: boolean;
    limit?: number;
    notifyUser?: boolean;
}

class FsListDirectoryInvocation extends BaseToolInvocation<FsListDirectoryParams, ToolResult> {
    constructor(params: FsListDirectoryParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: ListDirectoryResponse = await fs.listDirectory(this.params);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.message || 'Failed to list directory'}`,
                    returnDisplay: `Error: ${response.message || 'Failed to list directory'}`,
                    error: { message: response.message || 'Failed to list directory', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const entries = response.result?.entries || [];
            return {
                llmContent: `Found ${entries.length} entr${entries.length === 1 ? 'y' : 'ies'} in ${this.params.path}`,
                returnDisplay: JSON.stringify(entries, null, 2),
            };
        } catch (error) {
            return {
                llmContent: `Error: ${error}`,
                returnDisplay: `Error: ${error}`,
                error: { message: String(error), type: ToolErrorType.EXECUTION_FAILED },
            };
        }
    }
}

export class FsListDirectoryTool extends BaseDeclarativeTool<FsListDirectoryParams, ToolResult> {
    constructor() {
        super('fs_list_directory', 'List Directory', 'List directory contents using advanced directory listing', Kind.FileSystem, {
            type: 'object',
            properties: {
                path: { type: 'string', description: 'Path to the directory to list' },
                ignore: { type: 'array', items: { type: 'string' }, description: 'Array of glob patterns for files/directories to ignore' },
                show_hidden: { type: 'boolean', description: 'Whether to show hidden files and directories' },
                detailed: { type: 'boolean', description: 'Whether to include detailed information' },
                limit: { type: 'number', description: 'Maximum number of entries to return' },
                notifyUser: { type: 'boolean', description: 'Whether to notify the user about the operation' },
            },
            required: ['path'],
        });
    }

    protected override createInvocation(params: FsListDirectoryParams): ToolInvocation<FsListDirectoryParams, ToolResult> {
        return new FsListDirectoryInvocation(params);
    }
}
