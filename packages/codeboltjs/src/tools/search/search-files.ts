/**
 * Search Files Tool - Searches file contents using regex
 * Wraps the SDK's cbfs.searchFiles() method
 */

import * as path from 'path';
import type {
    ToolInvocation,
    ToolLocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbfs from '../../modules/fs';
import cbchat from '../../modules/chat';

/**
 * Parameters for the SearchFiles tool
 */
export interface SearchFilesToolParams {
    /**
     * One sentence explanation of why this tool is being used
     */
    explanation?: string;

    /**
     * The path to search within
     */
    path: string;

    /**
     * The regex pattern to search for in file contents
     */
    regex: string;

    /**
     * Glob pattern to filter which files to search (e.g., "*.ts")
     */
    file_pattern?: string;
}

class SearchFilesToolInvocation extends BaseToolInvocation<
    SearchFilesToolParams,
    ToolResult
> {
    constructor(params: SearchFilesToolParams) {
        super(params);
    }

    override toolLocations(): ToolLocation[] {
        return [{ path: this.params.path }];
    }

    async execute(): Promise<ToolResult> {
        try {
            if (this.params.explanation) {
                cbchat.sendMessage(this.params.explanation);
            }
            // Call the SDK's fs module
            const response = await cbfs.searchFiles(
                this.params.path,
                this.params.regex,
                this.params.file_pattern || '*'
            );

            if (!response.success) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Unknown error';
                return {
                    llmContent: `Error searching files: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.GREP_EXECUTION_ERROR,
                    },
                };
            }

            // Format the results
            // SearchFilesResponse has results?: Array<{path, matches: Array<{line, content, lineNumber}>}>
            const results = response.results || [];

            if (results.length === 0) {
                return {
                    llmContent: `No matches found for regex: "${this.params.regex}"`,
                    returnDisplay: `No matches found`,
                };
            }

            const totalMatches = results.reduce((sum: number, r) => sum + (r.matches?.length || 0), 0);

            let output = `Found ${totalMatches} match(es) in ${results.length} file(s) for regex: "${this.params.regex}"\n\n`;

            for (const result of results) {
                output += `--- ${result.path} ---\n`;

                if (result.matches && Array.isArray(result.matches)) {
                    for (const match of result.matches) {
                        const lineNum = match.line || match.lineNumber || '?';
                        output += `${lineNum}: ${match.content}\n`;
                    }
                }
                output += '\n';
            }

            return {
                llmContent: output,
                returnDisplay: `Found ${totalMatches} match(es) in ${results.length} file(s)`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error searching files: ${errorMessage}`,
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
 * Implementation of the SearchFiles tool logic
 */
export class SearchFilesTool extends BaseDeclarativeTool<
    SearchFilesToolParams,
    ToolResult
> {
    static readonly Name: string = 'search_files';

    constructor() {
        super(
            SearchFilesTool.Name,
            'SearchFiles',
            `Searches for content in files using regex patterns. Finds matching lines and their locations. Use this to find specific code patterns, text, or structures across the codebase.`,
            Kind.Search,
            {
                properties: {
                    explanation: {
                        description:
                            "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                        type: 'string',
                    },
                    path: {
                        description:
                            'The absolute path to the directory to search within.',
                        type: 'string',
                    },
                    regex: {
                        description:
                            'The regex pattern to search for in file contents.',
                        type: 'string',
                    },
                    file_pattern: {
                        description:
                            "Optional glob pattern to filter which files to search (e.g., '*.ts', '*.{js,jsx}'). Defaults to all files.",
                        type: 'string',
                    },
                },
                required: ['path', 'regex'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: SearchFilesToolParams,
    ): string | null {
        if (params.path.trim() === '') {
            return "The 'path' parameter must be non-empty.";
        }

        if (!path.isAbsolute(params.path)) {
            return `Path must be absolute, but was relative: ${params.path}.`;
        }

        if (params.regex.trim() === '') {
            return "The 'regex' parameter must be non-empty.";
        }

        // Validate regex syntax
        try {
            new RegExp(params.regex);
        } catch (e) {
            return `Invalid regex pattern: ${(e as Error).message}`;
        }

        return null;
    }

    protected createInvocation(
        params: SearchFilesToolParams,
    ): ToolInvocation<SearchFilesToolParams, ToolResult> {
        return new SearchFilesToolInvocation(params);
    }
}
