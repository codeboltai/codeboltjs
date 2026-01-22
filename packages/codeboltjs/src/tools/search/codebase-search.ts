/**
 * Codebase Search Tool - Semantic search across the codebase
 * Wraps the SDK's codebaseSearch.search() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codebaseSearch from '../../modules/codebaseSearch';

/**
 * Parameters for the CodebaseSearch tool
 */
export interface CodebaseSearchToolParams {
    /**
     * The search query - describe what you're looking for semantically
     */
    query: string;

    /**
     * Optional directories to limit the search scope
     */
    target_directories?: string[];
}

class CodebaseSearchToolInvocation extends BaseToolInvocation<
    CodebaseSearchToolParams,
    ToolResult
> {
    constructor(params: CodebaseSearchToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            // Call the SDK's codebaseSearch module
            const response = await codebaseSearch.search(
                this.params.query,
                this.params.target_directories
            );

            // CodebaseSearchResponse has {success, results: CodeSearchResult[], message?}
            if (!response.success) {
                const errorMsg = response.message || 'Unknown error';
                return {
                    llmContent: `Error searching codebase: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            // Format the results
            // CodeSearchResult has {file, content, language, startLine?, endLine?, score?}
            const results = response.results || [];

            if (results.length === 0) {
                return {
                    llmContent: `No results found for query: "${this.params.query}"`,
                    returnDisplay: `No results found`,
                };
            }

            let output = `Found ${results.length} result(s) for: "${this.params.query}"\n\n`;

            for (const result of results) {
                const filePath = result.file;
                const score = result.score;

                output += `--- ${filePath}${score !== undefined ? ` (score: ${score.toFixed(2)})` : ''} ---\n`;
                if (result.content) {
                    output += `${result.content}\n`;
                }
                output += '\n';
            }

            return {
                llmContent: output,
                returnDisplay: `Found ${results.length} result(s)`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error searching codebase: ${errorMessage}`,
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
 * Implementation of the CodebaseSearch tool logic
 */
export class CodebaseSearchTool extends BaseDeclarativeTool<
    CodebaseSearchToolParams,
    ToolResult
> {
    static readonly Name: string = 'codebase_search';

    constructor() {
        super(
            CodebaseSearchTool.Name,
            'CodebaseSearch',
            `Performs semantic search across the codebase. Use natural language to describe what you're looking for - it understands code concepts, not just literal text matches. Great for finding implementations, understanding patterns, or locating relevant code.`,
            Kind.Search,
            {
                properties: {
                    query: {
                        description:
                            "Natural language description of what you're looking for (e.g., 'function that handles user authentication', 'error handling for API requests').",
                        type: 'string',
                    },
                    target_directories: {
                        description:
                            'Optional array of directory paths to limit the search scope.',
                        type: 'array',
                        items: { type: 'string' },
                    },
                },
                required: ['query'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: CodebaseSearchToolParams,
    ): string | null {
        if (params.query.trim() === '') {
            return "The 'query' parameter must be non-empty.";
        }

        return null;
    }

    protected createInvocation(
        params: CodebaseSearchToolParams,
    ): ToolInvocation<CodebaseSearchToolParams, ToolResult> {
        return new CodebaseSearchToolInvocation(params);
    }
}
