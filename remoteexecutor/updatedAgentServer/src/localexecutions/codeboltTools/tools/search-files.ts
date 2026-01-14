/**
 * Search Files Tool - Searches for content within files
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import { Kind } from '../types';
import type { ConfigManager } from '../config';
import { executeSearchFiles, type SearchFilesParams, type SearchFilesResult } from '../../../utils/search/SearchFiles';
import type { GrepMatch } from '../../../utils/search/GrepSearch';

/**
 * Parameters for the SearchFiles tool
 */
export interface SearchFilesToolParams {
    /**
     * The directory path to search in
     */
    path: string;

    /**
     * The regex pattern to search for
     */
    regex: string;

    /**
     * Optional file pattern to filter files
     */
    filePattern?: string;
}

/**
 * Extended ToolResult for search files that includes matches data
 */
export interface SearchFilesToolResult extends ToolResult {
    /**
     * Array of matches found
     */
    matches?: GrepMatch[];
    
    /**
     * Total number of matches found
     */
    totalMatches?: number;
}

class SearchFilesToolInvocation extends BaseToolInvocation<
    SearchFilesToolParams,
    SearchFilesToolResult
> {
    constructor(
        private readonly config: ConfigManager,
        params: SearchFilesToolParams,
    ) {
        super(params);
    }

    getDescription(): string {
        const pattern = this.params.filePattern ? ` (${this.params.filePattern})` : '';
        return `Searching files in ${this.params.path} for: ${this.params.regex}${pattern}`;
    }

    async execute(
        signal: AbortSignal,
        updateOutput?: (output: string) => void,
    ): Promise<SearchFilesToolResult> {
        try {
            // Convert tool params to utility params
            const utilParams: SearchFilesParams = {
                path: this.params.path,
                regex: this.params.regex,
                filePattern: this.params.filePattern
            };

            // Use the utility function
            const result: SearchFilesResult = await executeSearchFiles(
                utilParams,
                this.config.getTargetDir(),
                this.config.getWorkspaceContext(),
                signal
            );

            // Handle errors from utility
            if (result.error) {
                return {
                    llmContent: '',
                    returnDisplay: '',
                    error: {
                        type: ToolErrorType.EXECUTION_FAILED,
                        message: result.error.message
                    }
                };
            }

            // Handle successful result from utility
            const matches = result.matches || [];
            
            if (matches.length === 0) {
                return {
                    llmContent: 'No matches found',
                    returnDisplay: 'No matches found',
                    matches: [],
                    totalMatches: 0
                };
            }

            // Format the results similar to the original implementation
            let content = `Found ${matches.length} match${matches.length === 1 ? '' : 'es'}:\n\n`;
            
            // Group matches by file
            const matchesByFile: Record<string, typeof matches> = {};
            for (const match of matches) {
                if (!matchesByFile[match.filePath]) {
                    matchesByFile[match.filePath] = [];
                }
                matchesByFile[match.filePath].push(match);
            }
            
            // Format each file's matches
            for (const [filePath, fileMatches] of Object.entries(matchesByFile)) {
                content += `File: ${filePath}\n`;
                for (const match of fileMatches) {
                    content += `  Line ${match.lineNumber}: ${match.line.trim()}\n`;
                }
                content += '\n';
            }

            return {
                llmContent: content.trim(),
                returnDisplay: `Found ${matches.length} match${matches.length === 1 ? '' : 'es'}`,
                matches: matches,
                totalMatches: matches.length
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                llmContent: '',
                returnDisplay: '',
                error: {
                    type: ToolErrorType.EXECUTION_FAILED,
                    message: `Failed to search files: ${errorMessage}`
                }
            };
        }
    }
}

export class SearchFilesTool extends BaseDeclarativeTool<
    SearchFilesToolParams,
    SearchFilesToolResult
> {
    static readonly Name: string = 'search_files';

    constructor(private readonly config: ConfigManager) {
        super(
            SearchFilesTool.Name,
            'Search Files',
            'Perform a regex search across files in a specified directory, providing context-rich results. This tool searches for patterns or specific content across multiple files, displaying each match with encapsulating context.',
            Kind.Search,
            {
                type: 'object',
                properties: {
                    path: {
                        type: 'string',
                        description: 'The path of the directory to search in (use full path). This directory will be recursively searched.'
                    },
                    regex: {
                        type: 'string',
                        description: 'The regular expression pattern to search for. Uses Rust regex syntax.'
                    },
                    filePattern: {
                        type: 'string',
                        description: 'Optional glob pattern to filter files (e.g., \'*.ts\' for TypeScript files). If not provided, it will search all files (*).'
                    }
                },
                required: ['path', 'regex']
            }
        );
    }

    protected override validateToolParamValues(
        params: SearchFilesToolParams,
    ): string | null {
        if (!params.path || params.path.trim() === '') {
            return 'Parameter "path" must be a non-empty string.';
        }
        if (!params.regex || params.regex.trim() === '') {
            return 'Parameter "regex" must be a non-empty string.';
        }
        // Validate regex pattern
        try {
            new RegExp(params.regex);
            return null;
        } catch (e) {
            return `Invalid regex pattern: ${e instanceof Error ? e.message : String(e)}`;
        }
    }

    protected createInvocation(params: SearchFilesToolParams) {
        return new SearchFilesToolInvocation(this.config, params);
    }
}