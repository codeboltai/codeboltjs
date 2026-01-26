import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import fs from '../../modules/fs';
import type { GrepSearchResponse } from '@codebolt/types/sdk';

export interface FsGrepSearchParams {
    path: string;
    query: string;
    includePattern?: string;
    excludePattern?: string;
    caseSensitive?: boolean;
}

class FsGrepSearchInvocation extends BaseToolInvocation<FsGrepSearchParams, ToolResult> {
    constructor(params: FsGrepSearchParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: GrepSearchResponse = await fs.grepSearch(
                this.params.path,
                this.params.query,
                this.params.includePattern,
                this.params.excludePattern,
                this.params.caseSensitive !== undefined ? this.params.caseSensitive : true
            );
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.message || 'Failed to perform grep search'}`,
                    returnDisplay: `Error: ${response.message || 'Failed to perform grep search'}`,
                    error: { message: response.message || 'Failed to perform grep search', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const results = response.results || [];
            const totalMatches = results.reduce((sum, r) => sum + (r.matches?.length || 0), 0);
            return {
                llmContent: `Found ${totalMatches} match(es) for "${this.params.query}" in ${results.length} file(s)`,
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

export class FsGrepSearchTool extends BaseDeclarativeTool<FsGrepSearchParams, ToolResult> {
    constructor() {
        super('fs_grep_search', 'Grep Search', 'Perform a grep search in files', Kind.FileSystem, {
            type: 'object',
            properties: {
                path: { type: 'string', description: 'Path to search within' },
                query: { type: 'string', description: 'Query to search for' },
                includePattern: { type: 'string', description: 'Pattern of files to include' },
                excludePattern: { type: 'string', description: 'Pattern of files to exclude' },
                caseSensitive: { type: 'boolean', description: 'Whether the search is case sensitive' },
            },
            required: ['path', 'query'],
        });
    }

    protected override createInvocation(params: FsGrepSearchParams): ToolInvocation<FsGrepSearchParams, ToolResult> {
        return new FsGrepSearchInvocation(params);
    }
}
