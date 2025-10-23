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
            // Import fsService to use existing logic
            const { fsService } = await import('../../cliLib/fsService.cli');

            // Create finalMessage object similar to mcpService.cli.ts
            const finalMessage = {
                threadId: 'codebolt-tools',
                agentInstanceId: 'codebolt-tools',
                agentId: 'codebolt-tools',
                parentAgentInstanceId: 'codebolt-tools',
                parentId: 'codebolt-tools'
            };

            // Use the exact same logic as fsService
            const result = await fsService.searchFiles(
                this.params.path,
                finalMessage,
                this.params.regex,
                this.params.filePattern
            );

            if (result && result[0] === false) {
                // Success case
                return {
                    llmContent: result[1] || 'File search completed successfully',
                    returnDisplay: result[1] || 'File search completed successfully'
                };
            } else {
                // Error case
                return {
                    llmContent: '',
                    returnDisplay: '',
                    error: {
                        type: ToolErrorType.EXECUTION_FAILED,
                        message: result[1] || 'File search failed'
                    }
                };
            }
        } catch (error) {
            return {
                llmContent: '',
                returnDisplay: '',
                error: {
                    type: ToolErrorType.EXECUTION_FAILED,
                    message: `Failed to search files: ${error.message || error}`
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
