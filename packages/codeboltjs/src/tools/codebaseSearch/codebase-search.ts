/**
 * Codebase Search Tool
 * 
 * Performs semantic search across the codebase.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbcodebaseSearch from '../../modules/codebaseSearch';

/**
 * Parameters for codebase search
 */
export interface CodebaseSearchParams {
    /** The search query */
    query: string;
    /** Optional directories to limit the search */
    targetDirectories?: string[];
}

class CodebaseSearchInvocation extends BaseToolInvocation<CodebaseSearchParams, ToolResult> {
    constructor(params: CodebaseSearchParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbcodebaseSearch.search(
                this.params.query,
                this.params.targetDirectories
            );

            const results = response.results;

            if (!results) {
                return {
                    llmContent: 'Error: Failed to search codebase - no results returned',
                    returnDisplay: 'Error: Failed to search codebase',
                    error: {
                        message: 'No results returned from search operation',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const dirInfo = this.params.targetDirectories 
                ? ` in directories: ${this.params.targetDirectories.join(', ')}` 
                : '';
            return {
                llmContent: `Found ${results.length} results for query "${this.params.query}"${dirInfo}`,
                returnDisplay: `Found ${results.length} results`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                llmContent: `Error: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Tool for searching the codebase
 */
export class CodebaseSearchTool extends BaseDeclarativeTool<CodebaseSearchParams, ToolResult> {
    constructor() {
        super(
            'codebase_search',
            'Codebase Search',
            'Performs semantic search across the codebase with optional directory targeting.',
            Kind.Search,
            {
                type: 'object',
                properties: {
                    query: {
                        type: 'string',
                        description: 'The search query',
                    },
                    targetDirectories: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Optional directories to limit the search',
                    },
                },
                required: ['query'],
            }
        );
    }

    protected override createInvocation(params: CodebaseSearchParams): ToolInvocation<CodebaseSearchParams, ToolResult> {
        return new CodebaseSearchInvocation(params);
    }
}
