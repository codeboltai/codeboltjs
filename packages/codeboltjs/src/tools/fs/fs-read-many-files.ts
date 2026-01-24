import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import fs from '../../modules/fs';
import type { ReadManyFilesResponse } from '@codebolt/types/sdk';

export interface FsReadManyFilesParams {
    paths: string[];
    include?: string[];
    exclude?: string[];
    recursive?: boolean;
    use_default_excludes?: boolean;
    max_files?: number;
    max_total_size?: number;
    include_metadata?: boolean;
    separator_format?: string;
    notifyUser?: boolean;
}

class FsReadManyFilesInvocation extends BaseToolInvocation<FsReadManyFilesParams, ToolResult> {
    constructor(params: FsReadManyFilesParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: ReadManyFilesResponse = await fs.readManyFiles(this.params);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.message || 'Failed to read files'}`,
                    returnDisplay: `Error: ${response.message || 'Failed to read files'}`,
                    error: { message: response.message || 'Failed to read files', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const filesRead = response.result?.files_read || 0;
            return {
                llmContent: `Successfully read ${filesRead} file(s)`,
                returnDisplay: response.result?.content || '',
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

export class FsReadManyFilesTool extends BaseDeclarativeTool<FsReadManyFilesParams, ToolResult> {
    constructor() {
        super('fs_read_many_files', 'Read Many Files', 'Read multiple files based on paths, patterns, or glob expressions', Kind.FileSystem, {
            type: 'object',
            properties: {
                paths: { type: 'array', items: { type: 'string' }, description: 'Array of file paths, directory paths, or glob patterns' },
                include: { type: 'array', items: { type: 'string' }, description: 'Glob patterns for files to include' },
                exclude: { type: 'array', items: { type: 'string' }, description: 'Glob patterns for files/directories to exclude' },
                recursive: { type: 'boolean', description: 'Whether to search recursively through subdirectories' },
                use_default_excludes: { type: 'boolean', description: 'Whether to use default exclusion patterns' },
                max_files: { type: 'number', description: 'Maximum number of files to read' },
                max_total_size: { type: 'number', description: 'Maximum total size of content to read (in bytes)' },
                include_metadata: { type: 'boolean', description: 'Whether to include file metadata in output' },
                separator_format: { type: 'string', description: 'Custom separator format for file content' },
                notifyUser: { type: 'boolean', description: 'Whether to notify the user about the operation' },
            },
            required: ['paths'],
        });
    }

    protected override createInvocation(params: FsReadManyFilesParams): ToolInvocation<FsReadManyFilesParams, ToolResult> {
        return new FsReadManyFilesInvocation(params);
    }
}
