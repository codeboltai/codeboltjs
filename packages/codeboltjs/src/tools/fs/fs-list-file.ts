import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import fs from '../../modules/fs';
import type { FileListResponse } from '@codebolt/types/sdk';

export interface FsListFileParams {
    folderPath: string;
    isRecursive?: boolean;
}

class FsListFileInvocation extends BaseToolInvocation<FsListFileParams, ToolResult> {
    constructor(params: FsListFileParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: FileListResponse = await fs.listFile(this.params.folderPath, this.params.isRecursive || false);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.message || 'Failed to list files'}`,
                    returnDisplay: `Error: ${response.message || 'Failed to list files'}`,
                    error: { message: response.message || 'Failed to list files', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const files = response.result?.files || [];
            return {
                llmContent: `Found ${files.length} file(s) in ${this.params.folderPath}`,
                returnDisplay: JSON.stringify(files, null, 2),
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

export class FsListFileTool extends BaseDeclarativeTool<FsListFileParams, ToolResult> {
    constructor() {
        super('fs_list_file', 'List Files', 'List files in a directory', Kind.FileSystem, {
            type: 'object',
            properties: {
                folderPath: { type: 'string', description: 'Path to list files from' },
                isRecursive: { type: 'boolean', description: 'Whether to list files recursively' },
            },
            required: ['folderPath'],
        });
    }

    protected override createInvocation(params: FsListFileParams): ToolInvocation<FsListFileParams, ToolResult> {
        return new FsListFileInvocation(params);
    }
}
