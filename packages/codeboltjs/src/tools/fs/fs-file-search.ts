import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import fs from '../../modules/fs';
import type { FileSearchResponse } from '@codebolt/types/sdk';

export interface FsFileSearchParams {
    query: string;
}

class FsFileSearchInvocation extends BaseToolInvocation<FsFileSearchParams, ToolResult> {
    constructor(params: FsFileSearchParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: FileSearchResponse = await fs.fileSearch(this.params.query);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.message || 'Failed to perform file search'}`,
                    returnDisplay: `Error: ${response.message || 'Failed to perform file search'}`,
                    error: { message: response.message || 'Failed to perform file search', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const results = response.results || [];
            return {
                llmContent: `Found ${results.length} file(s) matching "${this.params.query}"`,
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

export class FsFileSearchTool extends BaseDeclarativeTool<FsFileSearchParams, ToolResult> {
    constructor() {
        super('fs_file_search', 'File Search', 'Perform a fuzzy search for files', Kind.FileSystem, {
            type: 'object',
            properties: {
                query: { type: 'string', description: 'Query to search for' },
            },
            required: ['query'],
        });
    }

    protected override createInvocation(params: FsFileSearchParams): ToolInvocation<FsFileSearchParams, ToolResult> {
        return new FsFileSearchInvocation(params);
    }
}
