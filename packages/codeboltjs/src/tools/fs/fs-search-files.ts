import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import fs from '../../modules/fs';
import type { SearchFilesResponse } from '@codebolt/types/sdk';

export interface FsSearchFilesParams {
    path: string;
    regex: string;
    filePattern: string;
}

class FsSearchFilesInvocation extends BaseToolInvocation<FsSearchFilesParams, ToolResult> {
    constructor(params: FsSearchFilesParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: SearchFilesResponse = await fs.searchFiles(this.params.path, this.params.regex, this.params.filePattern);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.message || 'Failed to search files'}`,
                    returnDisplay: `Error: ${response.message || 'Failed to search files'}`,
                    error: { message: response.message || 'Failed to search files', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const results = response.result?.matches || [];
            return {
                llmContent: `Found ${results.length} match(es) in files`,
                returnDisplay: JSON.stringify(results, null, 2),
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

export class FsSearchFilesTool extends BaseDeclarativeTool<FsSearchFilesParams, ToolResult> {
    constructor() {
        super('fs_search_files', 'Search Files', 'Search files using regex pattern', Kind.FileSystem, {
            type: 'object',
            properties: {
                path: { type: 'string', description: 'Path to search within' },
                regex: { type: 'string', description: 'Regex pattern to search for' },
                filePattern: { type: 'string', description: 'File pattern to match files' },
            },
            required: ['path', 'regex', 'filePattern'],
        });
    }

    protected override createInvocation(params: FsSearchFilesParams): ToolInvocation<FsSearchFilesParams, ToolResult> {
        return new FsSearchFilesInvocation(params);
    }
}
