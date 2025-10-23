/**
 * Search Files Tool - Searches for content within files
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../codeboltTools/types';
import { ToolErrorType } from '../codeboltTools/types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../codeboltTools/base-tool';
import { Kind } from '../codeboltTools/types';
import type { ConfigManager } from '../codeboltTools/config';
import { executeSearchFiles } from '../utils/search/SearchFiles';
import type { GrepMatch } from '../utils/search/GrepSearch';

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

class SearchFilesToolInvocation extends BaseToolInvocation<
    SearchFilesToolParams,
    ToolResult
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
    ): Promise<ToolResult> {
        try {
            // Use executeSearchFiles utility function
            const result = await executeSearchFiles(
                {
                    path: this.params.path,
                    regex: this.params.regex,
                    filePattern: this.params.filePattern
                },
                this.config.getTargetDir(),
                this.config.getWorkspaceContext(),
                signal
            );

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

            // Format the result for LLM and display
            const { matches } = result;
            
            if (matches.length === 0) {
                const noMatchMsg = `No matches found for pattern "${this.params.regex}" in path "${this.params.path}"${this.params.filePattern ? ` (filter: "${this.params.filePattern}")` : ''}.`;
                return { 
                    llmContent: noMatchMsg, 
                    returnDisplay: `No matches found` 
                };
            }

            // Group matches by file
            const matchesByFile = matches.reduce(
                (acc, match) => {
                    const fileKey = match.filePath;
                    if (!acc[fileKey]) {
                        acc[fileKey] = [];
                    }
                    acc[fileKey].push(match);
                    acc[fileKey].sort((a, b) => a.lineNumber - b.lineNumber);
                    return acc;
                },
                {} as Record<string, GrepMatch[]>,
            );

            const matchCount = matches.length;
            const matchTerm = matchCount === 1 ? 'match' : 'matches';

            let llmContent = `Found ${matchCount} ${matchTerm} for pattern "${this.params.regex}" in path "${this.params.path}"${this.params.filePattern ? ` (filter: "${this.params.filePattern}")` : ''}:
---
`;

            for (const filePath in matchesByFile) {
                llmContent += `File: ${filePath}\n`;
                matchesByFile[filePath]?.forEach((match) => {
                    const trimmedLine = match.line.trim();
                    llmContent += `L${match.lineNumber}: ${trimmedLine}\n`;
                });
                llmContent += '---\n';
            }

            return {
                llmContent: llmContent.trim(),
                returnDisplay: `Found ${matchCount} ${matchTerm}`,
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
    ToolResult
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
        return null;
    }

    protected createInvocation(params: SearchFilesToolParams) {
        return new SearchFilesToolInvocation(this.config, params);
    }
}